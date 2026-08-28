from sqlalchemy.orm import Session
from typing import List, Optional
from snn_ai_optimizer.db.models import (
    CareTeamMessage, CareTeamChannel, CareTeamChannelMember,
    ClinicalTask, SharedNote, User, Patient
)
from snn_ai_optimizer.collaboration.schemas import (
    CareTeamMessageCreate, CareTeamMessageUpdate,
    CareTeamChannelCreate, CareTeamChannelUpdate,
    ClinicalTaskCreate, ClinicalTaskUpdate,
    SharedNoteCreate, SharedNoteUpdate
)
from datetime import datetime, timedelta

# Care Team Message Services
def get_care_team_message(db: Session, message_id: int) -> Optional[CareTeamMessage]:
    return db.query(CareTeamMessage).filter(CareTeamMessage.id == message_id).first()

def get_care_team_message_by_message_id(db: Session, message_id: str) -> Optional[CareTeamMessage]:
    return db.query(CareTeamMessage).filter(CareTeamMessage.message_id == message_id).first()

def get_care_team_messages(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    sender_id: Optional[int] = None,
    recipient_id: Optional[int] = None,
    patient_id: Optional[int] = None,
    channel_id: Optional[int] = None,
    is_unread_only: bool = False,
    is_urgent_only: bool = False
) -> List[CareTeamMessage]:
    query = db.query(CareTeamMessage)

    if sender_id:
        query = query.filter(CareTeamMessage.sender_id == sender_id)
    if recipient_id:
        query = query.filter(CareTeamMessage.recipient_id == recipient_id)
    if patient_id:
        query = query.filter(CareTeamMessage.patient_id == patient_id)
    if channel_id:
        query = query.filter(CareTeamMessage.channel_id == channel_id)
    if is_unread_only:
        query = query.filter(CareTeamMessage.is_read == False)
    if is_urgent_only:
        query = query.filter(CareTeamMessage.is_urgent == True)

    return query.offset(skip).limit(limit).all()

def create_care_team_message(db: Session, message: CareTeamMessageCreate) -> CareTeamMessage:
    # Validate sender exists
    sender = db.query(User).filter(User.id == message.sender_id).first()
    if not sender:
        raise ValueError(f"Sender with ID {message.sender_id} not found")

    # Validate recipient exists (if provided)
    if message.recipient_id:
        recipient = db.query(User).filter(User.id == message.recipient_id).first()
        if not recipient:
            raise ValueError(f"Recipient with ID {message.recipient_id} not found")

    # Validate patient exists (if provided)
    if message.patient_id:
        patient = db.query(Patient).filter(Patient.id == message.patient_id).first()
        if not patient:
            raise ValueError(f"Patient with ID {message.patient_id} not found")

    # Validate channel exists (if provided)
    if message.channel_id:
        channel = db.query(CareTeamChannel).filter(CareTeamChannel.id == message.channel_id).first()
        if not channel:
            raise ValueError(f"Channel with ID {message.channel_id} not found")

    db_message = CareTeamMessage(**message.dict())
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

def update_care_team_message(db: Session, message_id: int, message_update: CareTeamMessageUpdate) -> Optional[CareTeamMessage]:
    db_message = db.query(CareTeamMessage).filter(CareTeamMessage.id == message_id).first()
    if db_message:
        update_data = message_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_message, field, value)
        db.commit()
        db.refresh(db_message)
    return db_message

def mark_message_as_read(db: Session, message_id: int) -> Optional[CareTeamMessage]:
    db_message = db.query(CareTeamMessage).filter(CareTeamMessage.id == message_id).first()
    if db_message:
        db_message.is_read = True
        db_message.read_at = datetime.now()
        db.commit()
        db.refresh(db_message)
    return db_message

# Care Team Channel Services
def get_care_team_channel(db: Session, channel_id: int) -> Optional[CareTeamChannel]:
    return db.query(CareTeamChannel).filter(CareTeamChannel.id == channel_id).first()

def get_care_team_channel_by_channel_id(db: Session, channel_id: str) -> Optional[CareTeamChannel]:
    return db.query(CareTeamChannel).filter(CareTeamChannel.channel_id == channel_id).first()

def get_care_team_channels(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    is_private: Optional[bool] = None,
    is_active_only: bool = True,
    created_by: Optional[int] = None
) -> List[CareTeamChannel]:
    query = db.query(CareTeamChannel)

    if is_private is not None:
        query = query.filter(CareTeamChannel.is_private == is_private)
    if is_active_only:
        query = query.filter(CareTeamChannel.is_active == True)
    if created_by:
        query = query.filter(CareTeamChannel.created_by == created_by)

    return query.offset(skip).limit(limit).all()

def create_care_team_channel(db: Session, channel: CareTeamChannelCreate) -> CareTeamChannel:
    # Validate creator exists
    creator = db.query(User).filter(User.id == channel.created_by).first()
    if not creator:
        raise ValueError(f"Creator with ID {channel.created_by} not found")

    db_channel = CareTeamChannel(**channel.dict())
    db.add(db_channel)
    db.commit()
    db.refresh(db_channel)
    return db_channel

def update_care_team_channel(db: Session, channel_id: int, channel_update: CareTeamChannelUpdate) -> Optional[CareTeamChannel]:
    db_channel = db.query(CareTeamChannel).filter(CareTeamChannel.id == channel_id).first()
    if db_channel:
        update_data = channel_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_channel, field, value)
        db.commit()
        db.refresh(db_channel)
    return db_channel

