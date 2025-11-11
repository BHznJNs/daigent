from sqlalchemy import JSON, Column, ForeignKey, Integer, String
from . import Base

# TODO: to be implemented
# class ToolType(Base):
#     __tablename__ = "tool_types"
#     id = Column(Integer, primary_key=True, autoincrement=True, unique=True)
#     name = Column(String, nullable=False)

# class Tool(Base):
#     __tablename__ = "tools"
#     id = Column(Integer, primary_key=True, autoincrement=True, unique=True)
#     name = Column(String, nullable=False)
#     type