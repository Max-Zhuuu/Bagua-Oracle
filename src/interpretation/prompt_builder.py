from src.iching.types import HexagramResult


def build_interpretation_prompt(question: str, hexagram: HexagramResult) -> str:
    """Build the system + user prompt for Claude to interpret an I Ching reading."""

    ct = hexagram.classical_text

    line_texts = ""
    if ct.get("lines"):
        line_texts = "\n".join(
            f"  {line['position']}：{line['text']}" for line in ct["lines"]
        )

    yong_text = f"\n用辞：{ct['yong']}" if ct.get("yong") else ""
    tuan_text = f"\n彖曰：{ct['tuan']}" if ct.get("tuan") else ""
    xiang_text = f"\n象曰：{ct['xiang']}" if ct.get("xiang") else ""
    wenyan_text = f"\n文言曰：{ct['wenyan']}" if ct.get("wenyan") else ""

    eng = ct.get("english_reference")
    if eng:
        topics = eng.get("example_topics") or []
        topics_txt = "\n".join(f"  - {t}" for t in topics) if topics else "  (none listed)"
        english_ref_text = f"""
English index (historical translation; romanization may differ from modern pinyin):
  Romanization: {eng.get("romanization", "")}
  Line: ({eng.get("parenthetical", "")})
  Sample topics once cast for this hexagram (for context only, not the current question):
{topics_txt}
"""
    else:
        english_ref_text = ""

    return f"""You are an I Ching (易經) divination master. Answer in English.

Write at most TWO sentences total. Be brief. It may be somewhat vague or oracular.
Focus mainly on what the combined image means: the UPPER trigram ({hexagram.upper.image_en}) over the LOWER trigram ({hexagram.lower.image_en}), and how that bears on the querent's question. You do not need to quote the judgment or line texts at length.

Rules:
- Plain text only. Do NOT use markdown, asterisks, bold, italics, bullets, or numbered lists.
- No more than two sentences. No preamble or sign-off.

---

QUERENT'S QUESTION: {question}

HEXAGRAM #{hexagram.number}: {ct.get('name_zh', '')} — {ct.get('name_full', '')}
Structure: {ct.get('structure', '')}
Image: {hexagram.upper.image_en} over {hexagram.lower.image_en}
Lower trigram: {hexagram.lower.id} ({hexagram.lower.name_zh} — {hexagram.lower.image_en})
Upper trigram: {hexagram.upper.id} ({hexagram.upper.name_zh} — {hexagram.upper.image_en})

卦辞 (Judgment)：{ct.get('judgment', '')}

爻辞 (Line texts):
{line_texts}{yong_text}{tuan_text}{xiang_text}{wenyan_text}{english_ref_text}"""
