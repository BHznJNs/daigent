from werkzeug.exceptions import HTTPException
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload, load_only
from .ServiceBase import ServiceBase
from ..db.models import task as task_models

class TaskNotFoundError(HTTPException): 
    pass

class TaskService(ServiceBase):
    def create_task(self, data: dict) -> task_models.Task:
        messages_raw = data.pop("messages")
        messages = [
            task_models.TaskMessage(**item)
            for item in messages_raw
        ]
        new_task = task_models.Task(messages=messages, **data)

        try:
            self._db_session.add(new_task)
            self._db_session.commit()
            self._db_session.refresh(new_task)
        except Exception as e:
            self._db_session.rollback()
            raise e
        return new_task

    def get_tasks(self, workspace_id: int, page: int = 1, per_page: int = 10) -> dict:
        if page < 1: page = 1
        if per_page < 5 or per_page > 100: per_page = 10

        base_query = select(task_models.Task).where(task_models.Task.workspace_id == workspace_id)

        count_stmt = select(func.count()).select_from(base_query.subquery())
        total = self._db_session.execute(count_stmt).scalar() or 0

        offset = (page - 1) * per_page
        total_pages = (total + per_page - 1) // per_page if total > 0 else 0

        stmt = base_query.options(
            selectinload(task_models.Task.agent),
            selectinload(task_models.Task.workspace),
            load_only(task_models.Task.id, task_models.Task.type, task_models.Task.title, task_models.Task.agent_id, task_models.Task.workspace_id)
        ).order_by(task_models.Task.id.desc()).limit(per_page).offset(offset)

        tasks = self._db_session.execute(stmt).scalars().all()

        return {
            "items": list(tasks),
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": total_pages
        }

    def get_task_by_id(self, id: int) -> task_models.Task | None:
        return self._db_session.get(
            task_models.Task,
            id,
            options=[
                selectinload(task_models.Task.agent),
                selectinload(task_models.Task.workspace)
            ]
        )

    def update_task(self, id: int, data: dict) -> task_models.Task:
        stmt = select(task_models.Task).where(task_models.Task.id == id)
        task = self._db_session.execute(stmt).scalar_one_or_none()

        if not task:
            raise TaskNotFoundError(f"Task {id} not found")

        if "messages" in data:
            messages_raw = data.pop("messages")
            task.messages = [
                task_models.TaskMessage(**item)
                for item in messages_raw
            ]

        for key, value in data.items():
            if hasattr(task, key):
                setattr(task, key, value)

        try:
            self._db_session.commit()
            self._db_session.refresh(task)
        except Exception as e:
            self._db_session.rollback()
            raise e
        return task

    def delete_task(self, id: int) -> None:
        stmt = select(task_models.Task).where(task_models.Task.id == id)
        task = self._db_session.execute(stmt).scalar_one_or_none()

        if not task:
            raise TaskNotFoundError(f"Task {id} not found")

        try:
            self._db_session.delete(task)
            self._db_session.commit()
        except Exception as e:
            self._db_session.rollback()
            raise e