# Care Team Channel Member Services
def add_channel_member(db: Session, channel_id: int, user_id: int, role: str = "member") -> CareTeamChannelMember:
    # Validate channel exists
    channel = db.query(CareTeamChannel).filter(CareTeamChannel.id == channel_id).first()
    if not channel:
        raise ValueError(f"Channel with ID {channel_id} not found")

    # Validate user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ValueError(f"User with ID {user_id} not found")

    # Check if already a member
    existing_member = db.query(CareTeamChannelMember).filter(
        CareTeamChannelMember.channel_id == channel_id,
        CareTeamChannelMember.user_id == user_id
    ).first()
    if existing_member:
        raise ValueError(f"User {user_id} is already a member of channel {channel_id}")

    db_member = CareTeamChannelMember(
        channel_id=channel_id,
        user_id=user_id,
        role=role
    )
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member

def remove_channel_member(db: Session, channel_id: int, user_id: int) -> bool:
    db_member = db.query(CareTeamChannelMember).filter(
        CareTeamChannelMember.channel_id == channel_id,
        CareTeamChannelMember.user_id == user_id
    ).first()
    if db_member:
        db.delete(db_member)
        db.commit()
        return True
    return False

# Clinical Task Services
def get_clinical_task(db: Session, task_id: int) -> Optional[ClinicalTask]:
    return db.query(ClinicalTask).filter(ClinicalTask.id == task_id).first()

def get_clinical_task_by_task_id(db: Session, task_id: str) -> Optional[ClinicalTask]:
    return db.query(ClinicalTask).filter(ClinicalTask.task_id == task_id).first()

def get_clinical_tasks(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    patient_id: Optional[int] = None,
    assigned_to: Optional[int] = None,
    assigned_by: Optional[int] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    task_type: Optional[str] = None,
    include_completed: bool = False
) -> List[ClinicalTask]:
    query = db.query(ClinicalTask)

    if patient_id:
        query = query.filter(ClinicalTask.patient_id == patient_id)
    if assigned_to:
        query = query.filter(ClinicalTask.assigned_to == assigned_to)
    if assigned_by:
        query = query.filter(ClinicalTask.assigned_by == assigned_by)
    if status:
        query = query.filter(ClinicalTask.status == status)
    if priority:
        query = query.filter(ClinicalTask.priority == priority)
    if task_type:
        query = query.filter(ClinicalTask.task_type == task_type)
    if not include_completed:
        query = query.filter(ClinicalTask.status != "completed")

    return query.offset(skip).limit(limit).all()

def create_clinical_task(db: Session, task: ClinicalTaskCreate) -> ClinicalTask:
    # Validate patient exists
    patient = db.query(Patient).filter(Patient.id == task.patient_id).first()
    if not patient:
        raise ValueError(f"Patient with ID {task.patient_id} not found")

    # Validate assigner exists
    assigner = db.query(User).filter(User.id == task.assigned_by).first()
    if not assigner:
        raise ValueError(f"Assigner with ID {task.assigned_by} not found")

    # Validate assignee exists
    assignee = db.query(User).filter(User.id == task.assigned_to).first()
    if not assignee:
        raise ValueError(f"Assignee with ID {task.assigned_to} not found")

    # Validate related appointment exists (if provided)
    if task.related_appointment_id:
        appointment = db.query(Appointment).filter(Appointment.id == task.related_appointment_id).first()
        if not appointment:
            raise ValueError(f"Related appointment with ID {task.related_appointment_id} not found")

    db_task = ClinicalTask(**task.dict())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def update_clinical_task(db: Session, task_id: int, task_update: ClinicalTaskUpdate) -> Optional[ClinicalTask]:
    db_task = db.query(ClinicalTask).filter(ClinicalTask.id == task_id).first()
    if db_task:
        update_data = task_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_task, field, value)
        db.commit()
        db.refresh(db_task)
    return db_task

def complete_clinical_task(db: Session, task_id: int) -> Optional[ClinicalTask]:
    db_task = db.query(ClinicalTask).filter(ClinicalTask.id == task_id).first()
    if db_task:
        db_task.status = "completed"
        db_task.completed_at = datetime.now()
        db.commit()
        db.refresh(db_task)
    return db_task

# Shared Note Services
def get_shared_note(db: Session, note_id: int) -> Optional[SharedNote]:
    return db.query(SharedNote).filter(SharedNote.id == note_id).first()

def get_shared_note_by_note_id(db: Session, note_id: str) -> Optional[SharedNote]:
    return db.query(SharedNote).filter(SharedNote.note_id == note_id).first()

def get_shared_notes(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    patient_id: Optional[int] = None,
    created_by: Optional[int] = None,
    is_confidential: Optional[bool] = None,
    note_type: Optional[str] = None
) -> List[SharedNote]:
    query = db.query(SharedNote)

    if patient_id:
        query = query.filter(SharedNote.patient_id == patient_id)
    if created_by:
        query = query.filter(SharedNote.created_by == created_by)
    if is_confidential is not None:
        query = query.filter(SharedNote.is_confidential == is_confidential)
    if note_type:
        query = query.filter(SharedNote.note_type == note_type)

    return query.offset(skip).limit(limit).all()

def create_shared_note(db: Session, note: SharedNoteCreate) -> SharedNote:
    # Validate patient exists
    patient = db.query(Patient).filter(Patient.id == note.patient_id).first()
    if not patient:
        raise ValueError(f"Patient with ID {note.patient_id} not found")

    # Validate creator exists
    creator = db.query(User).filter(User.id == note.created_by).first()
    if not creator:
        raise ValueError(f"Creator with ID {note.created_by} not found")

    db_note = SharedNote(**note.dict())
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note

def update_shared_note(db: Session, note_id: int, note_update: SharedNoteUpdate) -> Optional[SharedNote]:
    db_note = db.query(SharedNote).filter(SharedNote.id == note_id).first()
    if db_note:
        update_data = note_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_note, field, value)
        db.commit()
        db.refresh(db_note)
    return db_note