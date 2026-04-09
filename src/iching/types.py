from enum import Enum

from pydantic import BaseModel


class Face(str, Enum):
    BROAD_A = "broad_a"
    BROAD_B = "broad_b"
    NARROW_A = "narrow_a"
    NARROW_B = "narrow_b"


class Line(int, Enum):
    YIN = 0
    YANG = 1


class TrigramResult(BaseModel):
    id: str
    name_zh: str
    pinyin: str
    image_en: str
    lines: tuple[Line, Line, Line]  # bottom to top


class HexagramResult(BaseModel):
    number: int
    name_zh: str
    lower: TrigramResult
    upper: TrigramResult
    classical_text: dict


class Reading(BaseModel):
    question: str
    hexagram: HexagramResult
    interpretation: str
