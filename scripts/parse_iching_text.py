#!/usr/bin/env python3
"""Build data/hexagrams/01.json … 64.json from the epub (King Wen order).

Reads raw_data/book-23-周易.epub (zip of XHTML). Each hexagram is one chapter:
Chapter684 = 1 … Chapter747 = 64.

Judgment and six line texts come from clean <p> blocks. name_full / structure
come from a static King Wen table (no raw .txt required). Commentary fields
彖曰 / 象曰 / 文言曰 are left empty for now.
"""

from __future__ import annotations

import json
import re
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EPUB_PATH = ROOT / "raw_data" / "book-23-周易.epub"
OUT_DIR = ROOT / "data" / "hexagrams"

# King Wen sequence: canonical short name, full image name, upper/lower structure.
# Hex 33 is 遯 in some fonts; we normalize to 遁 for API consistency.
HEX_METADATA: list[tuple[str, str, str]] = [
    ("乾", "乾为天", "乾上乾下"),
    ("坤", "坤为地", "坤上坤下"),
    ("屯", "水雷屯", "坎上震下"),
    ("蒙", "山水蒙", "艮上坎下"),
    ("需", "水天需", "坎上乾下"),
    ("讼", "天水讼", "乾上坎下"),
    ("师", "地水师", "坤上坎下"),
    ("比", "水地比", "坎上坤下"),
    ("小畜", "风天小畜", "巽上乾下"),
    ("履", "天泽履", "乾上兑下"),
    ("泰", "天地泰", "坤上乾下"),
    ("否", "地天否", "乾上坤下"),
    ("同人", "天火同人", "乾上离下"),
    ("大有", "火天大有", "离上乾下"),
    ("谦", "地山谦", "坤上艮下"),
    ("豫", "雷地豫", "震上坤下"),
    ("随", "泽雷随", "兑上震下"),
    ("蛊", "山风蛊", "艮上巽下"),
    ("临", "地泽临", "坤上兑下"),
    ("观", "风地观", "巽上坤下"),
    ("噬嗑", "火雷噬嗑", "离上震下"),
    ("贲", "山火贲", "艮上离下"),
    ("剥", "山地剥", "艮上坤下"),
    ("复", "地雷复", "坤上震下"),
    ("无妄", "天雷无妄", "乾上震下"),
    ("大畜", "山天大畜", "艮上乾下"),
    ("颐", "山雷颐", "艮上震下"),
    ("大过", "泽风大过", "兑上巽下"),
    ("坎", "坎为水", "坎上坎下"),
    ("离", "离为火", "离上离下"),
    ("咸", "泽山咸", "兑上艮下"),
    ("恒", "雷风恒", "震上巽下"),
    ("遁", "天山遁", "乾上艮下"),
    ("大壮", "雷天大壮", "震上乾下"),
    ("晋", "火地晋", "离上坤下"),
    ("明夷", "地火明夷", "坤上离下"),
    ("家人", "风火家人", "巽上离下"),
    ("睽", "火泽睽", "离上兑下"),
    ("蹇", "水山蹇", "坎上艮下"),
    ("解", "雷水解", "震上坎下"),
    ("损", "山泽损", "艮上兑下"),
    ("益", "风雷益", "巽上震下"),
    ("夬", "泽天夬", "兑上乾下"),
    ("姤", "天风姤", "乾上巽下"),
    ("萃", "泽地萃", "兑上坤下"),
    ("升", "地风升", "坤上巽下"),
    ("困", "泽水困", "兑上坎下"),
    ("井", "水风井", "坎上巽下"),
    ("革", "泽火革", "兑上离下"),
    ("鼎", "火风鼎", "离上巽下"),
    ("震", "震为雷", "震上震下"),
    ("艮", "艮为山", "艮上艮下"),
    ("渐", "风山渐", "巽上艮下"),
    ("归妹", "雷泽归妹", "震上兑下"),
    ("丰", "雷火丰", "震上离下"),
    ("旅", "火山旅", "离上艮下"),
    ("巽", "巽为风", "巽上巽下"),
    ("兑", "兑为泽", "兑上兑下"),
    ("涣", "风水涣", "巽上坎下"),
    ("节", "水泽节", "坎上兑下"),
    ("中孚", "风泽中孚", "巽上兑下"),
    ("小过", "雷山小过", "震上艮下"),
    ("既济", "水火既济", "坎上离下"),
    ("未济", "火水未济", "离上坎下"),
]

