from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from . import Base
from .provider import LlmModel
from .relationships import workspace_agent_association_table

class Agent(Base):
    __tablename__ = "agents"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    model: Mapped[int] = mapped_column(ForeignKey(LlmModel.id))
    system_prompt: Mapped[str]
    workspaces = relationship(
        "Workspace",
        secondary=workspace_agent_association_table,
        back_populates="usable_agents"
    )
