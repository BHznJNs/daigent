from werkzeug.exceptions import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from ..db import SessionLocal
from ..db.models import provider as provider_models

class ProviderNotFoundError(HTTPException): pass
class ModelNotFoundError(HTTPException): pass

class ProviderService:
    def __init__(self):
        self._db_session = SessionLocal()

    def get_providers(self) -> list[provider_models.Provider]:
        stmt = select(provider_models.Provider).options(
            selectinload(provider_models.Provider.models))
        providers = self._db_session.execute(stmt).scalars().all()
        return list(providers)

    def create_provider(self, data: dict) -> provider_models.Provider:
        models_data = data.pop("models", None)
        new_provider = provider_models.Provider(**data)
        if models_data:
            new_models = []
            for model_data in models_data:
                capability_data = model_data.pop("capability", {})
                new_models.append(provider_models.LlmModel(
                    capability=provider_models.LlmModelCapability(**capability_data),
                    **model_data))
            new_provider.models = new_models
        try:
            self._db_session.add(new_provider)
            self._db_session.commit()
            self._db_session.refresh(new_provider)
        except Exception as e:
            self._db_session.rollback()
            raise e
        return new_provider

    def update_provider(self, id: int, data: dict) -> provider_models.Provider:
        def update_provider_models(
                provider: provider_models.Provider,
                new_models: list[dict]):
            existing_models_map = {model.id: model for model in provider.models}
            for model_data in new_models:
                model_id = model_data.pop("id", None)
                capability_data = model_data.pop("capability", {})
                capability = provider_models.LlmModelCapability(**capability_data)
                is_create = model_id is None

                if is_create:
                    new_model = provider_models.LlmModel(
                        capability=capability,
                        **model_data)
                    provider.models.append(new_model)
                    continue

                if model_id in existing_models_map:
                    existing_model = existing_models_map[model_id]
                    for key, value in model_data.items():
                        if value is not None:
                            setattr(existing_model, key, value)
                    existing_model.capability = capability

        new_models_data = data.pop("models", None)

        stmt = select(provider_models.Provider).where(provider_models.Provider.id == id)
        provider = self._db_session.execute(stmt).scalar_one_or_none()
        if not provider:
            raise ProviderNotFoundError(f"Provider {id} not found")
        for key, value in data.items():
            if value is not None:
                setattr(provider, key, value)

        if new_models_data:
            update_provider_models(provider, new_models_data)

        try:
            self._db_session.commit()
            self._db_session.refresh(provider)
        except Exception as e:
            self._db_session.rollback()
            raise e
        return provider

    def delete_provider(self, id: int) -> None:
        stmt = select(provider_models.Provider).where(provider_models.Provider.id == id)
        provider = self._db_session.execute(stmt).scalar_one_or_none()
        if not provider:
            raise ProviderNotFoundError(f"Provider {id} not found")
        try:
            self._db_session.delete(provider)
            self._db_session.commit()
        except Exception as e:
            self._db_session.rollback()
            raise e

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        self._db_session.close()
