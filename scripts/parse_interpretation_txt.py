#!/usr/bin/env python3
"""Parse raw_data/interpretation.txt into data/hexagram_english_supplement.json.

The source file is a numbered English index (romanization + parenthetical
Chinese / hex glyph / gloss) with optional following lines listing historical
example topics. Output is keyed by hexagram number as a string \"1\"..\"64\".
"""

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "raw_data" / "interpretation.txt"
OUT = ROOT / "data" / "hexagram_english_supplement.json"


def parse_blocks(text: str) -> dict[str, dict]:
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    parts = re.split(r"(?m)^(?=\d+\.\s)", text)
    out: dict[str, dict] = {}
    for part in parts:
        part = part.strip()
        if not part:
            continue
        lines = part.split("\n")
        header = lines[0].strip()
        topics = [ln.strip() for ln in lines[1:] if ln.strip()]

        m = re.match(r"^(\d+)\.\s*", header)
        if not m:
            continue
        num = int(m.group(1))
        rest = header[m.end() :]
        open_idx = rest.find("(")
        close_idx = rest.rfind(")")
        if open_idx < 0 or close_idx <= open_idx:
            continue
        romanization = rest[:open_idx].strip()
        parenthetical = rest[open_idx + 1 : close_idx].strip()

        out[str(num)] = {
            "romanization": romanization,
            "parenthetical": parenthetical,
            "example_topics": topics,
        }
    return out


def main() -> None:
    if not SRC.is_file():
        raise SystemExit(f"Missing {SRC}")
    data = parse_blocks(SRC.read_text(encoding="utf-8"))
    if len(data) != 64:
        raise SystemExit(f"Expected 64 entries, got {len(data)}")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {OUT} ({len(data)} hexagrams)")


if __name__ == "__main__":
    main()
