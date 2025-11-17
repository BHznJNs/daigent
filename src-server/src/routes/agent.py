from flask import Blueprint, Response, jsonify, request
from pydantic import ValidationError
from .utils import FlaskResponse
from ..services.agent import AgentService
from ..db.schemas import agent as agent_schemas

agents_bp = Blueprint("agents", __name__)

@agents_bp.route("/", methods=["GET"])
def get_agents() -> FlaskResponse:
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)

    with AgentService() as service:
        result = service.get_agents(page, per_page)

        serialized_items = [
            agent_schemas.AgentRead
                         .model_validate(agent)
                         .model_dump(mode="json")
            for agent in result["items"]
        ]

        return jsonify({
            "items": serialized_items,
            "total": result["total"],
            "page": result["page"],
            "per_page": result["per_page"],
            "total_pages": result["total_pages"]
        })

@agents_bp.route("/", methods=["POST"])
def create_agent() -> FlaskResponse:
    with AgentService() as service:
        try:
            data = agent_schemas.AgentCreate.model_validate(request.json)
        except ValidationError as e:
            return jsonify({"error": e.errors()}), 400

        new_agent = service.create_agent(data.model_dump())
        return jsonify(agent_schemas.AgentRead
                                   .model_validate(new_agent)
                                   .model_dump(mode="json")), 201

@agents_bp.route("/<int:agent_id>", methods=["PUT"])
def update_agent(agent_id: int) -> FlaskResponse:
    with AgentService() as service:
        try:
            data = agent_schemas.AgentUpdate.model_validate(request.json)
        except ValidationError as e:
            return jsonify({"error": e.errors()}), 400

        updated_agent = service.update_agent(agent_id, data.model_dump(exclude_unset=True))
        return jsonify(agent_schemas.AgentRead
                                    .model_validate(updated_agent)
                                    .model_dump(mode="json"))

@agents_bp.route("/<int:agent_id>", methods=["DELETE"])
def delete_agent(agent_id: int) -> FlaskResponse:
    with AgentService() as service:
        service.delete_agent(agent_id)
        return Response(status=204)
