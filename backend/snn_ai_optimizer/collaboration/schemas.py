from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# Care Team Message Schemas
class CareTeamMessageBase(BaseModel):
    subject: Optional[str] = None
    content: str
    is_read: bool = False
    is_urgent: bool = False
    message_type: str = "general"  # e.g., "consultation", "update", "question", "alert"

class CareTeamMessageCreate(CareTeamMessageBase):
    sender_id: int
    recipient_id: Optional[int] = None  # Null for group/channel messages
    patient_id: Optional[int] = None    # Null for general messages
    channel_id: Optional[int] = None    # Null for direct messages

class CareTeamMessageUpdate(BaseModel):
    subject: Optional[str] = None
    content: Optional[str] = None
    is_read: Optional[bool] = None
    is_urgent: Optional[bool] = None
    message_type: Optional[str] = None

class CareTeamMessage(CareTeamMessageBase):
    id: int
    message_id: str  # e.g., MSG-001
    sender_id: int
    recipient_id: Optional[int] = None
    patient_id: Optional[int] = None
    channel_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

# Care Team Channel Schemas
class CareTeamChannelBase(BaseModel):
    name: str
    description: Optional[str] = None
    is_private: bool = False  # False for public/team channels

class CareTeamChannelCreate(CareTeamChannelBase):
    created_by: int

class CareTeamChannelUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_private: Optional[bool] = None
    is_active: Optional[bool] = None

class CareTeamChannel(CareTeamChannelBase):
    id: int
    channel_id: str  # e.g., CHN-001
    created_by: int
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

class CareTeamChannelMemberCreate(BaseModel):
    user_id: int
    role: str = "member"  # e.g., "member", "moderator", "owner"

# Clinical Task Schemas
class ClinicalTaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "pending"  # pending, in_progress, completed, cancelled
    priority: str = "medium"  # low, medium, high, urgent
    task_type: Optional[str] = None  # e.g., "follow_up_call", "medication_review", "lab_order"
    due_date: Optional[datetime] = None

class ClinicalTaskCreate(ClinicalTaskBase):
    patient_id: int
    assigned_by: int
    assigned_to: int
    related_appointment_id: Optional[int] = None

class ClinicalTaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    task_type: Optional[str] = None
    due_date: Optional[datetime] = None

class ClinicalTask(ClinicalTaskBase):
    id: int
    task_id: str  # e.g., TSK-001
    patient_id: int
    assigned_by: int
    assigned_to: int
    related_appointment_id: Optional[int] = None
    completed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

# Shared Note Schemas
class SharedNoteBase(BaseModel):
    title: Optional[str] = None
    content: str
    is_confidential: bool = False
    note_type: str = "progress_note"  # e.g., "progress_note", "consultation_note", "discharge_summary"

class SharedNoteCreate(SharedNoteBase):
    patient_id: int
    created_by: int

class SharedNoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    is_confidential: Optional[bool] = None
    note_type: Optional[str] = None

class SharedNote(SharedNoteBase):
    id: int
    note_id: str  # e.g., NOTE-001
    patient_id: int
    created_by: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}