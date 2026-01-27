from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

# ---------- USERS ----------
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True)
    role = Column(String)  # student | maintainer
    created_at = Column(DateTime, default=datetime.utcnow)

    tickets_created = relationship("Ticket", back_populates="student", foreign_keys="Ticket.student_id")
    tickets_assigned = relationship("Ticket", back_populates="maintainer", foreign_keys="Ticket.assigned_to")


# ---------- TICKETS ----------
class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    complaint_text = Column(String)
    category = Column(String)
    priority = Column(String)
    confidence = Column(Float)
    status = Column(String, default="Open")  # Open | In Progress | Resolved | Rejected
    valid = Column(Boolean)

    student_id = Column(Integer, ForeignKey("users.id"))
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("User", foreign_keys=[student_id], back_populates="tickets_created")
    maintainer = relationship("User", foreign_keys=[assigned_to], back_populates="tickets_assigned")

    logs = relationship("MaintenanceLog", back_populates="ticket")
    checklist = relationship("Checklist", back_populates="ticket")


# ---------- MAINTENANCE LOGS ----------
class MaintenanceLog(Base):
    __tablename__ = "maintenance_logs"

    id = Column(Integer, primary_key=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"))
    maintainer_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String)
    notes = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

    ticket = relationship("Ticket", back_populates="logs")


# ---------- CHECKLIST ----------
class Checklist(Base):
    __tablename__ = "checklists"

    id = Column(Integer, primary_key=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"))
    task_name = Column(String)
    is_completed = Column(Boolean, default=False)

    ticket = relationship("Ticket", back_populates="checklist")
