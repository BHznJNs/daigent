from flask import Blueprint, Response, jsonify, request
from pydantic import ValidationError
from .utils import FlaskResponse
from ..services.workspace import WorkspaceService
from ..db.schemas import workspace as workspace_schemas

workspaces_bp = Blueprint("workspaces", __name__)

@workspaces_bp.route("/", methods=["GET"])
def get_workspaces() -> FlaskResponse:
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)

    with WorkspaceService() as service:
        result = service.get_workspaces(page, per_page)

        serialized_items = [
            workspace_schemas.WorkspaceRead
                             .model_validate(workspace)
                             .model_dump(mode="json")
            for workspace in result["items"]
        ]

        return jsonify({
            "items": serialized_items,
            "total": result["total"],
            "page": result["page"],
            "per_page": result["per_page"],
            "total_pages": result["total_pages"]
        })

@workspaces_bp.route("/<int:workspace_id>", methods=["GET"])
def get_workspace(workspace_id: int) -> FlaskResponse:
    with WorkspaceService() as service:
        workspace = service.get_workspace_by_id(workspace_id)
        if not workspace:
            return jsonify({"error": "Workspace not found"}), 404

        return jsonify(workspace_schemas.WorkspaceRead
                                       .model_validate(workspace)
                                       .model_dump(mode="json"))

@workspaces_bp.route("/", methods=["POST"])
def create_workspace() -> FlaskResponse:
    with WorkspaceService() as service:
        try:
            data = workspace_schemas.WorkspaceCreate.model_validate(request.json)
        except ValidationError as e:
            return jsonify({"error": e.errors()}), 400

        new_workspace = service.create_workspace(data.model_dump())
        return jsonify(workspace_schemas.WorkspaceRead
                                       .model_validate(new_workspace)
                                       .model_dump(mode="json")), 201

@workspaces_bp.route("/<int:workspace_id>", methods=["PUT"])
def update_workspace(workspace_id: int) -> FlaskResponse:
    with WorkspaceService() as service:
        try:
            data = workspace_schemas.WorkspaceUpdate.model_validate(request.json)
        except ValidationError as e:
            return jsonify({"error": e.errors()}), 400

        updated_workspace = service.update_workspace(workspace_id, data.model_dump(exclude_unset=True))
        return jsonify(workspace_schemas.WorkspaceRead
                                        .model_validate(updated_workspace)
                                        .model_dump(mode="json"))

@workspaces_bp.route("/<int:workspace_id>", methods=["DELETE"])
def delete_workspace(workspace_id: int) -> FlaskResponse:
    with WorkspaceService() as service:
        service.delete_workspace(workspace_id)
        return Response(status=204)
