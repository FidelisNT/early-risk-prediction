from sqlmodel import SQLModel, create_engine, Session

DATABASE_URL = "postgresql://postgres:ashufifi2004@localhost:5432/my_database"

engine = create_engine(
    DATABASE_URL,
    echo=True
)

def create_db_and_tables() -> None:
    """
    Creates every table registered on SQLModel.metadata.

    IMPORTANT: this only works if all model classes have already been
    imported somewhere (e.g. via `import app.models`) so SQLModel knows
    about them. Importing this function alone is not enough.
    """
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session