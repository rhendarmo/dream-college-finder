# Setup Guide

## Requirements

- Python 3.12+
- Node.js 20+
- Docker

## 1. Start Database
docker compose up -d

## 2. Backend Setup
cd backend
python -m venv .venv

Windows:
.venv\Scripts\Activate.ps1

Mac/Linux:
source .venv/bin/activate

Install Dependencies:
pip install -r requirements.txt

Run Migrations:
alembic upgrade head

Create .env file in backend root:
```
DATABASE_URL=your_database_url

JWT_SECRET_KEY=your_secret_key
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=14

FRONTEND_BASE_URL=http://localhost:3000

# # Optional: SMTP (if not set, we will print verify link in backend logs)
# SMTP_HOST=
# SMTP_PORT=587
# SMTP_USERNAME=
# SMTP_PASSWORD=
# SMTP_FROM_EMAIL=

OPENAI_API_KEY=your_openai_key
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_CHAT_MODEL=gpt-4.1-mini
```

Start Backend:
uvicorn app.main:app --reload

## 3. Frontend Setup
cd frontend
npm install

Create .env.local in frontend root:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```
npm run dev

Open:
http://localhost:3000