from collections.abc import Generator
from dataclasses import asdict
from typing import cast
from loguru import logger
from flask import Blueprint, Response, jsonify, request, stream_with_context
from liteai_sdk import TextChunk, ToolCallChunk, UserMessage
from pydantic import ValidationError
from .utils import FlaskResponse
from ..agent import AgentTask, AgentTaskPool, AgentTaskSentinel
from ..services.task import TaskService
from ..db.schemas import task as task_schemas
from ..db.models import task as task_models
from ..utils.sse import format_sse

tasks_bp = Blueprint("tasks", __name__)
task_pool = AgentTaskPool()
_logger = logger.bind(name="TaskRoute")

@tasks_bp.route("/", methods=["GET"])
def get_tasks() -> FlaskResponse:
    workspace_id = request.args.get("workspace_id", type=int)
    if not workspace_id:
        return jsonify({"error": "workspace_id is required"}), 400

    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 15, type=int)
    with TaskService() as service:
        result = service.get_tasks(workspace_id, page, per_page)

        serialized_items = [
            task_schemas.TaskRead
                        .model_validate(task)
                        .model_dump(mode="json")
            for task in result["items"]
        ]

        return jsonify({
            "items": serialized_items,
            "total": result["total"],
            "page": result["page"],
            "per_page": result["per_page"],
            "total_pages": result["total_pages"]
        })

@tasks_bp.route("/<int:task_id>", methods=["GET"])
def get_task(task_id: int) -> FlaskResponse:
    with TaskService() as service:
        task = service.get_task_by_id(task_id)
        if not task:
            return jsonify({"error": "Task not found"}), 404
        return jsonify(task_schemas.TaskRead
                                   .model_validate(task)
                                   .model_dump(mode="json"))

@tasks_bp.route("/", methods=["POST"])
def new_task() -> FlaskResponse:
    with TaskService() as service:
        try:
            data = task_schemas.TaskCreate.model_validate(request.json)
        except ValidationError as e:
            return jsonify({"error": e.errors()}), 400
        new_task = service.create_task(data.model_dump())
        return jsonify(task_schemas.TaskRead
                                   .model_validate(new_task)
                                   .model_dump(mode="json")), 201

@tasks_bp.route("/<int:task_id>", methods=["DELETE"])
def delete_task(task_id: int) -> FlaskResponse:
    if not task_pool.has(task_id):
        return jsonify({"error": "Task not found"}), 404

    task_pool.stop(task_id)
    with TaskService() as service:
        service.delete_task(task_id)
        return Response(status=204)

# --- --- --- --- --- ---
# -- Streaming Routes ---
# --- --- --- --- --- ---

def agent_stream(async_task_id: int, agent_task: AgentTask) -> Generator[str]:
    try:
        for chunk in agent_task.run():
            match chunk:
                case TextChunk() as text_chunk:
                    yield format_sse(event="ASSISTANT_CHUNK", data={
                        "type": "text",
                        "content": text_chunk.content,
                    })
                case ToolCallChunk() as tool_call:
                    yield format_sse(event="ASSISTANT_CHUNK", data={
                        "type": "tool_call",
                        "data": asdict(tool_call),
                    })
                case (AgentTaskSentinel() as sentinel, data):
                    yield format_sse(event=sentinel.value, data=data)
                case Exception():
                    _logger.exception("Task failed: {}", chunk)
                    _logger.debug("Task openai messages: {}", [m.to_litellm_message() for m in agent_task._messages])
                    yield format_sse(event="ERROR", data={"message": str(chunk)})
                    break
        task_pool.remove(async_task_id)
    except GeneratorExit:
        # when the client disconnects
        task_pool.stop(async_task_id)
        return

@tasks_bp.route("/continue/<int:task_id>", methods=["POST"])
def continue_task(task_id: int) -> FlaskResponse:
    """
    This endpoint is used to directly continue the existing task,
    or continue with a new UserMessage
    """
    task = task_pool.add(task_id)

    if request.json is not None:
        message = cast(dict | None, request.json.get("message"))
        if not message: return jsonify({"error": "message is required"}), 400
        try:
            message_obj = UserMessage.model_validate(message)
        except ValidationError as e:
            _logger.error("Failed to validate message: {}", e)
            return jsonify({"error": e.errors()}), 400
        task.append_message(message_obj)

    return Response(stream_with_context(agent_stream(task_id, task)),
                    mimetype="text/event-stream")

@tasks_bp.route("/tool_answer/<int:task_id>", methods=["POST"])
def tool_answer(task_id: int) -> FlaskResponse:
    """
    This endpoint is used for the HumanInTheLoop tool calls.
    The frontend should send the tool call id and the answer to this endpoint.
    """
    task = task_pool.add(task_id)
    if request.json is None:
        return jsonify({"error": "Request body is required"}), 400

@tasks_bp.route("/resume/<int:task_id>", methods=["POST"])
def resume_task(task_id: int) -> FlaskResponse:
    if request.json is None:
        return jsonify({"error": "Request body is required"}), 400

    messages = cast(list | None, request.json.get("messages"))
    task = task_pool.add(task_id)

    if messages:
        for message in messages:
            try:
                message_obj = task_models.message_adapter.validate_python(message)
            except ValidationError as e:
                _logger.error("Failed to validate message: {}", e)
                return jsonify({"error": e.errors()}), 400
            task.append_message(message_obj)

    return Response(stream_with_context(agent_stream(task_id, task)),
                    mimetype="text/event-stream")
