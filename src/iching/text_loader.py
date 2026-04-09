import json
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"
HEXAGRAMS_DIR = DATA_DIR / "hexagrams"
SUPPLEMENT_PATH = DATA_DIR / "hexagram_english_supplement.json"

_supplement: dict[str, dict] | None = None


def _load_supplement() -> dict[str, dict]:
    global _supplement
    if _supplement is None:
        if SUPPLEMENT_PATH.is_file():
            with open(SUPPLEMENT_PATH, encoding="utf-8") as f:
                _supplement = json.load(f)
        else:
            _supplement = {}
    return _supplement


def load_hexagram_text(number: int) -> dict:
    """Load the classical text JSON for a given hexagram number (1-64).

    Returns a dict with keys: number, name_zh, name_full, structure,
    judgment, lines, tuan, xiang, and optionally wenyan, yong, and
    english_reference (if data/hexagram_english_supplement.json exists).
    """
    if not 1 <= number <= 64:
        raise ValueError(f"Hexagram number must be 1-64, got {number}")

    path = HEXAGRAMS_DIR / f"{number:02d}.json"
    if not path.exists():
        return _placeholder(number)

    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    extra = _load_supplement().get(str(number))
    if extra:
        data = {**data, "english_reference": extra}
    return data


def _placeholder(number: int) -> dict:
    """Return a minimal placeholder when the parsed JSON doesn't exist yet."""
    ph = _placeholder_core(number)
    extra = _load_supplement().get(str(number))
    if extra:
        ph["english_reference"] = extra
    return ph


def _placeholder_core(number: int) -> dict:
    return {
        "number": number,
        "name_zh": "",
        "name_full": "",
        "structure": "",
        "judgment": "",
        "lines": [],
        "yong": None,
        "tuan": "",
        "xiang": "",
        "wenyan": None,
    }
