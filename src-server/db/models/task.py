import enum
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from . import Base
from .agent import Agent
from .workspace import Workspace

class TaskType(enum.Enum):
    Agent = "agent"
    Orchestration = "orchestration"

class Task(Base):
    __tablename__ = "tasks"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    messages: Mapped[dict]
    agent_id: Mapped[int] = mapped_column(ForeignKey(Agent.id), nullable=True)
    agent = relationship("Agent", back_populates="tasks")
    workspace_id: Mapped[int] = mapped_column(ForeignKey(Workspace.id))
    workspace = relationship("Workspace", back_populates="tasks")
