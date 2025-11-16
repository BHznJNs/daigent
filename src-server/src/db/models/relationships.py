from sqlalchemy import Column, ForeignKey, Integer, Table
from . import Base

workspace_agent_association_table = Table(
    "workspace_agent_association", Base.metadata,
    Column("workspace_id", Integer, ForeignKey("workspaces.id", ondelete="CASCADE"), primary_key=True),
    Column("agent_id", Integer, ForeignKey("agents.id", ondelete="CASCADE"), primary_key=True)
)
