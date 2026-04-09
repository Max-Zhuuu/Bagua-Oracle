import json
from pathlib import Path

from src.iching.types import HexagramResult, TrigramResult
from src.iching.text_loader import load_hexagram_text

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"

_hexagram_lookup: dict[str, int] | None = None


def _load_lookup() -> dict[str, int]:
    global _hexagram_lookup
    if _hexagram_lookup is None:
        with open(DATA_DIR / "hexagram_lookup.json", encoding="utf-8") as f:
            _hexagram_lookup = json.load(f)
    return _hexagram_lookup


def lookup_hexagram_number(lower_id: str, upper_id: str) -> int:
    """Look up the King Wen hexagram number from lower and upper trigram IDs."""
    lookup = _load_lookup()
    key = f"{lower_id}-{upper_id}"
    number = lookup.get(key)
    if number is None:
        raise ValueError(f"No hexagram found for key '{key}'")
    return number


def build_hexagram(lower: TrigramResult, upper: TrigramResult) -> HexagramResult:
    """Build a full HexagramResult from lower and upper trigrams."""
    number = lookup_hexagram_number(lower.id, upper.id)
    classical_text = load_hexagram_text(number)

    return HexagramResult(
        number=number,
        name_zh=classical_text.get("name_zh", ""),
        lower=lower,
        upper=upper,
        classical_text=classical_text,
    )
