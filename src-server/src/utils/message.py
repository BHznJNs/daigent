import json
from liteai_sdk import ChatMessage,\
                       UserMessage, AssistantMessage, SystemMessage, ToolMessage
from typing import cast
from ..db.models.task import TaskMessage, MessageRole

def chat_to_task_message(message: ChatMessage) -> TaskMessage:
    match message:
        case UserMessage():
            # TODO: resolve other types of user message content
            role = MessageRole.User
            content = cast(str, message.content)
            metadata = {}
        case AssistantMessage():
            role = MessageRole.Assistant
            content = message.content or ""
            metadata = {}
            if message.reasoning_content:
                metadata["reasoning_content"] = message.reasoning_content
        case SystemMessage():
            role = MessageRole.System
            content = message.content
            metadata = {}
        case ToolMessage():
            role = MessageRole.Tool
            content = message.result
            metadata = {
                "id": message.id,
                "name": message.name,
                "arguments": json.dumps(message.arguments)
            }
        case _:
            raise ValueError(f"Unknown message type: {message}")

    return TaskMessage(
        role=role,
        content=content,
        metadata=metadata
    )

def task_to_chat_message(messages: list[TaskMessage]) -> list[ChatMessage]:
    result = []
    for message in messages:
        match message.role:
            case MessageRole.User:
                chat_message = UserMessage(content=message.content)
            case MessageRole.Assistant:
                chat_message = AssistantMessage(
                    content=message.content,
                    reasoning_content=message.metadata.get("reasoning_content", None))
            case MessageRole.System:
                chat_message = SystemMessage(content=message.content)
            case MessageRole.Tool:
                tool_args = message.metadata.get("arguments", "{}")
                tool_args = json.loads(tool_args)
                chat_message = ToolMessage(
                    result=message.content,
                    id=message.metadata.get("id", ""),
                    name=message.metadata.get("name", ""),
                    arguments=tool_args)
        result.append(chat_message)
    return result
