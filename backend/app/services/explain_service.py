from app.models.profile import Profile
from app.models.school import School

def explain_fit_v1(profile: Profile, school: School) -> str:
    parts: list[str] = []

    # Academics
    if school.avg_gpa is not None:
        if profile.gpa >= school.avg_gpa:
            parts.append(f"Your GPA ({profile.gpa:.2f}) is at/above this school's average GPA ({school.avg_gpa:.2f}).")
        else:
            parts.append(f"Your GPA ({profile.gpa:.2f}) is below this school's average GPA ({school.avg_gpa:.2f}), so it may be more competitive.")

    if profile.sat is not None and school.avg_sat is not None:
        if profile.sat >= school.avg_sat:
            parts.append(f"Your SAT ({profile.sat}) is at/above the school's average SAT ({school.avg_sat}).")
        else:
            parts.append(f"Your SAT ({profile.sat}) is below the school's average SAT ({school.avg_sat}), which may make admission harder.")

    # Acceptance rate context
    if school.acceptance_rate is not None:
        parts.append(f"Acceptance rate is approximately {school.acceptance_rate:.0%}, which affects competitiveness.")

    # Preference match
    if profile.location_preference and school.state:
        if profile.location_preference.strip().upper() == school.state.strip().upper():
            parts.append(f"This matches your location preference ({school.state}).")
        else:
            parts.append(f"Your location preference is {profile.location_preference}, while this school is in {school.state}.")

    # Major match (lightweight V1 using tags)
    if school.tags:
        tags = [t.strip().lower() for t in school.tags.split(",") if t.strip()]
        major = profile.intended_major.lower()
        if any(tok in major for tok in tags) or any(t in major for t in tags):
            parts.append("Some of this school's program tags align with your intended major.")
        else:
            parts.append("Program tags are available; we’ll improve major-matching in the next step.")

    if not parts:
        return "Basic fit explanation is not available yet for this school."
    return " ".join(parts)