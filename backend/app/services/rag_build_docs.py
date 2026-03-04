from __future__ import annotations

from sqlmodel import Session, select

from app.models.school import School
from app.models.school_program import SchoolProgram


def build_school_card(session: Session, school: School) -> tuple[str, dict]:
    programs = session.exec(
        select(SchoolProgram).where(SchoolProgram.school_unitid == school.unitid)
    ).all()
    programs = sorted(programs, key=lambda x: x.share, reverse=True)[:6]

    prog_str = ", ".join([f"CIP {p.cip2}: {p.share:.0%}" for p in programs]) if programs else "N/A"

    lines = [
        f"School: {school.name}",
        f"UNITID: {school.unitid}",
        f"Location: {school.city or ''}, {school.state or ''} {school.zip or ''}".strip(),
        f"Control: {school.control}",
        f"Admission rate: {school.admission_rate:.2%}" if school.admission_rate is not None else "Admission rate: N/A",
        f"SAT avg: {school.sat_avg}" if school.sat_avg is not None else "SAT avg: N/A",
        f"ACT mid: {school.act_mid}" if school.act_mid is not None else "ACT mid: N/A",
        f"Tuition in-state: ${school.tuition_in:,}" if school.tuition_in is not None else "Tuition in-state: N/A",
        f"Tuition out-of-state: ${school.tuition_out:,}" if school.tuition_out is not None else "Tuition out-of-state: N/A",
        f"Undergrad enrollment: {school.ug_enrollment:,}" if school.ug_enrollment is not None else "Undergrad enrollment: N/A",
        f"Graduation rate (4yr): {school.grad_rate_4yr:.2%}" if school.grad_rate_4yr is not None else "Graduation rate (4yr): N/A",
        f"Median earnings (10 years): ${school.median_earnings_10yr:,}" if school.median_earnings_10yr is not None else "Median earnings (10 years): N/A",
        f"Top programs: {prog_str}",
        f"Website: {school.school_url or 'N/A'}",
        f"Net price calculator: {school.net_price_url or 'N/A'}",
    ]

    content = "\n".join(lines)
    meta = {"unitid": school.unitid, "state": school.state, "control": school.control}
    return content, meta