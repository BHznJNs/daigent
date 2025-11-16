from flask import Blueprint, jsonify, request
from any_llm.api import list_models
from .utils import FlaskResponse

llm_api_bp = Blueprint("llm_api", __name__)

@llm_api_bp.route("/models", methods=["POST"])
def fetch_models() -> FlaskResponse:
    body = request.get_json()
    base_url = body.get("base_url")
    api_key = body.get("api_key")
    provider_type = body.get("type")
    if provider_type not in ["openai", "gemini", "anthropic"]:
        return jsonify({"error": "Invalid provider type"}), 400

    models = list_models(
        provider=provider_type,
        api_base=base_url,
        api_key=api_key)
    return jsonify([model.model_dump() for model in models])
