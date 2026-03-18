# 🎓 Dream College Finder

An AI-powered college recommendation platform that helps students discover best-fit universities using academic profile matching, semantic search, and personalized strategy generation.

---

## 🚀 Overview

Dream College Finder is a full-stack application that combines **data-driven recommendation systems + LLM-powered insights** to guide students through the college selection process.

Unlike basic search tools, this platform provides:
- 🎯 Balanced Reach / Target / Safety recommendations  
- 🧠 AI-generated personalized admissions strategy  
- 📄 Resume-aware insights  
- 🔍 RAG-based assistant grounded in real school data  

---

## ✨ Key Features

### 🔐 Authentication & User System
- Secure email/password login
- Email verification flow
- Cookie-based authentication
- One profile per user (clean data model)

---

### 👤 Student Profile Engine
Users input:
- GPA
- SAT / ACT
- Intended major
- State preference
- Notes

➡️ Drives all downstream recommendations + AI outputs

---

### 🎯 Smart Recommendation Engine
- Uses **College Scorecard dataset**
- Multi-factor scoring:
  - Academic fit
  - Major alignment (CIP mapping)
  - Outcomes (salary, graduation rate)
  - Affordability
- Produces:
  - Reach / Target / Safety distribution
- Includes:
  - Recommendation caching (performance optimization)

---

### 🏫 School Intelligence Layer
- Detailed school pages
- Fit explanations (WHY this school matches)
- Key metrics:
  - Admissions rate
  - Tuition
  - Earnings outcomes
  - Graduation rate

---

### 📄 Resume Parsing + Strategy Engine
- Upload resume (PDF)
- Extract + structure content using LLM
- Generate personalized:
  - Gap analysis
  - Application strategy
  - 30-day action plan

---

### 🤖 AI Assistant (RAG System)
- Embeddings stored in **pgvector**
- Semantic retrieval over school dataset
- Grounded responses (not hallucinated)
- Supports:
  - School comparisons
  - Strategy questions
  - Decision support

---

## 🧠 Tech Stack

### Frontend
- **Next.js (App Router)**
- TypeScript
- Tailwind CSS
- Recharts (data visualization)

### Backend
- **FastAPI**
- SQLModel / SQLAlchemy
- Alembic migrations

### Database
- PostgreSQL
- **pgvector (vector search)**

### AI / ML
- OpenAI API
- Embeddings (semantic search)
- LLM-based:
  - Resume parsing
  - Advice generation
  - RAG assistant

---

## 🏗️ System Architecture
```
Frontend (Next.js)<br>
↓<br>
API Layer (FastAPI)<br>
↓<br>
Service Layer (Business Logic)<br>
↓<br>
Repository Layer<br>
↓<br>
PostgreSQL + pgvector
```

---

## 🔄 Core Workflow

1. User signs up and verifies email  
2. User creates a profile  
3. System generates recommendations  
4. User explores schools  
5. User uploads resume  
6. System generates strategy advice  
7. User interacts with AI assistant  

---

## 📊 Key Engineering Highlights

- ⚡ **Caching Layer**
  - Recommendation caching (profile signature)
  - Advice caching (profile + resume signature)

- 🧩 **Modular Backend Architecture**
  - Clear separation: API → Services → Repositories

- 🧠 **RAG Pipeline**
  - Vector embeddings with pgvector
  - Retrieval + grounded generation

- 📄 **Resume Intelligence**
  - Structured parsing from raw PDF
  - Integrated into recommendation strategy

---

## 🛠️ Local Setup

See full instructions in 👉 `SETUP.md`

Quick start:

```
# backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# frontend
cd frontend
npm install
npm run dev
```

---

## 📂 Project Structure
dreamcollegefinder/
├── backend/
│ ├── app/
│ ├── alembic/
│ └── requirements.txt
├── frontend/
│ ├── src/
│ └── middleware.ts
├── README.md
├── ARCHITECTURE.md
├── SETUP.md
├── USER_GUIDE.md
└── LICENSE

---

## 🎯 Why This Project Matters

This project demonstrates:

- Full-stack engineering (React + FastAPI)
- Real-world data integration (College Scorecard)
- Applied machine learning concepts
- LLM + RAG system design
- Production-style architecture (modular + scalable)
- Product thinking (user flows, caching, UX decisions)

---

## 🚧 Future Improvements

- Improved recommendation system
- Saved schools / favorites
- Application tracking dashboard
- More advanced filtering (budget, size, etc.)
- Background job queue (Celery / Redis)
- Improved RAG sources (reviews, rankings)

---
