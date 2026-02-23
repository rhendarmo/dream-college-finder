from sqlmodel import Session, select
from app.db.session import engine
from app.models.school import School


SAMPLE_SCHOOLS = [
    School(name="UC Irvine", state="CA", acceptance_rate=0.21, avg_sat=1410, avg_gpa=4.00, tags="business,analytics,stem"),
    School(name="UC San Diego", state="CA", acceptance_rate=0.24, avg_sat=1430, avg_gpa=4.05, tags="stem,cs,engineering"),
    School(name="UC Davis", state="CA", acceptance_rate=0.41, avg_sat=1310, avg_gpa=3.95, tags="business,stem"),
    School(name="Cal Poly SLO", state="CA", acceptance_rate=0.30, avg_sat=1340, avg_gpa=3.95, tags="engineering,business"),
    School(name="San Jose State", state="CA", acceptance_rate=0.70, avg_sat=1180, avg_gpa=3.55, tags="cs,business"),
    School(name="Arizona State", state="AZ", acceptance_rate=0.88, avg_sat=1240, avg_gpa=3.50, tags="business,engineering"),
    School(name="University of Washington", state="WA", acceptance_rate=0.48, avg_sat=1340, avg_gpa=3.80, tags="stem,business"),
    School(name="Northeastern University", state="MA", acceptance_rate=0.07, avg_sat=1490, avg_gpa=4.10, tags="cs,business"),
    School(name="University of Wisconsin–Madison", state="WI", acceptance_rate=0.60, avg_sat=1390, avg_gpa=3.85, tags="business,stem"),
    School(name="Indiana University Bloomington", state="IN", acceptance_rate=0.82, avg_sat=1260, avg_gpa=3.70, tags="business"),
]


def seed():
    with Session(engine) as session:
        existing = session.exec(select(School)).first()
        if existing:
            print("Schools already seeded.")
            return
        session.add_all(SAMPLE_SCHOOLS)
        session.commit()
        print(f"Seeded {len(SAMPLE_SCHOOLS)} schools.")


if __name__ == "__main__":
    seed()