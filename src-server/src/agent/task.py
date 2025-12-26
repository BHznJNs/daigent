import asyncio
import queue
import threading
from collections.abc import Generator
from enum import Enum
from loguru import logger
from liteai_sdk import LLM, LlmRequestParams, SystemMessage, MessageChunk, ToolCallChunk
from .context import AgentContext
from .tools import attempt_completion, ask_user
from ..services.task import TaskService
from ..db.models import task as task_models
from ..utils import use_async_task_pool

class AgentTaskSentinel(str, Enum):
    Done = "DONE"
    Interrupted = "INTERRUPTED"
    MessageStart = "MESSAGE_START"
    MessageEnd = "MESSAGE_END"

AgentTaskChunk = MessageChunk | AgentTaskSentinel | Exception

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

    async def _create_llm_call(self, chunk_queue: queue.Queue[AgentTaskChunk]):
        try:
            stream, message_queue = await self.llm.stream_text(LlmRequestParams(
                model=self.model_id,
                messages=[
                    SystemMessage(content=self._ctx.system_instruction),
                    *self._messages
                ],
                tools=[ask_user, attempt_completion]
            ))
            async for chunk in stream:
                chunk_queue.put_nowait(chunk)
            while (message := await message_queue.get()) is not None:
                with self._lock:
                    self._messages.append(message)
            chunk_queue.put_nowait(AgentTaskSentinel.MessageEnd)
        except asyncio.CancelledError:
            chunk_queue.put_nowait(AgentTaskSentinel.Interrupted)
            raise
        except Exception as e:
            self._logger.exception(f"Failed to create llm call: {e}")
            chunk_queue.put_nowait(e)

    @property
    def is_running(self) -> bool:
        return self._is_running

    def append_message(self, message: task_models.TaskMessage):
        self._messages.append(message)

    def run(self) -> Generator[AgentTaskChunk]:
        async_task_pool = use_async_task_pool()
        while self._is_running:
            chunk_queue = queue.Queue[AgentTaskChunk]()
            self._current_task_id = async_task_pool.append(self._create_llm_call(chunk_queue))

            has_called_tool = False
            while self._is_running:
                try:
                    chunk = chunk_queue.get(timeout=0.3)
                except queue.Empty: continue

                if type(chunk) is ToolCallChunk:
                    has_called_tool = True

                yield chunk
                match chunk:
                    case AgentTaskSentinel.MessageEnd | AgentTaskSentinel.Interrupted:
                        break
                    case Exception():
                        break

            if has_called_tool: break

        yield AgentTaskSentinel.Done

    def persist(self):
        with TaskService() as task_service:
            task_service.update_task(self.task_id, {"messages": self._messages})

    def stop(self):
        with self._lock:
            self._is_running = False
            if self._current_task_id:
                async_task_pool = use_async_task_pool()
                async_task_pool.cancel(self._current_task_id)
