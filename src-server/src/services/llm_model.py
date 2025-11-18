from werkzeug.exceptions import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from ..db import SessionLocal
from ..db.models import provider as provider_models

class ModelNotFoundError(HTTPException): pass

class LlmModelService:
    def __init__(self):
        self._db_session = SessionLocal()

    def get_model_by_id(self, model_id: int) -> provider_models.LlmModel:
        stmt = select(provider_models.LlmModel).where(
            provider_models.LlmModel.id == model_id
        )
        model = self._db_session.execute(stmt).scalar_one_or_none()
        if not model:
            raise ModelNotFoundError(f"Model {model_id} not found")
        return model

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        self._db_session.close()