# Epub h1 may use 遯; we treat as 遁.
EPUB_NAME_NORMALIZE = {"遯": "遁"}

LINE_PREFIX_RE = re.compile(
    r"^(初九|初六|九二|六二|九三|六三|九四|六四|九五|六五|上九|上六)[：:]\s*(.+)$",
    re.DOTALL,
)
YONG_RE = re.compile(r"^(用九|用六)[：:]\s*(.+)$", re.DOTALL)
H1_RE = re.compile(r"<h1[^>]*>(.*?)</h1>", re.IGNORECASE | re.DOTALL)
P_RE = re.compile(r"<p[^>]*>(.*?)</p>", re.IGNORECASE | re.DOTALL)


def _strip_html(fragment: str) -> str:
    text = re.sub(r"<[^>]+>", "", fragment)
    text = text.replace("\r", "").replace("\n", " ")
    return re.sub(r"\s+", " ", text).strip()


def _chapter_path(number: int) -> str:
    return f"OEBPS/Chapter{683 + number}.html"


def parse_chapter_html(html: str, number: int) -> dict:
    h1_m = H1_RE.search(html)
    if not h1_m:
        raise ValueError(f"Hex {number}: no <h1>")
    title = _strip_html(h1_m.group(1))
    if not title.endswith("卦"):
        raise ValueError(f"Hex {number}: unexpected title {title!r}")
    epub_name = title[:-1]
    name_zh = EPUB_NAME_NORMALIZE.get(epub_name, epub_name)

    meta_name, name_full, structure = HEX_METADATA[number - 1]
    if name_zh != meta_name:
        raise ValueError(
            f"Hex {number}: epub name {name_zh!r} != metadata {meta_name!r}"
        )

    paras = [_strip_html(m.group(1)) for m in P_RE.finditer(html)]
    if not paras:
        raise ValueError(f"Hex {number}: no <p> paragraphs")

    judgment_raw = paras[0]
    judgment = _normalize_judgment(judgment_raw, name_zh)

    lines: list[dict] = []
    yong: str | None = None
    rest = paras[1:]

    for raw in rest:
        raw = raw.strip()
        if not raw:
            continue
        ym = YONG_RE.match(raw)
        if ym:
            yong = f"{ym.group(1)}：{ym.group(2).strip()}"
            continue
        lm = LINE_PREFIX_RE.match(raw)
        if not lm:
            raise ValueError(f"Hex {number}: unparseable paragraph: {raw[:80]!r}…")
        lines.append({"position": lm.group(1), "text": lm.group(2).strip()})

    if len(lines) != 6:
        raise ValueError(f"Hex {number}: expected 6 lines, got {len(lines)}")

    return {
        "number": number,
        "name_zh": name_zh,
        "name_full": name_full,
        "structure": structure,
        "judgment": judgment,
        "lines": lines,
        "yong": yong,
        "tuan": "",
        "xiang": "",
        "wenyan": None,
    }


def _normalize_judgment(raw: str, name_zh: str) -> str:
    """Remove 《名》 or bare name prefix before the colon."""
    raw = raw.strip()
    for wrapped in (f"《{name_zh}》", f"《{name_zh}{name_zh}》"):  # epub typo 坎坎
        if raw.startswith(wrapped):
            tail = raw[len(wrapped) :].lstrip()
            if tail.startswith("：") or tail.startswith(":"):
                return tail[1:].strip()
            return tail
    if raw.startswith(f"{name_zh}："):
        return raw[len(name_zh) + 1 :].strip()
    if raw.startswith(f"{name_zh}:"):
        return raw[len(name_zh) + 1 :].strip()
    return raw


def main() -> None:
    if not EPUB_PATH.is_file():
        print(f"Error: epub not found at {EPUB_PATH}")
        sys.exit(1)

    if len(HEX_METADATA) != 64:
        print("Error: HEX_METADATA must have 64 entries")
        sys.exit(1)

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    with zipfile.ZipFile(EPUB_PATH) as zf:
        for number in range(1, 65):
            path = _chapter_path(number)
            try:
                html = zf.read(path).decode("utf-8")
            except KeyError:
                print(f"Error: missing {path} in epub")
                sys.exit(1)
            data = parse_chapter_html(html, number)
            out = OUT_DIR / f"{number:02d}.json"
            out.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
            print(f"  [{number:02d}] {data['name_zh']} → {out.name}")

    print(f"\nDone. 64 files written to {OUT_DIR}/")


if __name__ == "__main__":
    main()
