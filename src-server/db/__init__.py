from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from platformdirs import user_data_dir
import models

APP_NAME = "org.daigent.desktop"

data_dir = Path(user_data_dir(APP_NAME, ensure_exists=True))
db_path = data_dir / "sqlite.db"

engine = create_engine(f"sqlite:///{db_path}")

# migrate database
models.Base.metadata.create_all(bind=engine)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
