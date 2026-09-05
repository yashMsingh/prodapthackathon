import json
from database import SessionLocal, engine, Base
from models import Thread, Task, Commitment, WaitingOn
from schemas import AIAnalysisResult

# Initialize the database tables
Base.metadata.create_all(bind=engine)

def receive_from_llm(mock_json_string: str):
    """
    This function simulates receiving the output from your teammate's LLM pipeline.
    It takes the raw JSON string they give you, validates it, and saves it to the DB.
    """
    
    print("1. Validating LLM Output with Pydantic...")
    try:
        # Pydantic will instantly crash and throw an error if the LLM output is malformed
        analysis = AIAnalysisResult.model_validate_json(mock_json_string)
        print("   - Validation passed! The LLM followed the schema.")
    except Exception as e:
        print(f"   - ERROR: The LLM output is invalid: {e}")
        return
        
    print("\n2. Connecting to PostgreSQL/SQLite...")
    db = SessionLocal()
    
    try:
        # In a real scenario, you'd get the gmail_thread_id from the input payload
        # For this test, we'll hardcode a dummy thread ID
        dummy_thread_id = "gmail_thread_12345"
        
        print("3. Persisting Intelligence to Database...")
        # Check if thread exists, if not create it
        thread = db.query(Thread).filter(Thread.gmail_thread_id == dummy_thread_id).first()
        if not thread:
            thread = Thread(gmail_thread_id=dummy_thread_id, subject="Test Subject")
            db.add(thread)
            db.commit()
            db.refresh(thread)
            
        # Update thread with AI analysis
        thread.summary = analysis.summary
        thread.importance = analysis.importance
        thread.urgency = analysis.urgency
        thread.priority_reason = analysis.priority_reason
        thread.state = analysis.state
        
        # Add Tasks
        for t in analysis.tasks:
            task = Task(
                thread_id=thread.id,
                task=t.task,
                owner=t.owner,
                deadline=t.deadline,
                status=t.status
            )
            db.add(task)
            
        # Add Commitments
        for c in analysis.commitments:
            commit = Commitment(
                thread_id=thread.id,
                owner=c.owner,
                action=c.action,
                deadline=c.deadline,
                status=c.status
            )
            db.add(commit)
            
        db.commit()
        print("   - Successfully saved all Tasks, Commitments, and Analysis to the database!")
        print("\nPhase 3 Orchestration Complete! The frontend can now fetch this from /api/action-center")
        
    finally:
        db.close()


if __name__ == "__main__":
    # This is a mock response that your teammate's LLM function would generate
    mock_llm_response = """
    {
      "summary": "Client requested the revised proposal and asked for it by Monday.",
      "importance": "HIGH",
      "urgency": "HIGH",
      "priority_reason": "Requires action and has a near-term explicit deadline.",
      "action_required": true,
      "tasks": [
        {
          "task": "Send revised proposal",
          "owner": "me",
          "deadline": "2026-09-07",
          "status": "PENDING"
        }
      ],
      "commitments": [],
      "waiting_on": [],
      "state": "PENDING",
      "confidence": 0.94
    }
    """
    
    receive_from_llm(mock_llm_response)
