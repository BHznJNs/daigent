from flask import Response

FlaskResponse = Response | tuple[Response, int]
