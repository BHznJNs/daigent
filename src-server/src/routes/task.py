from collections.abc import Generator
from dataclasses import asdict
from typing import cast
from loguru import logger
from flask import Blueprint, Response, jsonify, stream_with_context
from liteai_sdk import TextChunk, ToolCallChunk, UserMessage
from pydantic import BaseModel, ValidationError
from flask_pydantic import validate
from .types import FlaskResponse, PaginatedResponse
from ..agent import AgentTask, AgentTaskPool, AgentTaskSentinel
from ..services.task import TaskService
from ..db.schemas import task as task_schemas
from ..db.models import task as task_models
from ..utils.sse import format_sse

tasks_bp = Blueprint("tasks", __name__)
task_pool = AgentTaskPool()
_logger = logger.bind(name="TaskRoute")

class TasksQueryModel(BaseModel):
    workspace_id: int
    page: int = 1
    per_page: int = 15

class ContinueTaskBody(BaseModel):
    message: dict | None = None

class ResumeTaskBody(BaseModel):
    messages: list[dict] | None = None

@tasks_bp.route("/", methods=["GET"])
@validate()
def get_tasks(query: TasksQueryModel) -> FlaskResponse:
    with TaskService() as service:
        result = service.get_tasks(query.workspace_id, query.page, query.per_page)

        serialized_items = [
            task_schemas.TaskRead
                        .model_validate(task)
                        .model_dump(mode="json")
            for task in result["items"]
        ]
        return jsonify(PaginatedResponse[dict](
            items=serialized_items,
            total=result["total"],
            page=result["page"],
            per_page=result["per_page"],
            total_pages=result["total_pages"]
        ))

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
@validate()
def new_task(body: task_schemas.TaskCreate) -> FlaskResponse:
    with TaskService() as service:
        new_task = service.create_task(body.model_dump())
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
@validate()
def continue_task(task_id: int, body: ContinueTaskBody) -> FlaskResponse:
    """
    This endpoint is used to directly continue the existing task,
    or continue with a new UserMessage
    """
    task = task_pool.add(task_id)

    if body.message is not None:
        try:
            message_obj = UserMessage.model_validate(body.message)
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
    # TODO: Implement tool_answer logic
    return jsonify({"message": "Not implemented yet"}), 501

@tasks_bp.route("/resume/<int:task_id>", methods=["POST"])
@validate()
def resume_task(task_id: int, body: ResumeTaskBody) -> FlaskResponse:
    task = task_pool.add(task_id)

    if body.messages:
        for message in body.messages:
            try:
                message_obj = task_models.message_adapter.validate_python(message)
            except ValidationError as e:
                _logger.error("Failed to validate message: {}", e)
                return jsonify({"error": e.errors()}), 400
            task.append_message(message_obj)

    return Response(stream_with_context(agent_stream(task_id, task)),
                    mimetype="text/event-stream")
