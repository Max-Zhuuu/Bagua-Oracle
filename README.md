# AI 八卦骨卜 — I Ching Bone Oracle

An I Ching (易經) divination backend. Physical bones are cast onto a plate, their landing faces are classified, and the system maps the result to one of 64 hexagrams with classical text and an LLM-generated interpretation.

## Setup

```bash
cd ai-bagua-oracle
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

Copy the environment file and add your Anthropic API key:

```bash
cp .env.example .env
# edit .env with your key
```

## Prepare hexagram JSON (from epub)

Keep `raw_data/book-23-周易.epub` in place (or replace it with the same chapter layout: `OEBPS/Chapter684.html` … `Chapter747.html`). Then run:

```bash
python scripts/parse_iching_text.py
```

This writes 64 files to `data/hexagrams/` (judgment + six lines + 用九/用六 where present). 彖曰 / 象曰 / 文言曰 are left empty until you add another source or extend the script.

Optional: if you keep `raw_data/interpretation.txt` (English index with sample cast topics), run:

```bash
python scripts/parse_interpretation_txt.py
```

That creates `data/hexagram_english_supplement.json`, which is merged into each hexagram load and passed to the LLM prompt as extra context.

## Run the Server

```bash
uvicorn src.api.server:app --reload
```

CORS allows `http://localhost:3000` for the web demo.

## Web demo (Next.js)

```bash
cd frontend
npm install
cp .env.example .env.local   # optional
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The UI calls the API at `NEXT_PUBLIC_API_URL` (default `http://localhost:8000`). Run `uvicorn` from the **project root** (`ai-bagua-oracle/`) so `src` resolves.

## API Usage

### Health check

```bash
curl http://localhost:8000/health
```

### Cast a reading

```bash
curl -X POST http://localhost:8000/cast \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Should I change careers?",
    "throw_1": ["broad_a", "narrow_a", "broad_b"],
    "throw_2": ["narrow_b", "broad_a", "narrow_a"]
  }'
```

Each throw contains 3 face labels (one per bone). Valid faces: `broad_a`, `broad_b`, `narrow_a`, `narrow_b`.

## Simulate (CLI)

```bash
python scripts/simulate_cast.py
```

Interactive CLI that walks through the casting ritual and prints the full reading.

## Run Tests

```bash
pytest
```

## Note

LLM interpretation requires a valid `ANTHROPIC_API_KEY` in `.env`. The parse script does not use `iching_full.txt`; epub-only is enough to run the app.
