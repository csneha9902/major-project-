from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Text, Boolean, Float, Date, Time
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from .base import Base

# Enums for categorical data
class GenderEnum(str, enum.Enum):
    MALE = "Male"
    FEMALE = "Female"
    OTHER = "Other"

    @classmethod
    def _missing_(cls, value):
        if isinstance(value, str):
            for member in cls:
                if member.value.lower() == value.lower() or member.name.lower() == value.lower():
                    return member
        return None

class BloodTypeEnum(str, enum.Enum):
    A_PLUS = "A+"
    A_MINUS = "A-"
    B_PLUS = "B+"
    B_MINUS = "B-"
    AB_PLUS = "AB+"
    AB_MINUS = "AB-"
    O_PLUS = "O+"
    O_MINUS = "O-"

    @classmethod
    def _missing_(cls, value):
        if isinstance(value, str):
            clean_val = value.replace("_PLUS", "+").replace("_MINUS", "-").replace("_", "").lower()
            for member in cls:
                if member.value.lower() == clean_val or member.name.lower() == value.lower():
                    return member
        return None

class CognitiveStateEnum(str, enum.Enum):
    FOCUSED = "Focused"
    NEUTRAL = "Neutral"
    STRESSED = "Stressed"

class UserRoleEnum(str, enum.Enum):
    ADMIN = "Admin"
    DOCTOR = "Doctor"
    NURSE = "Nurse"
    TECHNICIAN = "Technician"
    PATIENT = "Patient"

class AppointmentStatusEnum(str, enum.Enum):
    SCHEDULED = "Scheduled"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"
    NO_SHOW = "No Show"
    RESCHEDULED = "Rescheduled"

class AppointmentTypeEnum(enum.Enum):
    INITIAL_EVALUATION = "Initial Evaluation"
    FOLLOW_UP = "Follow Up"
    THERAPY_SESSION = "Therapy Session"
    CONSULTATION = "Consultation"
    EEG_TEST = "EEG Test"

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String(20), unique=True, index=True, nullable=False)  # e.g., PAT-10492
    name = Column(String(100), nullable=False)
    age = Column(Integer)
    gender = Column(String(20), default="Female")
    blood_type = Column(String(10), default="A+")
    phone_number = Column(String(20))
    email = Column(String(100))
    address = Column(Text)
    date_of_birth = Column(Date)

    # Medical information
    medical_history = Column(Text)
    allergies = Column(Text)
    current_medications = Column(Text)
    primary_care_physician = Column(String(100))

    # Consent and privacy
    consent_given = Column(Boolean, default=False)
    consent_date = Column(DateTime)
    data_sharing_consent = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer, ForeignKey("users.id"))  # Who created this patient record

    # Relationships
    # user = relationship("User", foreign_keys=[created_by])
    # sessions = relationship("Session", back_populates="patient")
    # analyses = relationship("Analysis", back_populates="patient")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(20), unique=True, index=True, nullable=False)  # e.g., EMP-001, DOC-001
    email = Column(String(100), unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True)
    full_name = Column(String(100), nullable=False)
    hashed_password = Column(String(255))
    role = Column(Enum(UserRoleEnum), nullable=False)
    is_active = Column(Boolean, default=True)

    # Profile information
    department = Column(String(100))
    specialty = Column(String(100))  # For doctors
    phone_number = Column(String(20))

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True))

    # Relationships
    # patients_created = relationship("Patient", foreign_keys=[Patient.created_by])
    # sessions_performed = relationship("Session", foreign_keys=[Session.performed_by])
    # analyses_reviewed = relationship("Analysis", foreign_keys=[Analysis.reviewed_by])

class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(20), unique=True, index=True, nullable=False)  # e.g., SES-901
    patient_id = Column(Integer, ForeignKey("patients.id"))
    performed_by = Column(Integer, ForeignKey("users.id"))  # Technician/doctor who performed the session
    reviewed_by = Column(Integer, ForeignKey("users.id"))  # Doctor who reviewed the results

    # Session details
    session_date = Column(Date)
    session_time = Column(String(10))  # HH:MM AM/PM format
    duration_minutes = Column(Integer)
    edf_filename = Column(String(255))

    # Results
    cognitive_state = Column(Enum(CognitiveStateEnum))
    snn_risk_score = Column(Integer)  # 0-100
    beta_alpha_ratio = Column(Float)
    heart_rate_bpm = Column(Integer)
    lf_hf_ratio = Column(Float)

    # Clinical notes
    chief_complaint = Column(Text)
    checkup_problems = Column(Text)  # JSON string or separate table
    diagnosis = Column(Text)
    doctor_notes = Column(Text)
    icd_code = Column(String(20))
    treatment_plan = Column(Text)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    # patient = relationship("Patient", back_populates="sessions")
    # performer = relationship("User", foreign_keys=[performed_by])
    # reviewer = relationship("User", foreign_keys=[reviewed_by])
    # analysis = relationship("Analysis", back_populates="session", uselist=False)

