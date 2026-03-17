from __future__ import annotations

import os
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
CHAT_MODEL = os.getenv("OPENAI_CHAT_MODEL", "gpt-4.1-mini")


PARSER_SYSTEM = """
You are a resume parser. Convert resume text into structured JSON.
Return ONLY valid JSON. No markdown. No extra commentary.

Schema:
{
  "education": [{"school": str, "degree": str|null, "major": str|null, "start": str|null, "end": str|null, "gpa": str|null, "courses": [str]}],
  "experience": [{"title": str, "org": str, "location": str|null, "start": str|null, "end": str|null, "bullets": [str]}],
  "projects": [{"name": str, "role": str|null, "start": str|null, "end": str|null, "bullets": [str], "tech": [str]}],
  "activities": [{"name": str, "role": str|null, "start": str|null, "end": str|null, "bullets": [str]}],
  "awards": [{"name": str, "year": str|null, "details": str|null}],
  "skills": {"languages":[str], "tools":[str], "frameworks":[str], "other":[str]},
  "summary": str|null
}

Rules:
- If a field is missing, use null or empty list.
- Keep bullets concise (max ~20 words each).
"""


def parse_resume_to_json(resume_text: str) -> dict:
    user = f"RESUME TEXT:\n{resume_text}\n\nReturn JSON now."
    resp = client.chat.completions.create(
        model=CHAT_MODEL,
        temperature=0.0,
        messages=[
            {"role": "system", "content": PARSER_SYSTEM},
            {"role": "user", "content": user},
        ],
    )
    content = resp.choices[0].message.content or "{}"
    # Let json parsing fail loudly if model returns invalid JSON
    import json
    return json.loads(content)