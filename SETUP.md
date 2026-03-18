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

Start Backend:
uvicorn app.main:app --reload

## 3. Frontend Setup
cd frontend
npm install
npm run dev

Open:
http://localhost:3000