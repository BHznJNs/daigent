import enum
import dataclasses
from typing import Literal
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from . import Base
from .agent import Agent
from .workspace import Workspace
from .utils import DataclassListJSON

class TaskType(enum.Enum):
    Agent = "agent"
    Orchestration = "orchestration"

@dataclasses.dataclass
class TaskMessage:
    id: int
    role: Literal["user", "assistant", "tool"]
    content: str
    metadata: dict[str, str]

class Task(Base):
    __tablename__ = "tasks"
    id: Mapped[int] = mapped_column(primary_key=True)
    type: Mapped[TaskType]
    name: Mapped[str]
    messages: Mapped[list[TaskMessage]] = mapped_column(DataclassListJSON(TaskMessage))
    agent_id: Mapped[int] = mapped_column(ForeignKey(Agent.id, ondelete="SET NULL"), nullable=True)
    agent = relationship("Agent", back_populates="tasks")
    workspace_id: Mapped[int] = mapped_column(ForeignKey(Workspace.id))
    workspace = relationship("Workspace", back_populates="tasks")
