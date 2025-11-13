from flask import Blueprint

workspaces_bp = Blueprint("workspaces", __name__)

@workspaces_bp.route("/workspaces", methods=["GET"])
def get_workspaces():
    return "Not implemented"

@workspaces_bp.route("/workspaces", methods=["POST"])
def create_workspace():
    return "Not implemented"

@workspaces_bp.route("/workspaces/<int:workspace_id>", methods=["GET"])
def get_workspace(workspace_id: int):
    return "Not implemented"

@workspaces_bp.route("/workspaces/<int:workspace_id>", methods=["PUT"])
def update_workspace(workspace_id: int):
    return "Not implemented"
