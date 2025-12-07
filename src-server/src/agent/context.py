from typing import cast
from ..db.models import agent as agent_models,\
                        provider as provider_models,\
                        workspace as workspace_models
from ..services.agent import AgentService
from ..services.workspace import WorkspaceService
from ..services.provider import ProviderService

class AgentContext:
    def __init__(self, workspace_id: int, agent_id: int):
        self._retrieve(workspace_id, agent_id)

    def _retrieve(self, workspace_id: int, agent_id: int):
        with WorkspaceService() as workspace_service:
            workspace = workspace_service.get_workspace_by_id(workspace_id)
        if not workspace:
            raise ValueError(f"Workspace {workspace_id} not found")
        self._workspace = workspace

        with AgentService() as agent_service:
            agent = agent_service.get_agent_by_id(agent_id)
        if not agent:
            raise ValueError(f"Agent {agent_id} not found")
        self._agent = agent

        self._model = cast(provider_models.LlmModel, agent.model)
        self._provider = cast(provider_models.Provider, self._model.provider)

    @property
    def workspace(self) -> workspace_models.Workspace:
        return self._workspace

    @property
    def agent(self) -> agent_models.Agent:
        return self._agent

    @property
    def provider(self) -> provider_models.Provider:
        return self._provider

    @property
    def model(self) -> provider_models.LlmModel:
        return self._model
