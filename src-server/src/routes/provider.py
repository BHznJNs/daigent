from flask import Blueprint, Response, jsonify, request
from pydantic import ValidationError
from .utils import FlaskResponse
from ..services.provider import ProviderService
from ..db.schemas import provider as provider_schemas

providers_bp = Blueprint("providers", __name__)

@providers_bp.route("/", methods=["GET"])
def get_providers() -> FlaskResponse:
    with ProviderService() as service:
        providers = service.get_providers()
        return jsonify([provider_schemas.ProviderRead
                                        .model_validate(provider)
                                        .model_dump(mode="json")
                        for provider in providers])

@providers_bp.route("/", methods=["POST"])
def create_provider() -> FlaskResponse:
    with ProviderService() as service:
        try:
            data = provider_schemas.ProviderCreate.model_validate(request.json)
        except ValidationError as e:
            return jsonify({"error": e.errors()}), 400

        new_provider = service.create_provider(data.model_dump())
        return jsonify(provider_schemas.ProviderRead
                                       .model_validate(new_provider)
                                       .model_dump(mode="json")), 201

@providers_bp.route("/<int:provider_id>", methods=["PUT"])
def update_provider(provider_id: int) -> FlaskResponse:
    with ProviderService() as service:
        try:
            data = provider_schemas.ProviderUpdate.model_validate(request.json)
        except ValidationError as e:
            return jsonify({"error": e.errors()}), 400

        updated_provider = service.update_provider(provider_id, data.model_dump(exclude_unset=True))
        return jsonify(provider_schemas.ProviderRead
                                       .model_validate(updated_provider)
                                       .model_dump(mode="json"))

@providers_bp.route("/<int:provider_id>", methods=["DELETE"])
def delete_provider(provider_id: int) -> FlaskResponse:
    with ProviderService() as service:
        service.delete_provider(provider_id)
        return Response(status=204)
