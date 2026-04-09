#!/usr/bin/env python3
"""Interactive CLI tool to simulate a bone-casting I Ching reading.

Walks the user through the ritual: ask a question, cast two throws of 3 bones
each, then displays the resulting hexagram and LLM interpretation.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.iching.types import Face
from src.iching.faces import faces_to_lines
from src.iching.trigrams import lines_to_trigram
from src.iching.hexagrams import build_hexagram
from src.interpretation.prompt_builder import build_interpretation_prompt
from src.interpretation.llm_client import generate_interpretation

VALID_FACES = {f.value for f in Face}


def read_faces(prompt_msg: str) -> list[Face]:
    """Prompt the user for 3 space-separated face labels and validate them."""
    while True:
        raw = input(prompt_msg).strip()
        tokens = raw.split()
        if len(tokens) != 3:
            print(f"  Please enter exactly 3 face labels, got {len(tokens)}.")
            continue
        try:
            faces = [Face(t) for t in tokens]
            return faces
        except ValueError:
            print(f"  Invalid face label. Valid options: {', '.join(sorted(VALID_FACES))}")


def print_trigram(label: str, tri):
    line_symbols = ["⚋" if l.value == 0 else "⚊" for l in tri.lines]
    print(f"  {label}: {tri.name_zh} {tri.pinyin} ({tri.image_en})")
    print(f"    Lines (bottom→top): {' '.join(line_symbols)}")


def main():
    print("=" * 60)
    print("  AI 八卦骨卜 — I Ching Bone Oracle Simulator")
    print("=" * 60)
    print()

    question = input("What is your question?\n> ").strip()
    if not question:
        print("No question entered. Exiting.")
        sys.exit(0)

    print()
    print("Cast the 3 bones for the LOWER trigram (throw 1).")
    print(f"  Enter 3 face labels separated by spaces.")
    print(f"  Valid faces: {', '.join(sorted(VALID_FACES))}")
    throw_1 = read_faces("Throw 1> ")

    print()
    print("Cast the 3 bones for the UPPER trigram (throw 2).")
    throw_2 = read_faces("Throw 2> ")

    print()
    print("-" * 60)

    lower_lines = faces_to_lines(throw_1)
    upper_lines = faces_to_lines(throw_2)

    lower_trigram = lines_to_trigram(lower_lines)
    upper_trigram = lines_to_trigram(upper_lines)

    print()
    print("TRIGRAMS:")
    print_trigram("Lower", lower_trigram)
    print_trigram("Upper", upper_trigram)

    hexagram = build_hexagram(lower_trigram, upper_trigram)

    print()
    print(f"HEXAGRAM #{hexagram.number}: {hexagram.classical_text.get('name_zh', '?')} "
          f"— {hexagram.classical_text.get('name_full', '?')}")
    print(f"  Image: {upper_trigram.image_en} over {lower_trigram.image_en}")
    print(f"  Structure: {hexagram.classical_text.get('structure', '?')}")

    ct = hexagram.classical_text
    if ct.get("judgment"):
        print(f"\n  卦辞 (Judgment): {ct['judgment']}")
    if ct.get("lines"):
        print("\n  爻辞 (Lines):")
        for line in ct["lines"]:
            print(f"    {line['position']}：{line['text']}")
    if ct.get("tuan"):
        print(f"\n  彖曰: {ct['tuan'][:200]}{'...' if len(ct.get('tuan', '')) > 200 else ''}")
    if ct.get("xiang"):
        print(f"\n  象曰: {ct['xiang'][:200]}{'...' if len(ct.get('xiang', '')) > 200 else ''}")

    print()
    print("-" * 60)
    print("Consulting the oracle...")
    print()

    try:
        prompt = build_interpretation_prompt(question, hexagram)
        interpretation = generate_interpretation(prompt)
        print("INTERPRETATION:")
        print()
        print(interpretation)
    except RuntimeError as e:
        print(f"LLM Error: {e}")
        print("(The hexagram data above is still valid — interpretation requires an API key.)")

    print()
    print("=" * 60)


if __name__ == "__main__":
    main()
