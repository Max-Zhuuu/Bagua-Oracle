from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from src.api.schemas import CastRequest
from src.iching.types import Reading
from src.iching.faces import faces_to_lines
from src.iching.trigrams import lines_to_trigram
from src.iching.hexagrams import build_hexagram
from src.interpretation.prompt_builder import build_interpretation_prompt
from src.interpretation.llm_client import generate_interpretation

app = FastAPI(
    title="AI 八卦骨卜",
    description="I Ching divination backend with bone-casting input and LLM interpretation",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/cast", response_model=Reading)
def cast(request: CastRequest):
    try:
        lower_lines = faces_to_lines(list(request.throw_1))
        upper_lines = faces_to_lines(list(request.throw_2))

        lower_trigram = lines_to_trigram(lower_lines)
        upper_trigram = lines_to_trigram(upper_lines)

        hexagram = build_hexagram(lower_trigram, upper_trigram)

        prompt = build_interpretation_prompt(request.question, hexagram)
        interpretation = generate_interpretation(prompt)

        return Reading(
            question=request.question,
            hexagram=hexagram,
            interpretation=interpretation,
        )
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
