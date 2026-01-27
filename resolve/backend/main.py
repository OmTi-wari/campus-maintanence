from fastapi import FastAPI
from pydantic import BaseModel
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db, engine
import joblib
import numpy as np
from backend.database import engine
from backend import models

models.Base.metadata.create_all(bind=engine)

vectorizer = joblib.load("model/vectorizer.pkl")
category_model = joblib.load("model/category_model.pkl")
priority_model = joblib.load("model/priority_model.pkl")

app = FastAPI(title="Smart Maintenance Ticket AI")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow frontend to call backend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


CHECKLIST_TEMPLATES = {
    "Electrical": [
        "Power isolated",
        "Safety gloves worn",
        "Wiring inspected",
        "Faulty component identified",
        "Issue resolved",
        "Area secured"
    ],
    "Plumbing": [
        "Water supply shut off",
        "Leak source identified",
        "Pipe or fitting repaired",
        "Water flow tested",
        "Area cleaned"
    ],
    "IT": [
        "Issue reproduced",
        "System or network checked",
        "Logs reviewed",
        "Fix applied",
        "Service restored"
    ],
    "General": [
        "Area inspected",
        "Safety risk assessed",
        "Repair completed",
        "Area cleaned",
        "Issue verified"
    ]
}



MAINTENANCE_KEYWORDS = {
    "water", "leak", "pipe", "tap", "toilet", "flush", "sink", "drain", "shower", "basin", "sewage",
    "power", "light", "switch", "socket", "wire", "electric", "bulb", "fuse", "trip", "voltage",
    "server", "wifi", "network", "system", "computer", "printer", "internet", "mouse", "keyboard", "monitor", "software", "login",
    "fire", "alarm", "generator", "ups", "extinguisher",
    "door", "lift", "elevator", "ac", "fan", "smell", "smoke", "cool", "heat", "air",
    "broken", "damage", "fix", "repair", "clean", "dirty", "dust", "pest", "insect", "rat",
    "wall", "ceiling", "floor", "window", "glass", "furniture", "chair", "table", "lock", "key", "handle", "knob"
}

HUMAN_KEYWORDS = {
    "exam", "injury", "injured", "pain", "sick", "ill",
    "study", "syllabus", "assignment", "deadline",
    "feeling", "stress", "tired", "anxiety", "depressed", "grade", "marks"
}

class ComplaintRequest(BaseModel):
    complaint: str

class PredictionResponse(BaseModel):
    category: str | None
    priority: str | None
    confidence: float
    valid: bool
    reason: str | None
    decision_reason: str | None


@app.get("/")
def health():
    return {"status": "Backend running"}

@app.post("/predict", response_model=PredictionResponse)
def predict(data: ComplaintRequest):
    text = data.complaint.lower().strip()
    evaluation = evaluate_ticket(text)
    
    return {
        "category": evaluation["category"],
        "priority": evaluation["priority"],
        "confidence": evaluation["confidence"],
        "valid": evaluation["valid"],
        "reason": evaluation["reason"],
        "decision_reason": evaluation["reason"]
    }

class TicketCreateRequest(BaseModel):
    student_name: str
    student_email: str
    complaint: str


class TicketCreateResponse(BaseModel):
    ticket_id: int
    category: str | None
    priority: str | None
    status: str
    valid: bool
    message: str
    confidence: float
    decision_reason: str | None

def evaluate_ticket(text: str):
    # Keyword checks
    has_maintenance_word = any(word in text for word in MAINTENANCE_KEYWORDS)
    has_human_word = any(word in text for w in HUMAN_KEYWORDS for word in text.split() if w == word) 
    
    # Vectorize
    X = vectorizer.transform([text])
    
    # Predict probabilities
    cat_probs = category_model.predict_proba(X)[0]
    pri_probs = priority_model.predict_proba(X)[0]
    
    raw_confidence = float(max(cat_probs.max(), pri_probs.max()))
    final_confidence = raw_confidence
    
    # Decision Logic
    valid = True
    reason = "Maintenance issue identified"
    category = None
    priority = None
    
    # 1. Reject Personal/Human
    if has_human_word:
        return {
            "valid": False,
            "reason": "Personal / non-maintenance issue detected",
            "confidence": final_confidence,
            "category": None,
            "priority": None
        }

    # 2. Domain-Aware Boost
    if has_maintenance_word:
        final_confidence = min(0.99, raw_confidence + 0.2)
        
    # 3. Low Confidence Rejection
    # Only reject if NO keywords AND confidence is actually low (< 0.2)
    if not has_maintenance_word and final_confidence < 0.2:
         return {
            "valid": False,
            "reason": "Low confidence classification and no clear maintenance keywords",
            "confidence": final_confidence,
            "category": None,
            "priority": None
        }

    # Success path - accept moderate confidence (0.4+) even without keywords
    # or any confidence if keywords are present (handled by boost + check above doesn't trigger)
    category = category_model.classes_[cat_probs.argmax()]
    priority = priority_model.classes_[pri_probs.argmax()]
    
    return {
        "valid": True,
        "reason": "Accepted via maintenance keywords" if has_maintenance_word else "Accepted via model prediction",
        "confidence": final_confidence,
        "category": category,
        "priority": priority
    }

