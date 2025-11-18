from flask import Blueprint, jsonify
from .utils import FlaskResponse
from ..services.llm_model import LlmModelService
from ..db.schemas import provider as provider_schemas

llm_models_bp = Blueprint("llm_models", __name__)

@llm_models_bp.route("/<int:model_id>", methods=["GET"])
def get_model_by_id(model_id: int) -> FlaskResponse:
    with LlmModelService() as service:
        model = service.get_model_by_id(model_id)
        return jsonify(provider_schemas.LlmModelRead
                                       .model_validate(model)
                                       .model_dump(mode="json"))
