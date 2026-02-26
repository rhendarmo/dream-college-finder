from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class CipMatch:
    cip2: str
    weight: float


# Simple keyword map. We can expand later.
KEYWORD_TO_CIP = [
    (["computer", "software", "cs", "informatics", "data science", "ai", "machine learning"], [CipMatch("11", 1.0)]),
    (["business", "finance", "accounting", "marketing", "analytics", "management"], [CipMatch("52", 1.0)]),
    (["math", "statistics", "stat", "econometrics"], [CipMatch("27", 1.0)]),
    (["engineering", "mechanical", "electrical", "civil", "chemical"], [CipMatch("14", 1.0)]),
    (["biology", "biochem", "neuroscience"], [CipMatch("26", 1.0)]),
    (["psychology"], [CipMatch("42", 1.0)]),
    (["nursing"], [CipMatch("51", 1.0)]),
    (["education", "teaching"], [CipMatch("13", 1.0)]),
    (["political", "international relations", "government"], [CipMatch("45", 1.0)]),
    (["communications", "media", "journalism"], [CipMatch("09", 1.0)]),
]


def major_to_cip2(intended_major: str) -> list[CipMatch]:
    m = (intended_major or "").strip().lower()
    matches: list[CipMatch] = []
    for keywords, cips in KEYWORD_TO_CIP:
        if any(k in m for k in keywords):
            matches.extend(cips)

    # default: business if unknown (safe fallback)
    if not matches:
        matches = [CipMatch("52", 0.6), CipMatch("27", 0.4)]
    return matches