import enum
import dataclasses
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from . import Base
from .utils import DataClassJSON
class ProviderType(enum.Enum):
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GEMINI = "gemini"

@dataclasses.dataclass
class Capability:
    vision: bool = False
    reasoning: bool = False
    tool_use: bool = False

class LlmModel(Base):
    __tablename__ = "llm_models"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    context_size: Mapped[int]
    capability: Mapped[Capability] = mapped_column(DataClassJSON(Capability))
    provider_id: Mapped[int] = mapped_column(ForeignKey("providers.id"))
    provider = relationship("Provider", back_populates="models")

class Provider(Base):
    __tablename__ = "providers"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    type: Mapped[ProviderType]
    base_url: Mapped[str]
    api_key: Mapped[str]
    models = relationship("LlmModel", back_populates="provider", cascade="all, delete-orphan")
