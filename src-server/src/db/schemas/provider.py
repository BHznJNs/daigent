from . import DTOBase
from ..models.provider import ProviderType, LlmModelCapability

class LlmModel(DTOBase):
    name: str
    context_size: int
    capability: LlmModelCapability

class ProviderBase(DTOBase):
    name: str
    type: ProviderType
    base_url: str
    api_key: str
    models: list[LlmModel]

class ProviderRead(ProviderBase):
    id: int

class ProviderCreate(ProviderBase):
    pass

class ProviderUpdate(DTOBase):
    name: str | None = None
    type: ProviderType | None = None
    base_url: str | None = None
    api_key: str | None = None
    models: list[LlmModel] | None = None
