from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from snn_ai_optimizer.db.session import get_db
from snn_ai_optimizer.patient.service import (
    get_patient,
    get_patient_by_patient_id,
    get_patients,
    create_patient,
    update_patient,
    delete_patient
)
from snn_ai_optimizer.patient.schemas import (
    PatientCreate,
    PatientUpdate,
    Patient,
    PatientListResponse,
    GenderEnum,
    BloodTypeEnum
)
from snn_ai_optimizer.auth.jwt_utils import get_current_user

router = APIRouter(
    prefix="/patients",
    tags=["patients"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=Patient, status_code=status.HTTP_201_CREATED)
def create_patient_endpoint(
    patient: PatientCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new patient record.
    Requires authentication.
    """
    # Check if patient_id already exists
    db_patient = get_patient_by_patient_id(db, patient.patient_id)
    if db_patient:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Patient with ID {patient.patient_id} already exists"
        )
    return create_patient(db=db, patient=patient)

@router.get("/")
def read_patients(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = Query(None),
    gender: Optional[GenderEnum] = Query(None)
):
    """
    Retrieve patient records with optional filtering.
    Requires authentication.
    """
    patients_db = get_patients(db=db, skip=skip, limit=limit, search=search, gender=gender)
    total = len(patients_db)
    # Explicitly convert each SQLAlchemy model instance using model_validate (Pydantic v2)
    from snn_ai_optimizer.patient.schemas import Patient as PatientSchema
    patients_out = [PatientSchema.model_validate(p) for p in patients_db]

    return {
        "patients": [p.model_dump() for p in patients_out],
        "total": total,
        "page": skip // limit + 1 if limit > 0 else 1,
        "size": limit,
    }

@router.get("/{patient_id}", response_model=Patient)
def read_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get a specific patient by internal ID.
    Requires authentication.
    """
    db_patient = get_patient(db, patient_id=patient_id)
    if db_patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    return db_patient

@router.get("/id/{patient_id}", response_model=Patient)
def read_patient_by_id(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get a specific patient by patient ID (e.g., PAT-10492).
    Requires authentication.
    """
    db_patient = get_patient_by_patient_id(db, patient_id=patient_id)
    if db_patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    return db_patient

@router.put("/{patient_id}", response_model=Patient)
def update_patient_endpoint(
    patient_id: int,
    patient_update: PatientUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Update a patient record.
    Requires authentication.
    """
    db_patient = update_patient(db=db, patient_id=patient_id, patient_update=patient_update)
    if db_patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    return db_patient

@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_patient_endpoint(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a patient record.
    Requires authentication.
    """
    success = delete_patient(db=db, patient_id=patient_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    return None

@router.get("/{patient_id}/sessions")
def get_patient_sessions(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get all sessions for a specific patient.
    Requires authentication.
    """
    # This would join with the sessions table
    # For now, return a placeholder
    return {
        "patient_id": patient_id,
        "sessions": [],
        "message": "Sessions endpoint - to be implemented"
    }