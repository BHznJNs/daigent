from . import DTOBase
from ..models.task import MessageRole, TaskType

class TaskMessage(DTOBase):
    role: MessageRole
    content: str
    metadata: dict[str, str]

class TaskBase(DTOBase):
    title: str
    type: TaskType
    messages: list[TaskMessage]

class TaskRead(TaskBase):
    id: int
    agent_id: int | None = None
    workspace_id: int

class TaskCreate(TaskBase):
    agent_id: int
    workspace_id: int

class TaskUpdate(DTOBase):
    title: str | None = None
    messages: list[TaskMessage] | None = None
    agent_id: int | None = None
