# Dream College Finder

AI-powered college recommendation platform that classifies schools into Reach / Target / Safety using academic profile inputs and provides explainable fit reasoning.

Built with:
- FastAPI (Backend)
- PostgreSQL (Docker)
- SQLModel + Alembic
- Next.js (App Router + TypeScript + Tailwind)
- Modular service / repository architecture

---

# 🚀 Current MVP Features

✅ Create student profile (GPA, SAT, major, location preference)  
✅ Run recommendation engine (v1 heuristic model)  
✅ Rank schools by fit score  
✅ Classify into Reach / Target / Safety  
✅ School detail page  
✅ Explainable “Why this school?” breakdown  
✅ Probability visualization chart  

---

# 🏗 Project Architecture

```
dreamcollegefinder/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── services/
│   │   ├── seed/
│   │   └── main.py
│   ├── alembic/
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── types/
│   └── .env.local
│
├── docker-compose.yml
└── README.md
```

---

# 🧰 Prerequisites

- Python 3.12+
- Node 20+
- npm 10+
- Docker
- Git

---

# ⚙️ Backend Setup

## 1. Start PostgreSQL (Docker)

docker compose up -d

Database:
- DB Name: dreamcollegefinder
- User: dreamcollegefinder
- Password: dreamcollegefinder_pw
- Port: 5432

---

## 2. Setup Python Environment

cd backend
python -m venv .venv

Activate:

Windows:
.\.venv\Scripts\Activate.ps1

Mac/Linux:
source .venv/bin/activate

Install dependencies:

pip install -r requirements.txt

---

## 3. Configure Environment Variables

Create backend/.env

DATABASE_URL=postgresql+psycopg://dreamcollegefinder:dreamcollegefinder_pw@localhost:5432/dreamcollegefinder

---

## 4. Run Migrations

alembic upgrade head

---

## 5. Seed Schools (Only Once)

python -m app.seed.seed_schools

---

## 6. Start Backend

uvicorn app.main:app --reload --port 8000

Backend docs:
http://127.0.0.1:8000/docs

---

# 🎨 Frontend Setup

cd frontend
npm install

Create frontend/.env.local

NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000

Start frontend:

npm run dev

Open:
http://localhost:3000

---

# 🔄 Development Workflow

Profile → Recommendation Service → School Ranking → DB Save → UI Render

---

# 🧠 Recommendation Engine (v1)

Scoring factors:
- GPA vs school average GPA
- SAT vs school average SAT
- Acceptance rate baseline
- Location preference match
- Lightweight tag match

Probability mapping:
- ≥ 70% → Safety
- 45–70% → Target
- < 45% → Reach

---

# 🏛 Architecture Layers

API Layer – HTTP endpoints  
Repository Layer – Database access  
Service Layer – Business logic  
Models Layer – SQLModel schema  

---

# 📦 Fresh Setup (New Developer)

docker compose up -d
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
python -m app.seed.seed_schools
uvicorn app.main:app --reload --port 8000

In another terminal:

cd frontend
npm install
npm run dev

---

# 📈 Roadmap

- Embedding-based major matching
- RAG for admissions requirements
- Cost & ROI comparison
- Authentication
- Deployment

---

# 👥 Contributing

git checkout -b feature/your-feature-name
git commit -m "feat: add feature"
git push

Open Pull Request.

---

# 📌 Notes

- Do NOT commit .env files
- Do NOT commit .venv
- Commit migrations
- Run alembic revision --autogenerate when models change

---

# 🏁 MVP Status

✔ End-to-end working:
Profile → Recommendations → School Detail → Explain Fit

Ready for collaborative development.
