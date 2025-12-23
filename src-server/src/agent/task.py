import asyncio
import queue
import threading
from collections.abc import Generator
from enum import Enum
from loguru import logger
from liteai_sdk import LLM, AssistantMessageChunk, LlmRequestParams, SystemMessage, ToolMessage
from .context import AgentContext
from .tools import attempt_completion, ask_user
from ..db.models import task as task_models
from ..utils import use_async_task_pool

class AgentTaskSentinel(str, Enum):
    Done = "DONE"
    MessageStart = "MESSAGE_START"
    MessageEnd = "MESSAGE_END"

AgentTaskChunk = AssistantMessageChunk | ToolMessage | AgentTaskSentinel | Exception

class AgentTask:
    _logger = logger.bind(name="AgentTask")

    def __init__(self, task: task_models.Task):
        self._lock = threading.Lock()
        ctx = self._ctx = AgentContext(task.workspace_id, task.agent_id)
        self.llm = LLM(
            provider=ctx.provider.type,
            base_url=ctx.provider.base_url,
            api_key=ctx.provider.api_key)
        self.model_id = ctx.model.name
        self._is_running = True
        self._current_task_id = None
        self._messages = task.messages

    async def _create_llm_call(self, chunk_queue: queue.Queue[AgentTaskChunk]):
        chunk_queue.put_nowait(AgentTaskSentinel.MessageStart)
        try:
            stream, message_queue = await self.llm.stream_text(LlmRequestParams(
                model=self.model_id,
                messages=[
                    SystemMessage(content=self._ctx.system_instruction),
                    *self._messages
                ],
                tools=[ask_user, attempt_completion]
            ))
        except Exception as e:
            self._logger.exception(f"Failed to create llm call: {e}")
            chunk_queue.put_nowait(e)
            chunk_queue.put_nowait(AgentTaskSentinel.MessageEnd)
            return
        async for chunk in stream:
            chunk_queue.put_nowait(chunk)
        while (message := await message_queue.get()) is not None:
            if message.role == "tool":
                chunk_queue.put_nowait(message)
            with self._lock:
                self._messages.append(message)
        chunk_queue.put_nowait(AgentTaskSentinel.MessageEnd)

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
            try:
                while self.is_running:
                    try:
                        chunk = chunk_queue.get(timeout=1)
                    except queue.Empty: continue
                    yield chunk
            except asyncio.CancelledError:
                self._logger.info("Task cancelled")
            except Exception as e:
                self._logger.exception(f"Async task failed: {e}")
                break

    def stop(self):
        if self._current_task_id:
            async_task_pool = use_async_task_pool()
            async_task_pool.cancel(self._current_task_id)
        self._is_running = False
