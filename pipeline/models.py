from sqlalchemy import Column, Integer, String, Text, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Thread(Base):
    __tablename__ = "threads"
    
    id = Column(Integer, primary_key=True, index=True)
    gmail_thread_id = Column(String, unique=True, index=True)
    subject = Column(String)
    
    # Intelligence fields from LLM
    summary = Column(Text, nullable=True)
    importance = Column(String, nullable=True)
    urgency = Column(String, nullable=True)
    priority_reason = Column(Text, nullable=True)
    state = Column(String, default="PENDING")
    
    tasks = relationship("Task", back_populates="thread", cascade="all, delete-orphan")
    commitments = relationship("Commitment", back_populates="thread", cascade="all, delete-orphan")
    waiting_on = relationship("WaitingOn", back_populates="thread", cascade="all, delete-orphan")

class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    thread_id = Column(Integer, ForeignKey("threads.id"))
    task = Column(String)
    owner = Column(String)
    deadline = Column(String, nullable=True)
    status = Column(String, default="PENDING")
    
    thread = relationship("Thread", back_populates="tasks")

class Commitment(Base):
    __tablename__ = "commitments"
    
    id = Column(Integer, primary_key=True, index=True)
    thread_id = Column(Integer, ForeignKey("threads.id"))
    owner = Column(String)
    action = Column(String)
    deadline = Column(String, nullable=True)
    status = Column(String, default="PENDING")
    
    thread = relationship("Thread", back_populates="commitments")

class WaitingOn(Base):
    __tablename__ = "waiting_on"
    
    id = Column(Integer, primary_key=True, index=True)
    thread_id = Column(Integer, ForeignKey("threads.id"))
    person = Column(String)
    reason = Column(String)
    
    thread = relationship("Thread", back_populates="waiting_on")
