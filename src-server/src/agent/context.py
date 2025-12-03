from ..db.models import agent as agent_models, provider as provider_models, workspace as workspace_models
from ..services.agent import AgentService
from ..services.workspace import WorkspaceService
from ..services.provider import ProviderService

class AgentContext:
    def __init__(self, workspace_id: int, agent_id: int, provider_id: int):
        self._workspace, self._agent, self._provider, self._model =\
            self._retrieve(workspace_id, agent_id, provider_id)

    @staticmethod
    def _retrieve(
        workspace_id: int,
        agent_id: int,
        provider_id: int,
        ) -> tuple[workspace_models.Workspace, agent_models.Agent, provider_models.Provider, provider_models.LlmModel]:
        with WorkspaceService() as workspace_service:
            workspace = workspace_service.get_workspace_by_id(workspace_id)
        if not workspace:
            raise ValueError(f"Workspace {workspace_id} not found")

        with AgentService() as agent_service:
            agent = agent_service.get_agent_by_id(agent_id)
        if not agent:
            raise ValueError(f"Agent {agent_id} not found")

        model = agent.model
        if not model:
            raise ValueError(f"Model for agent {agent_id} not found")

        with ProviderService() as provider_service:
            provider = provider_service.get_provider_by_id(provider_id)
        if not provider:
            raise ValueError(f"Provider {provider_id} not found")

        return workspace, agent, provider, model

    @property
    def provider(self) -> provider_models.Provider:
        return self._provider

    @property
    def model(self) -> provider_models.LlmModel:
        return self._model
