from sqlalchemy.orm import Session
from typing import List, Optional
from snn_ai_optimizer.db.models import Appointment, Clinic, Resource, User
from snn_ai_optimizer.appointment.schemas import AppointmentCreate, AppointmentUpdate
from datetime import date, time, datetime

def get_appointment(db: Session, appointment_id: int) -> Optional[Appointment]:
    return db.query(Appointment).filter(Appointment.id == appointment_id).first()

def get_appointment_by_appointment_id(db: Session, appointment_id: str) -> Optional[Appointment]:
    return db.query(Appointment).filter(Appointment.appointment_id == appointment_id).first()

def get_appointments(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    patient_id: Optional[int] = None,
    clinic_id: Optional[int] = None,
    status: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
) -> List[Appointment]:
    query = db.query(Appointment)

    if patient_id:
        query = query.filter(Appointment.patient_id == patient_id)

    if clinic_id:
        query = query.filter(Appointment.clinic_id == clinic_id)

    if status:
        query = query.filter(Appointment.status == status)

    if start_date:
        query = query.filter(Appointment.scheduled_date >= start_date)

    if end_date:
        query = query.filter(Appointment.scheduled_date <= end_date)

    return query.offset(skip).limit(limit).all()

def create_appointment(db: Session, appointment: AppointmentCreate) -> Appointment:
    # Check for scheduling conflicts
    existing_appointment = db.query(Appointment).filter(
        Appointment.resource_id == appointment.resource_id,
        Appointment.scheduled_date == appointment.scheduled_date,
        Appointment.scheduled_time == appointment.scheduled_time,
        Appointment.status.in_([AppointmentStatusEnum.SCHEDULED, AppointmentStatusEnum.RESCHEDULED])
    ).first()

    if existing_appointment:
        raise ValueError(f"Resource {appointment.resource_id} is already booked at {appointment.scheduled_date} {appointment.scheduled_time}")

    db_appointment = Appointment(**appointment.dict())
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment

def update_appointment(db: Session, appointment_id: int, appointment_update: AppointmentUpdate) -> Optional[Appointment]:
    db_appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if db_appointment:
        update_data = appointment_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_appointment, field, value)
        db.commit()
        db.refresh(db_appointment)
    return db_appointment

def delete_appointment(db: Session, appointment_id: int) -> bool:
    db_appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if db_appointment:
        db.delete(db_appointment)
        db.commit()
        return True
    return False