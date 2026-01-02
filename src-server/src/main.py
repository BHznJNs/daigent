import argparse
from loguru import logger
from waitress import serve
from .app import App
from .db import migrate_db

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=1460)
    args = parser.parse_args()

    migrate_db()
    app = App()
    logger.info("Starting server on port {}", args.port)
    serve(app, host="localhost", port=args.port)
