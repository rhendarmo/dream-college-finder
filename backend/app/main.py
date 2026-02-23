from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.profiles import router as profiles_router
from app.api.schools import router as schools_router
from app.api.recommendations import router as recommendations_router

app = FastAPI(title="dreamcollegefinder API", version="0.3.0")

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
app.include_router(schools_router)
app.include_router(recommendations_router)