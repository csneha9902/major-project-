from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from snn_ai_optimizer.db.session import get_db
from snn_ai_optimizer.collaboration.service import (
    get_care_team_message,
    get_care_team_message_by_message_id,
    get_care_team_messages,
    create_care_team_message,
    update_care_team_message,
    mark_message_as_read,
    get_care_team_channel,
    get_care_team_channel_by_channel_id,
    get_care_team_channels,
    create_care_team_channel,
    update_care_team_channel,
    add_channel_member,
    remove_channel_member,
    get_clinical_task,
    get_clinical_task_by_task_id,
    get_clinical_tasks,
    create_clinical_task,
    update_clinical_task,
    complete_clinical_task,
    get_shared_note,
    get_shared_note_by_note_id,
    get_shared_notes,
    create_shared_note,
    update_shared_note
)
from snn_ai_optimizer.collaboration.schemas import (
    CareTeamMessageCreate,
    CareTeamMessageUpdate,
    CareTeamMessage,
    CareTeamChannelCreate,
    CareTeamChannelUpdate,
    CareTeamChannel,
    CareTeamChannelMemberCreate,
    ClinicalTaskCreate,
    ClinicalTaskUpdate,
    ClinicalTask,
    SharedNoteCreate,
    SharedNoteUpdate,
    SharedNote
)
from snn_ai_optimizer.auth.jwt_utils import get_current_user

router = APIRouter(
    prefix="/collaboration",
    tags=["collaboration"],
    responses={404: {"description": "Not found"}},
)

def _extract_user_id(user_obj) -> int:
    if hasattr(user_obj, "id"):
        return user_obj.id
    if isinstance(user_obj, dict):
        return user_obj.get("id", 1)
    return 1

