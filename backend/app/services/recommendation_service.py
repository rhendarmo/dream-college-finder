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
    schools = [s for s in schools if getattr(s, "name", None) and getattr(s, "unitid", None)]

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
            safety = max(0, safety - 1)

    return {"Reach": reach, "Target": target, "Safety": safety}


def _is_complete_for_user_value(s: School) -> bool:
    """
    "complete" = has SAT or ACT available (so we don't have to rely on admission-rate fallback).
    Your screenshot referenced: s.sat_avg / s.act_mid.
    This is written defensively to also support alternative field names if your model differs.
    """
    sat = getattr(s, "sat_avg", None)
    if sat is None:
        sat = getattr(s, "avg_sat", None)

    act = getattr(s, "act_mid", None)
    if act is None:
        act = getattr(s, "actcmmid", None)

    return (sat is not None) or (act is not None)


def rank_schools_v2_balanced(
    session: Session,
    profile: Profile,
    schools: list[School],
    top_k: int = 10,
) -> list[ScoredSchool]:
    """
    Produces a meaningful mix (Reach/Target/Safety) and strongly respects state preference,
    while preferring "complete" schools (SAT or ACT present). Incomplete schools are a last resort.
    """
    # 1) Practical cleanup (keep your original lightweight check)
    schools = [s for s in schools if getattr(s, "name", None) and getattr(s, "unitid", None)]

    # 2) Strong state preference: rank in-state first, fallback to all
    pref = (getattr(profile, "location_preference", None) or "").strip().upper()
    in_state = (
        [s for s in schools if getattr(s, "state", None) and s.state.strip().upper() == pref]
        if pref
        else []
    )

    # If pref exists but in_state is small, still start with in_state then fallback later
    primary_pool = in_state if pref else schools
    fallback_pool = [s for s in schools if s not in primary_pool] if pref else []

    # 3) Split primary/fallback into complete/incomplete
    primary_complete = [s for s in primary_pool if _is_complete_for_user_value(s)]
    primary_incomplete = [s for s in primary_pool if not _is_complete_for_user_value(s)]

    fallback_complete = [s for s in fallback_pool if _is_complete_for_user_value(s)]
    fallback_incomplete = [s for s in fallback_pool if not _is_complete_for_user_value(s)]

    # 4) Score complete first
    scored_primary = [score_school_v2(session, profile, s) for s in primary_complete]
    scored_fallback = [score_school_v2(session, profile, s) for s in fallback_complete]

    # Only used as last resort if we still don't have enough
    scored_primary_incomplete = [score_school_v2(session, profile, s) for s in primary_incomplete]
    scored_fallback_incomplete = [score_school_v2(session, profile, s) for s in fallback_incomplete]

    # 5) Bucket by category, sort each bucket by probability desc
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

    # 6) Fill quotas from COMPLETE pools: primary first (in-state), then fallback
    for cat in ["Reach", "Target", "Safety"]:
        want = quota.get(cat, 0)
        got, remaining = take_from(b1, cat, want)
        picked.extend(got)

        if remaining > 0:
            got2, _ = take_from(b2, cat, remaining)
            picked.extend(got2)

    # 7) If still not full, fill with best remaining COMPLETE overall
    if len(picked) < top_k:
        remaining = []
        for cat in ["Reach", "Target", "Safety"]:
            remaining.extend(b1.get(cat, []))
            remaining.extend(b2.get(cat, []))
        remaining.sort(key=lambda z: z.probability, reverse=True)

        seen = set((x.school.id for x in picked if getattr(x.school, "id", None) is not None))
        for x in remaining:
            if len(picked) >= top_k:
                break
            sid = getattr(x.school, "id", None)
            if sid is not None and sid in seen:
                continue
            picked.append(x)
            if sid is not None:
                seen.add(sid)

    # 8) LAST RESORT: include INCOMPLETE only after complete is exhausted
    if len(picked) < top_k:
        b1i = bucketize(scored_primary_incomplete)
        b2i = bucketize(scored_fallback_incomplete)

        remaining = []
        for cat in ["Reach", "Target", "Safety"]:
            remaining.extend(b1i.get(cat, []))
            remaining.extend(b2i.get(cat, []))
        remaining.sort(key=lambda z: z.probability, reverse=True)

        seen = set((x.school.id for x in picked if getattr(x.school, "id", None) is not None))
        for x in remaining:
            if len(picked) >= top_k:
                break
            sid = getattr(x.school, "id", None)
            if sid is not None and sid in seen:
                continue
            picked.append(x)
            if sid is not None:
                seen.add(sid)

    return picked[:top_k]


# -------------------------
# V1 (OLD) — keep if you want
# -------------------------

def _clamp01(x: float) -> float:
    return max(0.0, min(1.0, x))


def score_school_v1(profile: Profile, school: School) -> ScoredSchool:
    score = 0.0
    reason_parts: list[str] = []

    if getattr(school, "avg_gpa", None) is not None:
        gpa_diff = profile.gpa - school.avg_gpa
        score += gpa_diff * 2.0
        reason_parts.append(f"GPA vs avg ({profile.gpa:.2f} vs {school.avg_gpa:.2f})")

    if getattr(profile, "sat", None) is not None and getattr(school, "avg_sat", None) is not None:
        sat_diff = profile.sat - school.avg_sat
        score += sat_diff / 80.0
        reason_parts.append(f"SAT vs avg ({profile.sat} vs {school.avg_sat})")

    if getattr(school, "acceptance_rate", None) is not None:
        score += (school.acceptance_rate - 0.5) * 1.0
        reason_parts.append(f"Acceptance rate ({school.acceptance_rate:.0%})")

    if getattr(profile, "location_preference", None) and getattr(school, "state", None):
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
    return ScoredSchool(
        school=school,
        probability=probability,
        category=category,
        reason=reason,
        score=score,
    )


def rank_schools_v1(profile: Profile, schools: list[School], top_k: int = 10) -> list[ScoredSchool]:
    scored = [score_school_v1(profile, s) for s in schools]
    scored.sort(key=lambda x: (x.score or 0.0), reverse=True)
    return scored[:top_k]