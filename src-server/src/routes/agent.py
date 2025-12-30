from flask import Blueprint, Response, jsonify
from pydantic import BaseModel
from flask_pydantic import validate
from .types import FlaskResponse, PaginatedResponse
from ..services.agent import AgentService
from ..db.schemas import agent as agent_schemas

agents_bp = Blueprint("agents", __name__)

class AgentsQueryModel(BaseModel):
    page: int = 1
    per_page: int = 10

@agents_bp.route("/", methods=["GET"])
@validate()
def get_agents(query: AgentsQueryModel) -> FlaskResponse:
    with AgentService() as service:
        result = service.get_agents(query.page, query.per_page)

        serialized_items = [
            agent_schemas.AgentRead
                         .model_validate(agent)
                         .model_dump(mode="json")
            for agent in result["items"]
        ]
        return jsonify(PaginatedResponse[dict](
            items=serialized_items,
            total=result["total"],
            page=result["page"],
            per_page=result["per_page"],
            total_pages=result["total_pages"]
        ))

@agents_bp.route("/brief", methods=["GET"])
def get_agents_brief() -> FlaskResponse:
    with AgentService() as service:
        agents = service.get_agents_brief()
        return jsonify([agent_schemas.AgentBrief
                                     .model_validate(agent)
                                     .model_dump(mode="json")
                        for agent in agents])

@agents_bp.route("/", methods=["POST"])
@validate()
def create_agent(body: agent_schemas.AgentCreate) -> FlaskResponse:
    with AgentService() as service:
        new_agent = service.create_agent(body.model_dump())
        return jsonify(agent_schemas.AgentRead
                                   .model_validate(new_agent)
                                   .model_dump(mode="json")), 201

@agents_bp.route("/<int:agent_id>", methods=["PUT"])
@validate()
def update_agent(agent_id: int, body: agent_schemas.AgentUpdate) -> FlaskResponse:
    with AgentService() as service:
        updated_agent = service.update_agent(agent_id, body.model_dump(exclude_unset=True))
        return jsonify(agent_schemas.AgentRead
                                    .model_validate(updated_agent)
                                    .model_dump(mode="json"))

@agents_bp.route("/<int:agent_id>", methods=["DELETE"])
def delete_agent(agent_id: int) -> FlaskResponse:
    with AgentService() as service:
        service.delete_agent(agent_id)
        return Response(status=204)
