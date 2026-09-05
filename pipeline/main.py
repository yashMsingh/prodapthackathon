from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import get_db, Base, engine
from models import Thread, Task, Commitment

# Ensure tables are created
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Email Inbox Assistant - Final Pipeline MVP")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/action-center")
def get_action_center(db: Session = Depends(get_db)):
    """Real endpoint serving Action Center data from the Database!"""
    needs_attention = db.query(Thread).filter(Thread.state == "PENDING").all()
    waiting_on = db.query(Thread).filter(Thread.state == "WAITING").all()
    commitments = db.query(Commitment).filter(Commitment.status == "PENDING").all()
    
    return {
        "needs_attention": needs_attention,
        "waiting_on": waiting_on,
        "deadline_conflicts": [],
        "commitments": commitments
    }

@app.get("/api/emails")
def get_emails(db: Session = Depends(get_db)):
    """Fetch all analyzed threads."""
    return db.query(Thread).all()

@app.post("/api/sync")
def trigger_sync():
    """
    Endpoint to trigger the Gmail -> LLM -> DB pipeline.
    In the final product, this would call fetch_emails.py, pass it to the LLM teammate, 
    and then run orchestrator.py.
    """
    return {"status": "success", "message": "Pipeline sync triggered!"}
