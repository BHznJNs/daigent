import asyncio
import threading
import uuid
from concurrent.futures import Future
from collections.abc import Coroutine
from dataclasses import dataclass, field
from typing import Any, Generic, TypeVar

TASK_RET = TypeVar("TASK_RET")

@dataclass(frozen=True)
class TaskId(Generic[TASK_RET]):
    uid: uuid.UUID = field(default_factory=uuid.uuid4)

class TaskNotFoundError(Exception): pass

class AsyncTaskPool(threading.Thread):
    def __init__(self):
        super().__init__(daemon=True)
        self._lock = threading.Lock()
        self._loop = asyncio.new_event_loop()
        self._tasks: dict[TaskId, Future] = {}

    def add_task(self, coro: Coroutine[Any, Any, TASK_RET]) -> TaskId[TASK_RET]:
        task_id = TaskId[TASK_RET]()
        future = asyncio.run_coroutine_threadsafe(coro, self._loop)
        with self._lock:
            self._tasks[task_id] = future
        return task_id

    def wait_result(self, task_id: TaskId[TASK_RET]) -> TASK_RET:
        if task_id not in self._tasks:
            raise TaskNotFoundError(f"Task {task_id} not found")

        with self._lock:
            future = self._tasks[task_id]

        try:
            result = future.result()
            return result
        finally:
            with self._lock:
                del self._tasks[task_id]

    def cancel(self, task_id: TaskId) -> bool:
        with self._lock:
            if task_id not in self._tasks:
                return False
            future = self._tasks[task_id]

        was_cancelled = future.cancel()
        self._tasks.pop(task_id)
        return was_cancelled

    def run(self):
        asyncio.set_event_loop(self._loop)
        try:
            self._loop.run_forever()
        finally:
            self._loop.run_until_complete(self._loop.shutdown_asyncgens())
            self._loop.close()

    def close(self):
        if not self._loop.is_running(): return

        self._loop.call_soon_threadsafe(self._loop.stop)
        with self._lock:
            for fut in self._tasks.values(): fut.cancel()
            self._tasks.clear()

__instance = AsyncTaskPool()
__instance.start()

def use_async_task_pool() -> AsyncTaskPool:
    return __instance
