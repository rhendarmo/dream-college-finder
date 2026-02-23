from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.profiles import router as profiles_router

app = FastAPI(title="DreamCollegeFinder API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(profiles_router)