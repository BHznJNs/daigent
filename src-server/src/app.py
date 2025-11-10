from flask import Flask
from flask_cors import CORS

class App(Flask):
    def __init__(self):
        super().__init__(__name__)
        CORS(self)
        self._init_routes()

    def _init_routes(self):
        @self.route("/")
        def hello_world():
            return "Hello, World!"
