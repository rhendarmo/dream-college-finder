from dataclasses import dataclass
from app.models.profile import Profile
from app.models.school import School


@dataclass(frozen=True)
class ScoredSchool:
    school: School
    score: float
    probability: float
    category: str
    reason: str


def _clamp01(x: float) -> float:
    return max(0.0, min(1.0, x))


def score_school_v1(profile: Profile, school: School) -> ScoredSchool:
    """
    V1 heuristic:
    - Compare GPA and SAT (if present) to school averages
    - Add a small boost for location match
    - Convert to probability and category
    """
    score = 0.0
    reason_parts: list[str] = []

    # GPA comparison
    if school.avg_gpa is not None:
        gpa_diff = profile.gpa - school.avg_gpa  # positive is good
        score += gpa_diff * 2.0
        reason_parts.append(f"GPA vs avg ({profile.gpa:.2f} vs {school.avg_gpa:.2f})")

    # SAT comparison
    if profile.sat is not None and school.avg_sat is not None:
        sat_diff = profile.sat - school.avg_sat
        score += sat_diff / 80.0  # scaled
        reason_parts.append(f"SAT vs avg ({profile.sat} vs {school.avg_sat})")

    # Acceptance rate as slight baseline (easier schools slightly higher probability)
    if school.acceptance_rate is not None:
        score += (school.acceptance_rate - 0.5) * 1.0
        reason_parts.append(f"Acceptance rate ({school.acceptance_rate:.0%})")

    # Location preference boost
    if profile.location_preference and school.state:
        if profile.location_preference.strip().upper() == school.state.strip().upper():
            score += 0.5
            reason_parts.append(f"Location match ({school.state})")

    # Probability mapping (simple sigmoid-ish)
    probability = _clamp01(0.5 + score * 0.08)

    # Category thresholds
    if probability >= 0.70:
        category = "safety"
    elif probability >= 0.45:
        category = "target"
    else:
        category = "reach"

    reason = "; ".join(reason_parts) if reason_parts else "Basic fit score"
    return ScoredSchool(school=school, score=score, probability=probability, category=category, reason=reason)


def rank_schools_v1(profile: Profile, schools: list[School], top_k: int = 10) -> list[ScoredSchool]:
    scored = [score_school_v1(profile, s) for s in schools]
    scored.sort(key=lambda x: x.score, reverse=True)
    return scored[:top_k]