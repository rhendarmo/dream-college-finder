from sqlmodel import Session
from app.db.session import engine
from app.services.rag_indexer import index_schools

if __name__ == "__main__":
    with Session(engine) as session:
        index_schools(session)