class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(String(20), unique=True, index=True, nullable=False)  # e.g., ANA-001
    session_id = Column(Integer, ForeignKey("sessions.id"))
    patient_id = Column(Integer, ForeignKey("patients.id"))
    reviewed_by = Column(Integer, ForeignKey("users.id"))

    # Analysis metadata
    filename = Column(String(255))
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    file_size = Column(Integer)  # bytes
    file_type = Column(String(20))  # edf, csv

    # Features extracted (JSON)
    features = Column(Text)  # JSON string of extracted features
    sampling_rate = Column(Integer)
    n_samples = Column(Integer)
    duration = Column(Float)

    # Analysis results
    snn_output = Column(Text)  # JSON string of SNN results
    baseline_output = Column(Text)  # JSON string of baseline model results

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    # session = relationship("Session", back_populates="analysis")
    # patient = relationship("Patient", back_populates="analyses")
    # reviewer = relationship("User", foreign_keys=[reviewed_by])

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))  # Who performed the action
    action = Column(String(100))  # e.g., "CREATE_PATIENT", "VIEW_SESSION", "UPLOAD_EDF"
    table_name = Column(String(50))  # Which table was affected
    record_id = Column(String(50))  # ID of the record
    description = Column(Text)
    ip_address = Column(String(45))  # IPv4 or IPv6
    user_agent = Column(Text)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    # user = relationship("User")


class Clinic(Base):
    __tablename__ = "clinics"

    id = Column(Integer, primary_key=True, index=True)
    clinic_id = Column(String(20), unique=True, index=True, nullable=False)  # e.g., CLN-001
    name = Column(String(100), nullable=False)
    description = Column(Text)
    address = Column(Text)
    phone_number = Column(String(20))
    email = Column(String(100))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    appointments = relationship("Appointment", back_populates="clinic")
    resources = relationship("Resource", back_populates="clinic")


class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(String(20), unique=True, index=True, nullable=False)  # e.g., RES-001
    clinic_id = Column(Integer, ForeignKey("clinics.id"))
    name = Column(String(100), nullable=False)  # e.g., "EEG Room 1", "Therapy Room A"
    resource_type = Column(String(50))  # e.g., "EEG Equipment", "Therapy Space"
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    clinic = relationship("Clinic", back_populates="resources")
    appointments = relationship("Appointment", back_populates="resource")


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(String(20), unique=True, index=True, nullable=False)  # e.g., APT-001
    patient_id = Column(Integer, ForeignKey("patients.id"))
    clinic_id = Column(Integer, ForeignKey("clinics.id"))
    resource_id = Column(Integer, ForeignKey("resources.id"))
    scheduled_by = Column(Integer, ForeignKey("users.id"))  # Staff member who scheduled
    attended_by = Column(Integer, ForeignKey("users.id"))  # Staff member who attended

    # Appointment details
    appointment_type = Column(Enum(AppointmentTypeEnum))
    status = Column(Enum(AppointmentStatusEnum), default=AppointmentStatusEnum.SCHEDULED)
    scheduled_date = Column(Date)
    scheduled_time = Column(Time)  # HH:MM:SS
    duration_minutes = Column(Integer)
    actual_start_time = Column(Time)
    actual_end_time = Column(Time)

    # Clinical information
    reason_for_visit = Column(Text)
    notes = Column(Text)
    outcomes = Column(Text)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    patient = relationship("Patient", back_populates="appointments")
    clinic = relationship("Clinic", back_populates="appointments")
    resource = relationship("Resource", back_populates="appointments")
    scheduler = relationship("User", foreign_keys=[scheduled_by])
    attendee = relationship("User", foreign_keys=[attended_by])


