from sqlalchemy import event, select
from sqlalchemy.orm import sessionmaker
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

@event.listens_for(Workspace.__table__, "after_create")
def _insert_initial_values(target, connection, **kw):
    Session = sessionmaker(bind=connection)
    user_directory_workspace = Workspace(
        name="User Directory",
        directory="~")
    with Session() as session:
        # check if there is user-directory workspace
        stmt = select(Workspace).where(Workspace.name == user_directory_workspace.directory)
        exists = session.execute(stmt).scalars().first()
        if exists: return

        try:
            session.add(user_directory_workspace)
            session.commit()
        except Exception as e:
            session.rollback()
            raise e
