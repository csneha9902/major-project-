from sqlalchemy.orm import Session
from typing import List, Optional
from snn_ai_optimizer.db.models import Patient, GenderEnum as DBGenderEnum, BloodTypeEnum as DBBloodTypeEnum
from snn_ai_optimizer.patient.schemas import PatientCreate, PatientUpdate
from datetime import datetime

def _map_enums(patient_data: dict):
    if "gender" in patient_data and patient_data["gender"] is not None:
        g = patient_data["gender"]
        val = g.value if hasattr(g, "value") else str(g)
        for m in DBGenderEnum:
            if m.value.lower() == val.lower() or m.name.lower() == val.lower():
                patient_data["gender"] = m
                break
    if "blood_type" in patient_data and patient_data["blood_type"] is not None:
        bt = patient_data["blood_type"]
        val = bt.value if hasattr(bt, "value") else str(bt)
        for m in DBBloodTypeEnum:
            if m.value.lower() == val.lower() or m.name.lower() == val.lower():
                patient_data["blood_type"] = m
                break

def get_patient(db: Session, patient_id: int) -> Optional[Patient]:
    return db.query(Patient).filter(Patient.id == patient_id).first()

def get_patient_by_patient_id(db: Session, patient_id: str) -> Optional[Patient]:
    return db.query(Patient).filter(Patient.patient_id == patient_id).first()

def get_patients(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    gender: Optional[str] = None
) -> List[Patient]:
    query = db.query(Patient)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Patient.name.ilike(search_term)) |
            (Patient.patient_id.ilike(search_term))
        )

    if gender:
        query = query.filter(Patient.gender.ilike(f"%{gender}%"))

    return query.offset(skip).limit(limit).all()

def create_patient(db: Session, patient: PatientCreate) -> Patient:
    # Set consent date if consent is given
    patient_data = patient.dict()
    if patient_data.get("consent_given") and not patient_data.get("consent_date"):
        patient_data["consent_date"] = datetime.now()

    if "gender" in patient_data and patient_data["gender"]:
        g = patient_data["gender"]
        patient_data["gender"] = g.value if hasattr(g, "value") else str(g)
    if "blood_type" in patient_data and patient_data["blood_type"]:
        bt = patient_data["blood_type"]
        patient_data["blood_type"] = bt.value if hasattr(bt, "value") else str(bt)

    db_patient = Patient(**patient_data)
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

def update_patient(db: Session, patient_id: int, patient_update: PatientUpdate) -> Optional[Patient]:
    db_patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if db_patient:
        update_data = patient_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_patient, field, value)
        db.commit()
        db.refresh(db_patient)
    return db_patient

def delete_patient(db: Session, patient_id: int) -> bool:
    db_patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if db_patient:
        db.delete(db_patient)
        db.commit()
        return True
    return False