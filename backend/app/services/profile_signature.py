import hashlib

from app.models.profile import Profile

def make_profile_signature(p: Profile) -> str:
    raw = "|".join([
        f"gpa={p.gpa}",
        f"sat={p.sat or ''}",
        f"act={p.act or ''}",
        f"major={p.intended_major or ''}",
        f"state={p.location_preference or ''}",
        f"notes={p.notes or ''}",
    ])
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()