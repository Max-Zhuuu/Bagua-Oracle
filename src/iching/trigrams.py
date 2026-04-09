import json
from pathlib import Path

from src.iching.types import Line, TrigramResult

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"

TRIGRAM_MAP: dict[tuple[int, int, int], str] = {
    (1, 1, 1): "qian",   # 乾 ☰ Heaven
    (0, 0, 0): "kun",    # 坤 ☷ Earth
    (1, 0, 0): "gen",    # 艮 ☶ Mountain
    (0, 1, 0): "kan",    # 坎 ☵ Water
    (0, 0, 1): "zhen",   # 震 ☳ Thunder
    (1, 1, 0): "dui",    # 兌 ☱ Lake
    (1, 0, 1): "li",     # 離 ☲ Fire
    (0, 1, 1): "xun",    # 巽 ☴ Wind
}

_trigram_metadata: dict | None = None


def _load_trigram_metadata() -> dict:
    global _trigram_metadata
    if _trigram_metadata is None:
        with open(DATA_DIR / "trigrams.json", encoding="utf-8") as f:
            _trigram_metadata = json.load(f)
    return _trigram_metadata


def lines_to_trigram(lines: list[Line]) -> TrigramResult:
    """Convert 3 lines (bottom to top) to a TrigramResult with full metadata."""
    if len(lines) != 3:
        raise ValueError(f"Expected 3 lines, got {len(lines)}")

    key = (lines[0].value, lines[1].value, lines[2].value)
    trigram_id = TRIGRAM_MAP.get(key)
    if trigram_id is None:
        raise ValueError(f"No trigram matches line pattern {key}")

    meta = _load_trigram_metadata()[trigram_id]
    return TrigramResult(
        id=trigram_id,
        name_zh=meta["name_zh"],
        pinyin=meta["pinyin"],
        image_en=meta["image_en"],
        lines=(lines[0], lines[1], lines[2]),
    )
