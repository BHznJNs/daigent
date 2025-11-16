from . import DTOBase
from .provider import LlmModelRead
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .workspace import WorkspaceRead

class AgentBase(DTOBase):
    name: str
    system_prompt: str
    model_id: int | None = None

class AgentRead(AgentBase):
    id: int
    model: LlmModelRead | None = None
    workspaces: list[WorkspaceRead] = []

class AgentCreate(AgentBase):
    workspace_ids: list[int] = []

class AgentUpdate(DTOBase):
    name: str | None = None
    system_prompt: str | None = None
    model_id: int | None = None
    workspace_ids: list[int] | None = None
