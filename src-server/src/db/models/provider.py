import enum
import dataclasses
from sqlalchemy import ForeignKey, event, select
from sqlalchemy.orm import Mapped, mapped_column, relationship, sessionmaker
from . import Base
from .utils import DataClassJSON

@dataclasses.dataclass
class LlmModelCapability:
    vision: bool = False
    reasoning: bool = False
    tool_use: bool = False

class LlmModel(Base):
    __tablename__ = "llm_models"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    context_size: Mapped[int]
    capability: Mapped[LlmModelCapability] = mapped_column(DataClassJSON(LlmModelCapability))
    provider_id: Mapped[int] = mapped_column(ForeignKey("providers.id"))
    provider = relationship("Provider", back_populates="models")
    agents = relationship("Agent", back_populates="model")

class ProviderType(enum.Enum):
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GEMINI = "gemini"

class Provider(Base):
    __tablename__ = "providers"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    type: Mapped[ProviderType]
    base_url: Mapped[str]
    api_key: Mapped[str]
    models = relationship("LlmModel", back_populates="provider", cascade="all, delete-orphan")

@event.listens_for(Base.metadata, "after_create")
def _insert_initial_values(target, connection, **kw):
    Session = sessionmaker(bind=connection)
    default_provider = Provider(
        name="OpenAI",
        type=ProviderType.OPENAI,
        base_url="https://api.openai.com/v1",
        api_key="sk-",
        models=[
            LlmModel(
                name="gpt-4",
                context_size=8192,
                capability=LlmModelCapability())])

    with Session() as session:
        # check if there is any provider
        stmt = select(Provider)
        exists = session.execute(stmt).scalars().first()
        if exists: return

        try:
            session.add(default_provider)
            session.commit()
        except Exception as e:
            session.rollback()
            raise e
