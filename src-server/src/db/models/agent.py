from sqlalchemy import ForeignKey, event, select
from sqlalchemy.orm import Mapped, mapped_column, relationship, sessionmaker
from . import Base
from .provider import LlmModel
from .relationships import workspace_agent_association_table

class Agent(Base):
    __tablename__ = "agents"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    system_prompt: Mapped[str]
    model_id: Mapped[int] = mapped_column(
        ForeignKey(LlmModel.id, ondelete="SET NULL"), nullable=True)
    model = relationship("LlmModel", back_populates="agents")
    workspaces = relationship(
        "Workspace",
        secondary=workspace_agent_association_table,
        back_populates="usable_agents"
    )
    tasks = relationship("Task", back_populates="agent")

@event.listens_for(Agent.__table__, "after_create")
def _insert_initial_values(target, connection, **kw):
    Session = sessionmaker(bind=connection)
    orchestration_agent = Agent(
        name="Orchestrator",
        model_id=1,
        system_prompt="You are a helpful assistant.")

    with Session() as session:
        # check if there is the orchestration agent
        stmt = select(Agent).where(Agent.name == orchestration_agent.name)
        exists = session.execute(stmt).scalars().first()
        if exists: return

        try:
            session.add(orchestration_agent)
            session.commit()
        except Exception as e:
            session.rollback()
            raise e
