import json
from ..types import JsonSerializable

def format_sse(data: JsonSerializable,
               event: str | None = None,
               event_id: str | None = None,
               retry: int | None = None) -> str:
    buffer = []

    if event_id is not None:
        buffer.append(f"id: {event_id}")

    if event is not None:
        buffer.append(f"event: {event}")

    if retry is not None:
        buffer.append(f"retry: {retry}")

    # 如果数据不是字符串，尝试将其序列化为 JSON
    if not isinstance(data, str):
        # ensure_ascii=False 可以让中文不显示为 \uXXXX，减小体积且可读性更好
        payload = json.dumps(data, ensure_ascii=False)
    else:
        payload = data

    # SSE 规范要求：如果数据包含换行，每一行都必须以 "data: " 开头
    for line in payload.splitlines():
        buffer.append(f"data: {line}")

    # 每一块数据结束必须有两个换行符
    return "\n".join(buffer) + "\n\n"
