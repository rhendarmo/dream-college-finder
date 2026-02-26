from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from sqlmodel import Session, select

from app.models.profile import Profile
from app.models.school import School
from app.models.school_program import SchoolProgram
from app.services.scoring_utils import clamp, logistic, normalize_minmax
from app.services.cip_mapping import major_to_cip2


@dataclass
class ScoreBreakdown:
    academic: float
    major_fit: float
    affordability: float
    outcomes: float
    preference: float
    total: float


def _school_program_share(session: Session, unitid: int, cip2: str) -> float:
    row = session.exec(
        select(SchoolProgram).where(
            (SchoolProgram.school_unitid == unitid) & (SchoolProgram.cip2 == cip2)
        )
    ).first()
    return float(row.share) if row else 0.0


def compute_fit(session: Session, profile: Profile, school: School) -> tuple[float, str, str, ScoreBreakdown]:
    """
    Returns: (probability, category, reason, breakdown)
    """
    # ---------- 1) Academic match ----------
    # Use SAT if present else ACT else admission_rate proxy
    user_sat = profile.sat
    user_act = profile.act
    s_sat = school.sat_avg
    s_act = school.act_mid
    adm = school.admission_rate

    # Translate into a single "academic alignment" score in [0,1]
    academic = 0.5
    academic_reason = []

    if user_sat is not None and s_sat is not None:
        diff = user_sat - s_sat
        # 100 points above avg is strong; below is weaker
        academic = logistic(diff / 80.0)
        academic_reason.append(f"SAT {user_sat} vs school avg {s_sat}.")
    elif user_act is not None and s_act is not None:
        diff = user_act - s_act
        academic = logistic(diff / 3.0)
        academic_reason.append(f"ACT {user_act} vs school mid {s_act}.")
    elif adm is not None:
        # less selective (higher adm) is easier -> better chance
        academic = clamp(adm, 0.0, 1.0)
        academic_reason.append(f"Admission rate ~{adm:.0%}.")
    else:
        academic = 0.5
        academic_reason.append("Limited admissions test data available.")

    # GPA: mild adjustment (since Scorecard doesn't provide GPA distributions)
    # Treat 3.0 baseline; 4.0 max
    gpa_adj = normalize_minmax(profile.gpa, 2.5, 4.0)  # maps to [0,1]
    academic = clamp(0.75 * academic + 0.25 * gpa_adj)

    # ---------- 2) Major fit ----------
    cip_targets = major_to_cip2(profile.intended_major)
    major_fit = 0.0
    for m in cip_targets:
        major_fit += m.weight * _school_program_share(session, school.unitid, m.cip2)
    # scale to [0,1] but keep it meaningful (shares are usually <= 0.3)
    major_fit = clamp(major_fit / 0.35, 0.0, 1.0)

    # ---------- 3) Affordability ----------
    # Use in-state tuition if state matches, else out-of-state if available
    tuition = None
    if profile.location_preference and school.state and profile.location_preference.strip().upper() == school.state.strip().upper():
        tuition = school.tuition_in if school.tuition_in is not None else school.tuition_out
    else:
        tuition = school.tuition_out if school.tuition_out is not None else school.tuition_in

    # Lower tuition => higher score; normalize with realistic bounds
    affordability = 1.0 - normalize_minmax(tuition, 5000, 60000)

    # ---------- 4) Outcomes ----------
    grad = school.grad_rate_4yr if school.grad_rate_4yr is not None else school.grad_rate_lt4
    earn = school.median_earnings_10yr

    grad_score = normalize_minmax(grad, 0.2, 0.9)
    earn_score = normalize_minmax(earn, 25000, 90000)
    outcomes = clamp(0.5 * grad_score + 0.5 * earn_score)

    # ---------- 5) Preferences ----------
    preference = 0.5
    pref_reason = []
    if profile.location_preference and school.state:
        if profile.location_preference.strip().upper() == school.state.strip().upper():
            preference = 1.0
            pref_reason.append("Matches your state preference.")
        else:
            preference = 0.4
            pref_reason.append(f"Located in {school.state}, different from preference {profile.location_preference}.")
    else:
        preference = 0.5

    # ---------- Total score ----------
    # Weights tuned for practicality:
    # Academic 35%, Major 25%, Outcomes 20%, Affordability 15%, Preference 5%
    total = (
        0.35 * academic
        + 0.25 * major_fit
        + 0.20 * outcomes
        + 0.15 * affordability
        + 0.05 * preference
    )

    # Probability: convert total score into a more discriminative curve
    probability = clamp(logistic((total - 0.55) / 0.10), 0.0, 1.0)

    # Category: based primarily on academic chance (not total desirability)
    if academic >= 0.75:
        category = "Safety"
    elif academic >= 0.55:
        category = "Target"
    else:
        category = "Reach"

    # Reason: concise, human readable
    reason_parts = []
    if academic_reason:
        reason_parts.append(" ".join(academic_reason))
    reason_parts.append(f"Major fit score: {major_fit:.2f}.")
    if tuition is not None:
        reason_parts.append(f"Estimated tuition used: ${int(tuition):,}.")
    if grad is not None:
        reason_parts.append(f"Grad rate: {grad:.0%}.")
    if earn is not None:
        reason_parts.append(f"Median earnings (10y): ${int(earn):,}.")
    if pref_reason:
        reason_parts.append(" ".join(pref_reason))

    breakdown = ScoreBreakdown(
        academic=academic,
        major_fit=major_fit,
        affordability=affordability,
        outcomes=outcomes,
        preference=preference,
        total=total,
    )

    return probability, category, " ".join(reason_parts), breakdown