from flask import Blueprint, Response, jsonify, request
from .utils import FlaskResponse
from ..services.task import TaskService

tasks_bp = Blueprint("tasks", __name__)

@tasks_bp.route("/", methods=["POST"])
def new_task() -> FlaskResponse:
    pass

@tasks_bp.route("/<int:task_id>", methods=["GET"])
def resume_task(task_id: int) -> FlaskResponse:
    pass

@tasks_bp.route("/", methods=["GET"])
def get_tasks() -> FlaskResponse:
    pass

@tasks_bp.route("/<int:task_id>", methods=["DELETE"])
def delete_task(task_id: int) -> FlaskResponse:
    with TaskService() as service:
        service.delete_task(task_id)
        return Response(status=204)
