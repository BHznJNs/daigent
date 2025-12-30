import threading
from .task import AgentTask
from ..services.task import TaskService

class AgentTaskPool:
    def __init__(self):
        self._lock = threading.RLock()
        self._pool: dict[int, AgentTask] = {}

    def add(self, task_id: int) -> AgentTask:
        """
        Receives a task_id to retrieve the task from the database and create an AgentTask instance.
        If the task is already in the pool, it returns the existing instance.
        Otherwise, it creates a new instance, adds it to the pool and return it.
        """
        with self._lock:
            if task_id in self._pool:
                return self._pool[task_id]
            with TaskService() as task_service:
                task = task_service.get_task_by_id(task_id)
            self._pool[task_id] = AgentTask(task)
            return self._pool[task_id]

    def remove(self, task_id: int):
        with self._lock:
            if (task := self._pool.pop(task_id, None)) is None:
                return
            task.persist()

    def stop(self, task_id: int):
        with self._lock:
            if (task := self._pool.pop(task_id, None)) is None:
                return
            task.stop()
            task.persist()

    def get(self, task_id: int) -> AgentTask | None:
        with self._lock:
            return self._pool.get(task_id)

    def has(self, task_id: int) -> bool:
        with self._lock:
            return task_id in self._pool
