from sqlalchemy.orm import Mapped, mapped_column, relationship
from . import Base
from .relationships import workspace_agent_association_table

class Workspace(Base):
    __tablename__ = "workspaces"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    directory: Mapped[str]
    usable_agents = relationship(
        "Agent",
        secondary=workspace_agent_association_table,
        back_populates="workspaces"
    )
    tasks = relationship("Task", back_populates="workspace", cascade="all, delete-orphan",)