# Care Team Message Endpoints
@router.post("/messages", response_model=CareTeamMessage, status_code=status.HTTP_201_CREATED)
def create_care_team_message_endpoint(
    message: CareTeamMessageCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Send a new care team message.
    Requires authentication.
    """
    user_id = _extract_user_id(current_user)
    if message.sender_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only send messages as yourself"
        )
    db_msg = create_care_team_message(db=db, message=message)
    return CareTeamMessage.model_validate(db_msg)

@router.get("/messages", response_model=List[CareTeamMessage])
def read_care_team_messages(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    sender_id: Optional[int] = Query(None),
    recipient_id: Optional[int] = Query(None),
    patient_id: Optional[int] = Query(None),
    channel_id: Optional[int] = Query(None),
    is_unread_only: bool = Query(False),
    is_urgent_only: bool = Query(False)
):
    """
    Retrieve care team messages with optional filtering.
    Requires authentication.
    """
    messages = get_care_team_messages(
        db=db,
        skip=skip,
        limit=limit,
        sender_id=sender_id,
        recipient_id=recipient_id,
        patient_id=patient_id,
        channel_id=channel_id,
        is_unread_only=is_unread_only,
        is_urgent_only=is_urgent_only
    )
    return [CareTeamMessage.model_validate(m) for m in messages]


@router.get("/messages/{message_id}", response_model=CareTeamMessage)
def read_care_team_message(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get a specific care team message by internal ID.
    Requires authentication.
    """
    db_message = get_care_team_message(db, message_id=message_id)
    if db_message is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    return db_message

@router.get("/messages/id/{message_id}", response_model=CareTeamMessage)
def read_care_team_message_by_id(
    message_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get a specific care team message by message ID (e.g., MSG-001).
    Requires authentication.
    """
    db_message = get_care_team_message_by_message_id(db, message_id=message_id)
    if db_message is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    return db_message

@router.put("/messages/{message_id}", response_model=CareTeamMessage)
def update_care_team_message_endpoint(
    message_id: int,
    message_update: CareTeamMessageUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Update a care team message.
    Requires authentication.
    """
    db_message = update_care_team_message(db=db, message_id=message_id, message_update=message_update)
    if db_message is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    return db_message

@router.post("/messages/{message_id}/read", response_model=CareTeamMessage)
def mark_care_team_message_as_read(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Mark a care team message as read.
    Requires authentication.
    """
    db_message = mark_message_as_read(db=db, message_id=message_id)
    if db_message is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    return db_message

# Care Team Channel Endpoints
@router.post("/channels", response_model=CareTeamChannel, status_code=status.HTTP_201_CREATED)
def create_care_team_channel_endpoint(
    channel: CareTeamChannelCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new care team channel.
    Requires authentication.
    """
    user_id = _extract_user_id(current_user)
    if channel.created_by != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create channels as yourself"
        )
    db_chn = create_care_team_channel(db=db, channel=channel)
    return CareTeamChannel.model_validate(db_chn)

@router.get("/channels", response_model=List[CareTeamChannel])
def read_care_team_channels(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    is_private: Optional[bool] = Query(None),
    is_active_only: bool = Query(True),
    created_by: Optional[int] = Query(None)
):
    """
    Retrieve care team channels with optional filtering.
    Requires authentication.
    """
    channels = get_care_team_channels(
        db=db,
        skip=skip,
        limit=limit,
        is_private=is_private,
        is_active_only=is_active_only,
        created_by=created_by
    )
    return [CareTeamChannel.model_validate(c) for c in channels]

@router.get("/channels/{channel_id}", response_model=CareTeamChannel)
def read_care_team_channel(
    channel_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get a specific care team channel by internal ID.
    Requires authentication.
    """
    db_channel = get_care_team_channel(db, channel_id=channel_id)
    if db_channel is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Channel not found"
        )
    return CareTeamChannel.model_validate(db_channel)

@router.get("/channels/id/{channel_id}", response_model=CareTeamChannel)
def read_care_team_channel_by_id(
    channel_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get a specific care team channel by channel ID (e.g., CHN-001).
    Requires authentication.
    """
    db_channel = get_care_team_channel_by_channel_id(db, channel_id=channel_id)
    if db_channel is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Channel not found"
        )
    return CareTeamChannel.model_validate(db_channel)

@router.put("/channels/{channel_id}", response_model=CareTeamChannel)
def update_care_team_channel_endpoint(
    channel_id: int,
    channel_update: CareTeamChannelUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Update a care team channel.
    Requires authentication.
    """
    db_channel = update_care_team_channel(db=db, channel_id=channel_id, channel_update=channel_update)
    if db_channel is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Channel not found"
        )
    return CareTeamChannel.model_validate(db_channel)

# Care Team Channel Member Endpoints
@router.post("/channels/{channel_id}/members", response_model=dict, status_code=status.HTTP_201_CREATED)
def add_channel_member_endpoint(
    channel_id: int,
    member: CareTeamChannelMemberCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Add a member to a care team channel.
    Requires authentication.
    """
    db_member = add_channel_member(
        db=db,
        channel_id=channel_id,
        user_id=member.user_id,
        role=member.role
    )
    return {"message": f"User {member.user_id} added to channel {channel_id} with role {member.role}"}

@router.delete("/channels/{channel_id}/members/{user_id}", response_model=dict)
def remove_channel_member_endpoint(
    channel_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Remove a member from a care team channel.
    Requires authentication.
    """
    success = remove_channel_member(db=db, channel_id=channel_id, user_id=user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Channel member not found"
        )
    return {"message": f"User {user_id} removed from channel {channel_id}"}

# Clinical Task Endpoints
@router.post("/tasks", response_model=ClinicalTask, status_code=status.HTTP_201_CREATED)
def create_clinical_task_endpoint(
    task: ClinicalTaskCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new clinical task.
    Requires authentication.
    """
    user_id = _extract_user_id(current_user)
    if task.assigned_by != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only assign tasks as yourself"
        )
    db_tsk = create_clinical_task(db=db, task=task)
    return ClinicalTask.model_validate(db_tsk)

@router.get("/tasks", response_model=List[ClinicalTask])
def read_clinical_tasks(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    patient_id: Optional[int] = Query(None),
    assigned_to: Optional[int] = Query(None),
    assigned_by: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    task_type: Optional[str] = Query(None),
    include_completed: bool = Query(False)
):
    """
    Retrieve clinical tasks with optional filtering.
    Requires authentication.
    """
    tasks = get_clinical_tasks(
        db=db,
        skip=skip,
        limit=limit,
        patient_id=patient_id,
        assigned_to=assigned_to,
        assigned_by=assigned_by,
        status=status,
        priority=priority,
        task_type=task_type,
        include_completed=include_completed
    )
    return [ClinicalTask.model_validate(t) for t in tasks]

@router.get("/tasks/{task_id}", response_model=ClinicalTask)
def read_clinical_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get a specific clinical task by internal ID.
    Requires authentication.
    """
    db_task = get_clinical_task(db, task_id=task_id)
    if db_task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    return ClinicalTask.model_validate(db_task)

@router.get("/tasks/id/{task_id}", response_model=ClinicalTask)
def read_clinical_task_by_id(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get a specific clinical task by task ID (e.g., TSK-001).
    Requires authentication.
    """
    db_task = get_clinical_task_by_task_id(db, task_id=task_id)
    if db_task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    return ClinicalTask.model_validate(db_task)

@router.put("/tasks/{task_id}", response_model=ClinicalTask)
def update_clinical_task_endpoint(
    task_id: int,
    task_update: ClinicalTaskUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Update a clinical task.
    Requires authentication.
    """
    db_task = update_clinical_task(db=db, task_id=task_id, task_update=task_update)
    if db_task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    return ClinicalTask.model_validate(db_task)

@router.post("/tasks/{task_id}/complete", response_model=ClinicalTask)
def complete_clinical_task_endpoint(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Mark a clinical task as completed.
    Requires authentication.
    """
    db_task = complete_clinical_task(db=db, task_id=task_id)
    if db_task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    return ClinicalTask.model_validate(db_task)

# Shared Note Endpoints
@router.post("/notes", response_model=SharedNote, status_code=status.HTTP_201_CREATED)
def create_shared_note_endpoint(
    note: SharedNoteCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new shared note.
    Requires authentication.
    """
    user_id = _extract_user_id(current_user)
    if note.created_by != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create notes as yourself"
        )
    db_nt = create_shared_note(db=db, note=note)
    return SharedNote.model_validate(db_nt)

@router.get("/notes", response_model=List[SharedNote])
def read_shared_notes(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    patient_id: Optional[int] = Query(None),
    created_by: Optional[int] = Query(None),
    is_confidential: Optional[bool] = Query(None),
    note_type: Optional[str] = Query(None)
):
    """
    Retrieve shared notes with optional filtering.
    Requires authentication.
    """
    notes = get_shared_notes(
        db=db,
        skip=skip,
        limit=limit,
        patient_id=patient_id,
        created_by=created_by,
        is_confidential=is_confidential,
        note_type=note_type
    )
    return [SharedNote.model_validate(n) for n in notes]


@router.get("/notes/{note_id}", response_model=SharedNote)
def read_shared_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get a specific shared note by internal ID.
    Requires authentication.
    """
    db_note = get_shared_note(db, note_id=note_id)
    if db_note is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    return db_note

@router.get("/notes/id/{note_id}", response_model=SharedNote)
def read_shared_note_by_id(
    note_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get a specific shared note by note ID (e.g., NOTE-001).
    Requires authentication.
    """
    db_note = get_shared_note_by_note_id(db, note_id=note_id)
    if db_note is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    return db_note

@router.put("/notes/{note_id}", response_model=SharedNote)
def update_shared_note_endpoint(
    note_id: int,
    note_update: SharedNoteUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Update a shared note.
    Requires authentication.
    """
    db_note = update_shared_note(db=db, note_id=note_id, note_update=note_update)
    if db_note is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    return db_note