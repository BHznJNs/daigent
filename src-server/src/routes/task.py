from collections.abc import Generator
from dataclasses import asdict
from typing import cast
from flask import Blueprint, Response, jsonify, request, stream_with_context
from liteai_sdk import AssistantMessageChunk, ToolMessage
from pydantic import ValidationError
from .utils import FlaskResponse
from ..agent import AgentTask, AgentTaskPool
from ..services.task import TaskService
from ..db.schemas import task as task_schemas
from ..db.models import task as task_models
from ..utils.sse import format_sse

tasks_bp = Blueprint("tasks", __name__)
task_pool = AgentTaskPool()

@tasks_bp.route("/", methods=["GET"])
def get_tasks() -> FlaskResponse:
    workspace_id = request.args.get("workspace_id", type=int)
    if not workspace_id:
        return jsonify({"error": "workspace_id is required"}), 400

    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 15, type=int)
    with TaskService() as service:
        tasks = service.get_tasks(workspace_id, page, per_page)
        return jsonify(tasks)

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

@tasks_bp.route("/resume/<int:task_id>", methods=["POST"])
def resume_task(task_id: int) -> FlaskResponse:
    def agent_stream(task: AgentTask) -> Generator[str]:
        for chunk in task.run():
            event = None
            match chunk:
                case AssistantMessageChunk():
                    event = "assistant_chunk"
                case ToolMessage():
                    event = "tool"
            yield format_sse(event=event, data=asdict(chunk))

    assert request.json is not None
    message = cast(dict, request.json.get("message"))
    task = task_pool.add(task_id)

    if message:
        try:
            message_obj = task_schemas.TaskMessage.model_validate(message)
        except ValidationError as e:
            return jsonify({"error": e.errors()}), 400
        task.append_message(task_models.TaskMessage(**message_obj.model_dump()))

    return Response(stream_with_context(agent_stream(task)),
                    mimetype="text/event-stream")

@tasks_bp.route("/pause/<int:task_id>", methods=["POST"])
def pause_task(task_id: int) -> FlaskResponse:
    if not task_pool.has(task_id):
        return jsonify({"error": "Task not found"}), 404

    task_pool.stop(task_id)
    return Response(status=204)

@tasks_bp.route("/<int:task_id>", methods=["DELETE"])
def delete_task(task_id: int) -> FlaskResponse:
    if not task_pool.has(task_id):
        return jsonify({"error": "Task not found"}), 404

    task_pool.stop(task_id)
    with TaskService() as service:
        service.delete_task(task_id)
        return Response(status=204)
