from . import DTOBase
from ..models.provider import LlmProviders, LlmModelCapability

class LlmModelBase(DTOBase):
    name: str
    context_size: int
    capability: LlmModelCapability

class LlmModelRead(LlmModelBase):
    id: int

class LlmModelCreate(LlmModelBase): pass

class LlmModelUpdate(DTOBase):
    id: int
    name: str | None = None
    context_size: int | None = None
    capability: LlmModelCapability | None = None

# --- --- --- --- --- ---

class ProviderBase(DTOBase):
    name: str
    type: LlmProviders
    base_url: str
    api_key: str

class ProviderRead(ProviderBase):
    id: int
    models: list[LlmModelRead]

class ProviderCreate(ProviderBase):
    models: list[LlmModelCreate]

class ProviderUpdate(DTOBase):
    name: str | None = None
    type: LlmProviders | None = None
    base_url: str | None = None
    api_key: str | None = None
    models: list[LlmModelUpdate | LlmModelCreate] | None = None
