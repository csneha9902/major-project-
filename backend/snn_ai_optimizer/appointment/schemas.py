from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import date, time, datetime
from enum import Enum

class AppointmentTypeEnum(str, Enum):
    INITIAL_EVALUATION = "Initial Evaluation"
    FOLLOW_UP = "Follow Up"
    THERAPY_SESSION = "Therapy Session"
    CONSULTATION = "Consultation"
    EEG_TEST = "EEG Test"

class AppointmentStatusEnum(str, Enum):
    SCHEDULED = "Scheduled"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"
    NO_SHOW = "No Show"
    RESCHEDULED = "Rescheduled"

class AppointmentBase(BaseModel):
    patient_id: int = Field(..., gt=0)
    clinic_id: int = Field(..., gt=0)
    resource_id: int = Field(..., gt=0)
    appointment_type: AppointmentTypeEnum
    scheduled_date: date
    scheduled_time: time
    duration_minutes: int = Field(..., gt=0, lt=480)  # Max 8 hours
    reason_for_visit: Optional[str] = Field(None, max_length=500)
    notes: Optional[str] = Field(None, max_length=1000)

class AppointmentCreate(AppointmentBase):
    appointment_id: str = Field(..., max_length=20)
    scheduled_by: int = Field(..., gt=0)
    attended_by: Optional[int] = Field(None, gt=0)

    @field_validator('appointment_id')
    @classmethod
    def appointment_id_must_be_unique(cls, v):
        if not v.startswith("APT-"):
            raise ValueError('Appointment ID must start with "APT-"')
        return v

class AppointmentUpdate(BaseModel):
    clinic_id: Optional[int] = Field(None, gt=0)
    resource_id: Optional[int] = Field(None, gt=0)
    appointment_type: Optional[AppointmentTypeEnum] = None
    scheduled_date: Optional[date] = None
    scheduled_time: Optional[time] = None
    duration_minutes: Optional[int] = Field(None, gt=0, lt=480)
    status: Optional[AppointmentStatusEnum] = None
    attended_by: Optional[int] = Field(None, gt=0)
    reason_for_visit: Optional[str] = Field(None, max_length=500)
    notes: Optional[str] = Field(None, max_length=1000)
    outcomes: Optional[str] = Field(None, max_length=1000)

class Appointment(AppointmentBase):
    id: int
    appointment_id: str
    scheduled_by: int
    attended_by: Optional[int] = None
    status: AppointmentStatusEnum
    actual_start_time: Optional[time] = None
    actual_end_time: Optional[time] = None
    outcomes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

class AppointmentListResponse(BaseModel):
    appointments: List[Appointment]
    total: int
    page: int
    size: int