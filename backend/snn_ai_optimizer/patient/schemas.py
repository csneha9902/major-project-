from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional, List, Any
from datetime import date, datetime
from enum import Enum

class GenderEnum(str, Enum):
    MALE = "Male"
    FEMALE = "Female"
    OTHER = "Other"

class BloodTypeEnum(str, Enum):
    A_PLUS = "A+"
    A_MINUS = "A-"
    B_PLUS = "B+"
    B_MINUS = "B-"
    AB_PLUS = "AB+"
    AB_MINUS = "AB-"
    O_PLUS = "O+"
    O_MINUS = "O-"

class PatientBase(BaseModel):
    name: str = Field(..., max_length=100)
    age: Optional[int] = Field(None, gt=0, lt=150)
    gender: str = "Female"
    blood_type: str = "A+"
    phone_number: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = Field(None, max_length=100)
    address: Optional[str] = None
    date_of_birth: Optional[date] = None

    @field_validator('gender', mode='before')
    @classmethod
    def normalize_gender(cls, v):
        if not v:
            return "Female"
        v_str = str(v).lower()
        if "female" in v_str:
            return "Female"
        if "male" in v_str:
            return "Male"
        return "Other"

    @field_validator('blood_type', mode='before')
    @classmethod
    def normalize_blood_type(cls, v):
        if not v:
            return "A+"
        v_str = str(v).replace("_PLUS", "+").replace("_MINUS", "-").replace(" ", "").upper()
        if v_str in ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]:
            return v_str
        return "A+"

class PatientCreate(PatientBase):
    patient_id: str = Field(..., max_length=20)
    medical_history: Optional[str] = None
    allergies: Optional[str] = None
    current_medications: Optional[str] = None
    primary_care_physician: Optional[str] = Field(None, max_length=100)
    consent_given: bool = False
    data_sharing_consent: bool = False

class PatientUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    age: Optional[int] = Field(None, gt=0, lt=150)
    gender: Optional[str] = None
    blood_type: Optional[str] = None
    phone_number: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = Field(None, max_length=100)
    address: Optional[str] = None
    date_of_birth: Optional[date] = None
    medical_history: Optional[str] = None
    allergies: Optional[str] = None
    current_medications: Optional[str] = None
    primary_care_physician: Optional[str] = Field(None, max_length=100)
    consent_given: Optional[bool] = None
    data_sharing_consent: Optional[bool] = None

class Patient(PatientBase):
    id: int
    patient_id: str
    medical_history: Optional[str] = None
    allergies: Optional[str] = None
    current_medications: Optional[str] = None
    primary_care_physician: Optional[str] = None
    consent_given: bool = False
    consent_date: Optional[datetime] = None
    data_sharing_consent: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

class PatientListResponse(BaseModel):
    patients: List[Patient]
    total: int
    page: int
    size: int