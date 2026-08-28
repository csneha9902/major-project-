from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime
from snn_ai_optimizer.db.session import get_db
from snn_ai_optimizer.appointment.service import (
    get_appointment,
    get_appointment_by_appointment_id,
    get_appointments,
    create_appointment,
    update_appointment,
    delete_appointment
)
from snn_ai_optimizer.appointment.schemas import (
    AppointmentCreate,
    AppointmentUpdate,
    Appointment,
    AppointmentListResponse,
    AppointmentTypeEnum,
    AppointmentStatusEnum
)
from snn_ai_optimizer.auth.jwt_utils import get_current_user

router = APIRouter(
    prefix="/appointments",
    tags=["appointments"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=Appointment, status_code=status.HTTP_201_CREATED)
def create_appointment_endpoint(
    appointment: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new appointment.
    Requires authentication.
    """
    # Check if appointment_id already exists
    db_appointment = get_appointment_by_appointment_id(db, appointment.appointment_id)
    if db_appointment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Appointment with ID {appointment.appointment_id} already exists"
        )
    # Check if patient exists
    from snn_ai_optimizer.patient.service import get_patient
    db_patient = get_patient(db, appointment.patient_id)
    if not db_patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID {appointment.patient_id} not found"
        )
    # Check if clinic exists
    from snn_ai_optimizer.appointment.service import db
    db_clinic = db.query(Clinic).filter(Clinic.id == appointment.clinic_id).first()
    if not db_clinic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Clinic with ID {appointment.clinic_id} not found"
        )
    # Check if resource exists
    db_resource = db.query(Resource).filter(Resource.id == appointment.resource_id).first()
    if not db_resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resource with ID {appointment.resource_id} not found"
        )
    # Check if scheduling user exists
    db_scheduler = db.query(User).filter(User.id == appointment.scheduled_by).first()
    if not db_scheduler:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {appointment.scheduled_by} not found"
        )
    # Check if attending user exists (if provided)
    if appointment.attended_by:
        db_attendee = db.query(User).filter(User.id == appointment.attended_by).first()
        if not db_attendee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with ID {appointment.attended_by} not found"
            )
    return create_appointment(db=db, appointment=appointment)

@router.get("/", response_model=AppointmentListResponse)
def read_appointments(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    patient_id: Optional[int] = Query(None),
    clinic_id: Optional[int] = Query(None),
    status: Optional[AppointmentStatusEnum] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None)
):
    """
    Retrieve appointments with optional filtering.
    Requires authentication.
    """
    appointments = get_appointments(
        db=db,
        skip=skip,
        limit=limit,
        patient_id=patient_id,
        clinic_id=clinic_id,
        status=status.value if status else None,
        start_date=start_date,
        end_date=end_date
    )
    total = len(appointments)  # In a real app, you'd do a count query

    return AppointmentListResponse(
        appointments=[Appointment.model_validate(a) for a in appointments],
        total=total,
        page=skip // limit + 1 if limit > 0 else 1,
        size=limit
    )

@router.get("/{appointment_id}", response_model=Appointment)
def read_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get a specific appointment by internal ID.
    Requires authentication.
    """
    db_appointment = get_appointment(db, appointment_id=appointment_id)
    if db_appointment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    return db_appointment

@router.get("/id/{appointment_id}", response_model=Appointment)
def read_appointment_by_id(
    appointment_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get a specific appointment by appointment ID (e.g., APT-001).
    Requires authentication.
    """
    db_appointment = get_appointment_by_appointment_id(db, appointment_id=appointment_id)
    if db_appointment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    return db_appointment

@router.put("/{appointment_id}", response_model=Appointment)
def update_appointment_endpoint(
    appointment_id: int,
    appointment_update: AppointmentUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Update an appointment.
    Requires authentication.
    """
    db_appointment = update_appointment(db=db, appointment_id=appointment_id, appointment_update=appointment_update)
    if db_appointment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    return db_appointment

@router.delete("/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_appointment_endpoint(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Delete an appointment.
    Requires authentication.
    """
    success = delete_appointment(db=db, appointment_id=appointment_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    return None

@router.get("/patient/{patient_id}", response_model=List[Appointment])
def get_appointments_for_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    """
    Get all appointments for a specific patient.
    Requires authentication.
    """
    appointments = get_appointments(
        db=db,
        skip=skip,
        limit=limit,
        patient_id=patient_id
    )
    return appointments

@router.get("/clinic/{clinic_id}", response_model=List[Appointment])
def get_appointments_for_clinic(
    clinic_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None)
):
    """
    Get all appointments for a specific clinic.
    Requires authentication.
    """
    appointments = get_appointments(
        db=db,
        skip=skip,
        limit=limit,
        clinic_id=clinic_id,
        start_date=start_date,
        end_date=end_date
    )
    return appointments

@router.get("/resource/{resource_id}", response_model=List[Appointment])
def get_appointments_for_resource(
    resource_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None)
):
    """
    Get all appointments for a specific resource.
    Requires authentication.
    """
    appointments = get_appointments(
        db=db,
        skip=skip,
        limit=limit,
        resource_id=resource_id,
        start_date=start_date,
        end_date=end_date
    )
    return appointments