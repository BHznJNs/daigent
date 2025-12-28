import asyncio
import queue
import threading
from collections.abc import Generator
from loguru import logger
from liteai_sdk import LLM, AssistantMessage, LlmRequestParams,\
                       SystemMessage, ToolMessage, UserMessage, execute_tool_sync
from .context import AgentContext
from .tools import finish_task, ask_user, FileSystemTool
from .types import AgentTaskChunk, AgentTaskSentinel, ToolResult
from ..services.task import TaskService
from ..db.models import task as task_models
from ..utils import use_async_task_pool, TaskNotFoundError as AsyncTaskNotFoundError

class ToolCallNotFoundError(Exception):
    tool_call_id: str

class AgentTask:
    _logger = logger.bind(name="AgentTask")

    def __init__(self, task: task_models.Task):
        self._lock = threading.Lock()
        ctx = self._ctx = AgentContext(task.workspace_id, task.agent_id)
        self.llm = LLM(
            provider=ctx.provider.type,
            base_url=ctx.provider.base_url,
            api_key=ctx.provider.api_key)
        self.task_id = task.id
        self.model_id = ctx.model.name
        self._is_running = True
        self._current_task_id = None
        self._messages = task.messages
        self._init_builtin_tools()

    def __del__(self):
        self.stop()
        self.persist()

    def _init_builtin_tools(self):
        self._file_system_tool = FileSystemTool(self._ctx.workspace.directory)

    async def _create_llm_call(self,
                               chunk_queue: queue.Queue[AgentTaskChunk]
                               ) -> ToolMessage | None:
        """
        Create a LLM API call, put the message chunks into chunk_queue
        and return the first tool call message.
        """
        assistant_message: AssistantMessage | None = None
        try:
            stream, message_queue = await self.llm.stream_text(LlmRequestParams(
                model=self.model_id,
                messages=[
                    SystemMessage(content=self._ctx.system_instruction),
                    *self._messages,
                ],
                tools=[
                    ask_user,
                    finish_task,
                    self._file_system_tool.read_file,
                ],
                tool_choice="required",
            ))
            chunk_queue.put_nowait((AgentTaskSentinel.MessageStart, None))
            async for chunk in stream:
                chunk_queue.put_nowait(chunk)

            # Since we did not set `execute_tools` flag,
            # there will be only one assistant message in the queue
            first_message = await message_queue.get()
            assert type(first_message) == AssistantMessage
            assistant_message = first_message
            chunk_queue.put_nowait((AgentTaskSentinel.MessageEnd, None))
        except asyncio.CancelledError:
            chunk_queue.put_nowait((AgentTaskSentinel.Interrupted, None))
            raise
        except Exception as e:
            self._logger.exception(f"Failed to create llm call: {e}")
            chunk_queue.put_nowait(e)

        if assistant_message is None: return None

        with self._lock:
            self._messages.append(assistant_message)

        if not assistant_message.tool_calls\
            or len(assistant_message.tool_calls) == 0: return None

        # only keep the first tool call
        assistant_message.tool_calls = assistant_message.tool_calls[:1]
        partial_tool_messages = assistant_message.get_partial_tool_messages()
        if partial_tool_messages is None or len(partial_tool_messages) == 0:
            return None

        tool_call_message = partial_tool_messages[0]
        with self._lock:
            self._messages.append(tool_call_message)
        return tool_call_message

    def _process_tool_call(self,
                           tool_call_message: ToolMessage,
                           ) -> ToolResult | None:
        if tool_call_message.tool_def in [ask_user, finish_task]:
            pass

        if tool_call_message.tool_def is None:
            # skip the tool call message without tool_def
            return None

        result, error = None, None
        try:
            result = execute_tool_sync(tool_call_message.tool_def,
                                       tool_call_message.arguments)
        except Exception as e:
            error = f"{type(e).__name__}: {str(e)}"

        tool_call_message.result = result
        tool_call_message.error = error
        return ToolResult(tool_call_id=tool_call_message.id,
                          result=result if error is None else None)

    @property
    def is_running(self) -> bool:
        return self._is_running

    def append_message(self, message: UserMessage):
        try:
            last_message = self._messages[-1]
        except IndexError:
            last_message = None
        
        if last_message and\
           last_message.role == "tool" and\
           last_message.result is None and \
           last_message.error is None:
            # set the last incomplete ToolMessage as ignored
            last_message.result = "[System Message] User ignored this tool call."

        self._messages.append(message)

    def set_tool_call_result(self, tool_call_id: str, result: str):
        """
        Raises:
            ToolCallNotFoundError
        """
        for message in self._messages:
            if message.role == "tool" and message.id == tool_call_id:
                message.result = result
                break
        raise ToolCallNotFoundError(tool_call_id)

    def run(self) -> Generator[AgentTaskChunk]:
        async_task_pool = use_async_task_pool()
        while self._is_running:
            chunk_queue = queue.Queue[AgentTaskChunk]()
            self._current_task_id = async_task_pool.add_task(self._create_llm_call(chunk_queue))

            while self._is_running:
                try:
                    chunk = chunk_queue.get(timeout=0.3)
                except queue.Empty: continue

                yield chunk
                match chunk:
                    case (AgentTaskSentinel.MessageEnd |\
                          AgentTaskSentinel.Interrupted, _): break
                    case Exception(): break

            try:
                tool_call_message = async_task_pool.wait_result(self._current_task_id)
            except AsyncTaskNotFoundError:
                # the task is cancelled by user
                break

            if tool_call_message is None:
                # there is some exceptions when creating llm call
                break

            self._process_tool_call(tool_call_message)

        yield (AgentTaskSentinel.Done, None)

    def persist(self):
        with TaskService() as task_service:
            task_service.update_task(self.task_id, {"messages": self._messages})

    def stop(self):
        with self._lock:
            self._is_running = False
            if self._current_task_id:
                async_task_pool = use_async_task_pool()
                async_task_pool.cancel(self._current_task_id)
