from flask import Blueprint, jsonify, request
from liteai_sdk import LLM, LlmProviders
from .utils import FlaskResponse

llm_api_bp = Blueprint("llm_api", __name__)

@llm_api_bp.route("/models", methods=["POST"])
def fetch_models() -> FlaskResponse:
    body = request.get_json()
    base_url = body.get("base_url")
    api_key = body.get("api_key")
    provider_type = body.get("type")
    try:
        provider_type = LlmProviders(provider_type)
    except ValueError:
        return jsonify({"error": "Invalid provider type"}), 400

    llm = LLM(
        provider=provider_type,
        base_url=base_url,
        api_key=api_key)
    return jsonify(llm.list_models())
