from datetime import datetime
from sqlmodel import Field


class TimestampMixin:
    """Adds created_at / updated_at columns. updated_at is refreshed
    automatically by the DB on every UPDATE."""

    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        sa_column_kwargs={"onupdate": datetime.utcnow},
    )
