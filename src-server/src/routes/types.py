from typing import TypeVar, TypedDict, Generic
from flask import Response

FlaskResponse = Response | tuple[Response, int]

Element = TypeVar("Element")
class PaginatedResponse(TypedDict, Generic[Element]):
    items: list[Element]
    total: int
    page: int
    per_page: int
    total_pages: int
