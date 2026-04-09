from pydantic import BaseModel, Field

from src.iching.types import Face


class CastRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=500)
    throw_1: list[Face] = Field(..., min_length=3, max_length=3)
    throw_2: list[Face] = Field(..., min_length=3, max_length=3)
