from __future__ import annotations

import os
import json
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
CHAT_MODEL = os.getenv("OPENAI_CHAT_MODEL", "gpt-4.1-mini")


ADVICE_SYSTEM = """
You are a college application advisor assistant.

You MUST follow guardrails:
- Suggestions are not guarantees.
- Do not claim admissions certainty.
- Avoid making up achievements.
- If info is missing, say so and suggest how to fill it.

Output ONLY valid JSON. No markdown.

JSON schema:
{
  "guardrails": [str],
  "gap_summary": [str],
  "reach_strategy": {"bullets":[str], "actions":[{"action":str, "why":str, "difficulty":"easy"|"medium"|"hard"}]},
  "target_strategy": {"bullets":[str], "actions":[{"action":str, "why":str, "difficulty":"easy"|"medium"|"hard"}]},
  "safety_strategy": {"bullets":[str], "actions":[{"action":str, "why":str, "difficulty":"easy"|"medium"|"hard"}]},
  "next_30_days": [str]
}

Write practical, realistic actions a student can do.
"""

def _ensure_list(x):
    if isinstance(x, list):
        return x
    if isinstance(x, str) and x.strip():
        return [x.strip()]
    return []

def _ensure_strategy(obj):
    if not isinstance(obj, dict):
        return {"bullets": [], "actions": []}
    bullets = _ensure_list(obj.get("bullets"))
    actions = obj.get("actions")
    if not isinstance(actions, list):
        actions = []
    # normalize action items
    norm_actions = []
    for a in actions:
        if not isinstance(a, dict):
            continue
        norm_actions.append({
            "action": str(a.get("action") or "").strip(),
            "why": str(a.get("why") or "").strip(),
            "difficulty": a.get("difficulty") if a.get("difficulty") in ["easy", "medium", "hard"] else "medium",
        })
    return {"bullets": bullets, "actions": norm_actions}

def generate_advice(profile: dict, resume_parsed: dict, schools_by_category: dict) -> dict:
    user = {
        "student_profile": profile,
        "resume_structured": resume_parsed,
        "target_schools": schools_by_category,
        "task": (
            "Identify gaps vs these school categories and give strategies per category. "
            "Include guardrails and actionable next steps."
        ),
    }

    resp = client.chat.completions.create(
        model=CHAT_MODEL,
        temperature=0.2,
        messages=[
            {"role": "system", "content": ADVICE_SYSTEM},
            {"role": "user", "content": json.dumps(user)},
        ],
    )

    raw = resp.choices[0].message.content or "{}"
    data = json.loads(raw)

    # Normalize shape so frontend never crashes
    out = {
        "guardrails": _ensure_list(data.get("guardrails")),
        "gap_summary": _ensure_list(data.get("gap_summary")),
        "reach_strategy": _ensure_strategy(data.get("reach_strategy")),
        "target_strategy": _ensure_strategy(data.get("target_strategy")),
        "safety_strategy": _ensure_strategy(data.get("safety_strategy")),
        "next_30_days": _ensure_list(data.get("next_30_days")),
    }
    return out