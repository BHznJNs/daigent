import enum
import dataclasses
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from . import Base
from .agent import Agent
from .workspace import Workspace
from .utils import DataclassListJSON

class TaskType(str, enum.Enum):
    Agent = "agent"
    Orchestration = "orchestration"

class MessageRole(str, enum.Enum):
    User = "user"
    Assistant = "assistant"
    System = "system"
    Tool = "tool"

@dataclasses.dataclass
class TaskMessage:
    """
    Metadata:
    - For user messages, optional "files"
    - For assistant messages, optional "reasoning_content"
    - For system messages, no metadata
    - For tool messages, "id", "name", "arguments"
    """
    role: MessageRole
    content: str
    metadata: dict[str, str]

class Task(Base):
    __tablename__ = "tasks"
    id: Mapped[int] = mapped_column(primary_key=True)
    type: Mapped[TaskType]
    title: Mapped[str]
    messages: Mapped[list[TaskMessage]] = mapped_column(DataclassListJSON(TaskMessage))
    agent_id: Mapped[int] = mapped_column(ForeignKey(Agent.id, ondelete="SET NULL"), nullable=True)
    agent = relationship("Agent", back_populates="tasks")
    workspace_id: Mapped[int] = mapped_column(ForeignKey(Workspace.id))
    workspace = relationship("Workspace", back_populates="tasks")
