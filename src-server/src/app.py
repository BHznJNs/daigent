from flask import Flask
from flask_cors import CORS
from .routes import workspaces_bp, providers_bp

class App(Flask):
    def __init__(self):
        super().__init__(__name__)
        CORS(self)
        self._init_routes()

    def _init_routes(self):
        self.register_blueprint(workspaces_bp, url_prefix="/api/workspaces")
        self.register_blueprint(providers_bp, url_prefix="/api/providers")