# Add relationships to existing models
Patient.appointments = relationship("Appointment", order_by=Appointment.id, back_populates="patient")
User.appointments_scheduled = relationship("Appointment", foreign_keys=[Appointment.scheduled_by], back_populates="scheduler")
User.appointments_attended = relationship("Appointment", foreign_keys=[Appointment.attended_by], back_populates="attendee")


class CareTeamMessage(Base):
    __tablename__ = "care_team_messages"

    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(String(20), unique=True, index=True, nullable=False)  # e.g., MSG-001
    sender_id = Column(Integer, ForeignKey("users.id"))
    recipient_id = Column(Integer, ForeignKey("users.id"))  # Null for group/channel messages
    patient_id = Column(Integer, ForeignKey("patients.id"))  # Null for general messages
    channel_id = Column(Integer, ForeignKey("care_team_channels.id"))  # Null for direct messages

    # Message details
    subject = Column(String(200))
    content = Column(Text)
    is_read = Column(Boolean, default=False)
    read_at = Column(DateTime(timezone=True))
    is_urgent = Column(Boolean, default=False)
    message_type = Column(String(50))  # e.g., "consultation", "update", "question", "alert"

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_messages")
    recipient = relationship("User", foreign_keys=[recipient_id], back_populates="received_messages")
    patient = relationship("Patient")
    channel = relationship("CareTeamChannel", back_populates="messages")


class CareTeamChannel(Base):
    __tablename__ = "care_team_channels"

    id = Column(Integer, primary_key=True, index=True)
    channel_id = Column(String(20), unique=True, index=True, nullable=False)  # e.g., CHN-001
    name = Column(String(100), nullable=False)
    description = Column(Text)
    is_private = Column(Boolean, default=False)  # False for public/team channels
    created_by = Column(Integer, ForeignKey("users.id"))
    is_active = Column(Boolean, default=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    creator = relationship("User", foreign_keys=[created_by])
    messages = relationship("CareTeamMessage", back_populates="channel")
    members = relationship("CareTeamChannelMember", back_populates="channel")


class CareTeamChannelMember(Base):
    __tablename__ = "care_team_channel_members"

    id = Column(Integer, primary_key=True, index=True)
    channel_id = Column(Integer, ForeignKey("care_team_channels.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    role = Column(String(50))  # e.g., "member", "moderator", "owner"
    joined_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    channel = relationship("CareTeamChannel", back_populates="members")
    user = relationship("User")


class ClinicalTask(Base):
    __tablename__ = "clinical_tasks"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(String(20), unique=True, index=True, nullable=False)  # e.g., TSK-001
    patient_id = Column(Integer, ForeignKey("patients.id"))
    assigned_by = Column(Integer, ForeignKey("users.id"))
    assigned_to = Column(Integer, ForeignKey("users.id"))
    related_appointment_id = Column(Integer, ForeignKey("appointments.id"))  # Null for general tasks

    # Task details
    title = Column(String(200), nullable=False)
    description = Column(Text)
    status = Column(String(50), default="pending")  # pending, in_progress, completed, cancelled
    priority = Column(String(20), default="medium")  # low, medium, high, urgent
    task_type = Column(String(50))  # e.g., "follow_up_call", "medication_review", "lab_order"

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    due_date = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))

    # Relationships
    # patient = relationship("Patient")
    # assigner = relationship("User", foreign_keys=[assigned_by])
    # assignee = relationship("User", foreign_keys=[assigned_to])
    # related_appointment = relationship("Appointment")


class SharedNote(Base):
    __tablename__ = "shared_notes"

    id = Column(Integer, primary_key=True, index=True)
    note_id = Column(String(20), unique=True, index=True, nullable=False)  # e.g., NOTE-001
    patient_id = Column(Integer, ForeignKey("patients.id"))
    created_by = Column(Integer, ForeignKey("users.id"))

    # Note details
    title = Column(String(200))
    content = Column(Text)
    is_confidential = Column(Boolean, default=False)
    note_type = Column(String(50))  # e.g., "progress_note", "consultation_note", "discharge_summary"

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    patient = relationship("Patient")
    creator = relationship("User", back_populates="shared_notes")


# Add relationships to existing models
User.sent_messages = relationship("CareTeamMessage", foreign_keys=[CareTeamMessage.sender_id], back_populates="sender")
User.received_messages = relationship("CareTeamMessage", foreign_keys=[CareTeamMessage.recipient_id], back_populates="recipient")
User.shared_notes = relationship("SharedNote", back_populates="creator")