@app.post("/tickets/submit", response_model=TicketCreateResponse)
def submit_ticket(data: TicketCreateRequest, db: Session = Depends(get_db)):
    text = data.complaint.lower().strip()
    
    evaluation = evaluate_ticket(text)
    
    category = evaluation["category"]
    priority = evaluation["priority"]
    confidence = evaluation["confidence"]
    valid = evaluation["valid"]
    reason = evaluation["reason"]
    
    status = "Open" if valid else "Rejected"

    # ---------- CREATE / GET STUDENT ----------
    student = db.query(models.User).filter(
        models.User.email == data.student_email
    ).first()

    if not student:
        student = models.User(
            name=data.student_name,
            email=data.student_email,
            role="student"
        )
        db.add(student)
        db.commit()
        db.refresh(student)

    # ---------- SAVE TICKET ----------
    ticket = models.Ticket(
        complaint_text=data.complaint,
        category=category,
        priority=priority,
        confidence=confidence,
        status=status,
        valid=valid,
        student_id=student.id
    )

    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    # ---------- CREATE CHECKLIST ----------
    if valid and category in CHECKLIST_TEMPLATES:
        for task in CHECKLIST_TEMPLATES[category]:
            checklist_item = models.Checklist(
                ticket_id=ticket.id,
                task_name=task
            )
            db.add(checklist_item)

        db.commit()

    return {
        "ticket_id": ticket.id,
        "category": category,
        "priority": priority,
        "status": status,
        "valid": valid,
        "message": reason if not valid else "Ticket submitted successfully",
        "confidence": confidence,
        "decision_reason": reason
    }
class AssignTicketRequest(BaseModel):
    maintainer_email: str


class UpdateStatusRequest(BaseModel):
    status: str  # In Progress | Resolved


class LogWorkRequest(BaseModel):
    maintainer_email: str
    action: str
    notes: str

@app.get("/maintainer/tickets")
def get_all_tickets(db: Session = Depends(get_db)):
    tickets = db.query(models.Ticket).order_by(
        models.Ticket.priority == "Critical",
        models.Ticket.priority == "High",
        models.Ticket.priority == "Medium"
    ).all()

    return tickets

@app.get("/maintainer/tickets/unassigned")
def get_unassigned_tickets(db: Session = Depends(get_db)):
    tickets = db.query(models.Ticket).filter(
        models.Ticket.assigned_to == None,
        models.Ticket.status == "Open",
        models.Ticket.valid == True
    ).all()

    return tickets

@app.post("/maintainer/tickets/{ticket_id}/assign")
def assign_ticket(
    ticket_id: int,
    data: AssignTicketRequest,
    db: Session = Depends(get_db)
):
    # Find maintainer
    maintainer = db.query(models.User).filter(
        models.User.email == data.maintainer_email,
        models.User.role == "maintainer"
    ).first()

    if not maintainer:
        maintainer = models.User(
            name=data.maintainer_email.split("@")[0],
            email=data.maintainer_email,
            role="maintainer"
        )
        db.add(maintainer)
        db.commit()
        db.refresh(maintainer)

    ticket = db.query(models.Ticket).filter(
        models.Ticket.id == ticket_id
    ).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    ticket.assigned_to = maintainer.id
    ticket.status = "In Progress"

    db.commit()

    return {
        "message": "Ticket assigned successfully",
        "ticket_id": ticket_id,
        "maintainer": maintainer.email
    }

@app.post("/maintainer/tickets/{ticket_id}/status")
def update_ticket_status(
    ticket_id: int,
    data: UpdateStatusRequest,
    db: Session = Depends(get_db)
):
    ticket = db.query(models.Ticket).filter(
        models.Ticket.id == ticket_id
    ).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    ticket.status = data.status
    ticket.updated_at = datetime.utcnow()

    db.commit()

    return {
        "message": f"Ticket status updated to {data.status}"
    }

@app.post("/maintainer/tickets/{ticket_id}/log")
def add_maintenance_log(
    ticket_id: int,
    data: LogWorkRequest,
    db: Session = Depends(get_db)
):
    maintainer = db.query(models.User).filter(
        models.User.email == data.maintainer_email,
        models.User.role == "maintainer"
    ).first()

    if not maintainer:
        raise HTTPException(status_code=404, detail="Maintainer not found")

    ticket = db.query(models.Ticket).filter(
        models.Ticket.id == ticket_id
    ).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    log = models.MaintenanceLog(
        ticket_id=ticket_id,
        maintainer_id=maintainer.id,
        action=data.action,
        notes=data.notes
    )

    db.add(log)
    db.commit()

    return {
        "message": "Work log added successfully"
    }

@app.get("/maintainer/tickets/{ticket_id}/checklist")
def get_checklist(ticket_id: int, db: Session = Depends(get_db)):
    checklist = db.query(models.Checklist).filter(
        models.Checklist.ticket_id == ticket_id
    ).all()

    return checklist

@app.post("/maintainer/checklist/{item_id}/toggle")
def toggle_checklist_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(models.Checklist).filter(
        models.Checklist.id == item_id
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Checklist item not found")

    item.is_completed = not item.is_completed
    db.commit()

    return {
        "message": "Checklist item updated",
        "completed": item.is_completed
    }

@app.get("/student/tickets")
def get_student_tickets(student_email: str, db: Session = Depends(get_db)):
    student = db.query(models.User).filter(
        models.User.email == student_email,
        models.User.role == "student"
    ).first()

    if not student:
        return []

    tickets = db.query(models.Ticket).filter(
        models.Ticket.student_id == student.id
    ).order_by(models.Ticket.created_at.desc()).all()

    return tickets
