from __future__ import annotations
from . import DTOBase
from .provider import LlmModelRead

class AgentBase(DTOBase):
    name: str
    system_prompt: str

class AgentBrief(DTOBase):
    id: int
    name: str

class AgentRead(AgentBase):
    id: int
    model: LlmModelRead | None = None

class AgentCreate(AgentBase):
    model_id: int | None = None

class AgentUpdate(DTOBase):
    name: str | None = None
    system_prompt: str | None = None
    model_id: int | None = None
