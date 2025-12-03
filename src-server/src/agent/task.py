from liteai_sdk import LLM, LlmRequestParams, ChatMessage, SystemMessage, UserMessage
from .context import AgentContext

class AgentTask:
    def __init__(self, ctx: AgentContext, initial_task: str):
        self.llm = LLM(
            provider=ctx.provider.type,
            base_url=ctx.provider.base_url,
            api_key=ctx.provider.api_key)
        self.model = ctx.model.name
        self._is_running = True
        self._initial_task = initial_task
        self._messages: list[ChatMessage] = [
            SystemMessage(content="You are a helpful assistant."),
            UserMessage(content=initial_task)
        ]

    def run(self):
        while self._is_running:
            self.llm.generate_text_sync(LlmRequestParams(
                model=self.model,
                messages=self._messages
            ))
