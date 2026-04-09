import os

import anthropic
from dotenv import load_dotenv

load_dotenv()

MODEL = "claude-sonnet-4-5"


def generate_interpretation(prompt: str) -> str:
    """Call the Anthropic API to generate an I Ching interpretation.

    Expects ANTHROPIC_API_KEY to be set in the environment or .env file.
    """
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError(
            "ANTHROPIC_API_KEY not set. Copy .env.example to .env and add your key."
        )

    client = anthropic.Anthropic(api_key=api_key)

    try:
        message = client.messages.create(
            model=MODEL,
            max_tokens=120,
            messages=[
                {"role": "user", "content": prompt},
            ],
        )
    except anthropic.APIError as e:
        raise RuntimeError(f"Anthropic API error: {e}") from e

    if not message.content:
        raise RuntimeError("Empty response from Anthropic API")

    return message.content[0].text
