from sqlalchemy import select
from ..db import SessionLocal
from ..db.models import provider as provider_models

class ProviderNotFoundError(Exception): pass
class ModelNotFoundError(Exception): pass

class ProviderService:
    def __init__(self):
        self._db_session = SessionLocal()

    def get_providers(self) -> list[provider_models.Provider]:
        stmt = select(provider_models.Provider)
        providers = self._db_session.execute(stmt).scalars().all()
        return list(providers)

    def create_provider(self, data: dict) -> provider_models.Provider:
        new_provider = provider_models.Provider(**data)
        self._db_session.add(new_provider)
        self._db_session.commit()
        self._db_session.refresh(new_provider)
        return new_provider

    def update_provider(self, id: int, data: dict) -> provider_models.Provider:
        stmt = select(provider_models.Provider).where(provider_models.Provider.id == id)
        provider = self._db_session.execute(stmt).scalar_one_or_none()
        if not provider:
            raise ProviderNotFoundError(f"Provider {id} not found")
        for key, value in data.items():
            if value is not None:
                setattr(provider, key, value)
        self._db_session.commit()
        self._db_session.refresh(provider)
        return provider

    def delete_provider(self, id: int) -> None:
        stmt = select(provider_models.Provider).where(provider_models.Provider.id == id)
        provider = self._db_session.execute(stmt).scalar_one_or_none()
        if not provider:
            raise ProviderNotFoundError(f"Provider {id} not found")
        self._db_session.delete(provider)
        self._db_session.commit()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        self._db_session.close()
