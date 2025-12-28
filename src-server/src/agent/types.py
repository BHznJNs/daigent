from enum import Enum
from typing import Any, Literal, TypedDict
from liteai_sdk import MessageChunk

class AgentTaskSentinel(str, Enum):
    Done = "DONE"                   # data: None
    Interrupted  = "INTERRUPTED"    # data: None
    MessageStart = "MESSAGE_START"  # data: None
    MessageEnd   = "MESSAGE_END"    # data: None
    ToolResult   = "TOOL_RESULT"    # data: ToolResult

AgentTaskChunk = MessageChunk | tuple[AgentTaskSentinel, Any] | Exception

# --- --- --- --- --- ---

class ToolResult(TypedDict):
    tool_call_id: str
    result: str | None

class HumanInTheLoop_ToolCall:
    tool_name: Literal["ask_user", "finish_task"]

class RequireUserPermission(TypedDict):
    tool_call_id: str

ToolCallSentinel = ToolResult | RequireUserPermission | HumanInTheLoop_ToolCall
