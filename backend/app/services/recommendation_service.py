from dataclasses import dataclass
from typing import Optional
from collections import defaultdict

from sqlalchemy.orm import Session

from app.models.profile import Profile
from app.models.school import School
from app.services.recommendation_engine_v2 import compute_fit


@dataclass(frozen=True)
class ScoredSchool:
    school: School
    # keep these so your API response can stay the same
    probability: float
    category: str
    reason: str
    # optional: if you still want a "score" field, just mirror probability
    score: Optional[float] = None


# -------------------------
# V2 (NEW) — uses compute_fit
# -------------------------

def score_school_v2(session: Session, profile: Profile, school: School) -> ScoredSchool:
    # compute_fit returns: prob, category, reason, breakdown
    prob, category, reason, _breakdown = compute_fit(session, profile, school)

    # If you want "score" for backwards compatibility, set it to prob
    return ScoredSchool(
        school=school,
        probability=prob,
        category=category,
        reason=reason,
        score=prob,
    )


def rank_schools_v2(
    session: Session,
    profile: Profile,
    schools: list[School],
    top_k: int = 10,
) -> list[ScoredSchool]:
    # Optional: filter out schools missing critical fields (adjust as you want)
    # Example: only keep schools with a name + unitid
    schools = [s for s in schools if s.name and s.unitid]

    items = [score_school_v2(session, profile, s) for s in schools]
    items.sort(key=lambda x: x.probability, reverse=True)
    return items[:top_k]

def _quota_for_topk(top_k: int) -> dict[str, int]:
    """
    Default mix: 3 reach, 5 target, 2 safety for top_k=10.
    For other top_k, scale roughly.
    """
    if top_k <= 3:
        return {"Reach": 1, "Target": max(0, top_k - 1), "Safety": 0}

    # proportions based on 10: Reach 30%, Target 50%, Safety 20%
    reach = round(top_k * 0.30)
    safety = round(top_k * 0.20)
    target = top_k - reach - safety

    # ensure at least 1 target
    if target <= 0:
        target = 1
        if reach > 0:
            reach -= 1
        else:
            safety -= 1

    return {"Reach": reach, "Target": target, "Safety": safety}


def rank_schools_v2_balanced(
    session: Session,
    profile: Profile,
    schools: list[School],
    top_k: int = 10,
) -> list[ScoredSchool]:
    """
    Produces a meaningful mix (Reach/Target/Safety) and strongly respects state preference.
    """
    # 1) Practical cleanup (keep your original lightweight check)
    schools = [s for s in schools if s.name and s.unitid]

    # 2) Strong state preference: rank in-state first, fallback to all
    pref = (profile.location_preference or "").strip().upper()
    in_state = [s for s in schools if s.state and s.state.strip().upper() == pref] if pref else []
    pool = in_state if (pref and len(in_state) >= max(5, top_k // 2)) else schools
    # If pref exists but in_state is small, still start with in_state then fallback later
    primary_pool = in_state if pref else schools
    fallback_pool = [s for s in schools if s not in primary_pool] if pref else []

    # 3) Score everything once (primary + fallback)
    scored_primary = [score_school_v2(session, profile, s) for s in primary_pool]
    scored_fallback = [score_school_v2(session, profile, s) for s in fallback_pool]

    # 4) Bucket by category, sort each bucket by probability desc
    def bucketize(scored: list[ScoredSchool]):
        buckets = defaultdict(list)
        for x in scored:
            buckets[x.category].append(x)
        for k in buckets:
            buckets[k].sort(key=lambda z: z.probability, reverse=True)
        return buckets

    b1 = bucketize(scored_primary)
    b2 = bucketize(scored_fallback)

    quota = _quota_for_topk(top_k)

    picked: list[ScoredSchool] = []

    def take_from(buckets, cat, n):
        out = []
        while n > 0 and buckets.get(cat):
            out.append(buckets[cat].pop(0))
            n -= 1
        return out, n

    # 5) Fill quotas from in-state first (if pref provided), then fallback
    for cat in ["Reach", "Target", "Safety"]:
        want = quota.get(cat, 0)
        got, remaining = take_from(b1, cat, want)
        picked.extend(got)

        if remaining > 0:
            got2, _ = take_from(b2, cat, remaining)
            picked.extend(got2)

    # 6) If still not full (missing categories), fill with best remaining overall
    if len(picked) < top_k:
        remaining = []
        for cat in ["Reach", "Target", "Safety"]:
            remaining.extend(b1.get(cat, []))
            remaining.extend(b2.get(cat, []))
        remaining.sort(key=lambda z: z.probability, reverse=True)

        seen = set((x.school.id for x in picked))
        for x in remaining:
            if len(picked) >= top_k:
                break
            if x.school.id in seen:
                continue
            picked.append(x)
            seen.add(x.school.id)

    return picked[:top_k]


# -------------------------
# V1 (OLD) — keep if you want
# -------------------------

def _clamp01(x: float) -> float:
    return max(0.0, min(1.0, x))


def score_school_v1(profile: Profile, school: School) -> ScoredSchool:
    score = 0.0
    reason_parts: list[str] = []

    if school.avg_gpa is not None:
        gpa_diff = profile.gpa - school.avg_gpa
        score += gpa_diff * 2.0
        reason_parts.append(f"GPA vs avg ({profile.gpa:.2f} vs {school.avg_gpa:.2f})")

    if profile.sat is not None and school.avg_sat is not None:
        sat_diff = profile.sat - school.avg_sat
        score += sat_diff / 80.0
        reason_parts.append(f"SAT vs avg ({profile.sat} vs {school.avg_sat})")

    if school.acceptance_rate is not None:
        score += (school.acceptance_rate - 0.5) * 1.0
        reason_parts.append(f"Acceptance rate ({school.acceptance_rate:.0%})")

    if profile.location_preference and school.state:
        if profile.location_preference.strip().upper() == school.state.strip().upper():
            score += 0.5
            reason_parts.append(f"Location match ({school.state})")

    probability = _clamp01(0.5 + score * 0.08)

    if probability >= 0.70:
        category = "safety"
    elif probability >= 0.45:
        category = "target"
    else:
        category = "reach"

    reason = "; ".join(reason_parts) if reason_parts else "Basic fit score"
    return ScoredSchool(school=school, probability=probability, category=category, reason=reason, score=score)


def rank_schools_v1(profile: Profile, schools: list[School], top_k: int = 10) -> list[ScoredSchool]:
    scored = [score_school_v1(profile, s) for s in schools]
    scored.sort(key=lambda x: (x.score or 0.0), reverse=True)
    return scored[:top_k]