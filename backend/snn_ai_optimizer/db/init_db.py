from sqlalchemy.orm import Session
from .session import engine, SessionLocal
from .models import Base, Patient, User, GenderEnum, BloodTypeEnum, CognitiveStateEnum, UserRoleEnum, Clinic, Resource, Appointment, AppointmentStatusEnum, AppointmentTypeEnum, CareTeamChannel, CareTeamMessage, CareTeamChannelMember, ClinicalTask, SharedNote
from passlib.context import CryptContext
import uuid
from datetime import date, datetime, time, timedelta

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def init_db() -> None:
    # Create tables
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Check if we already have users
        if db.query(User).count() == 0:
            # Create initial admin user
            admin_user = User(
                user_id="ADM-001",
                email="admin@hospital.com",
                username="admin",
                full_name="System Administrator",
                hashed_password=get_password_hash("admin123"),  # In production, use strong password
                role=UserRoleEnum.ADMIN,
                is_active=True,
                department="IT",
                specialty="System Administration"
            )
            db.add(admin_user)

            # Create initial doctor user
            doctor_user = User(
                user_id="DOC-001",
                email="doctor@hospital.com",
                username="dr.smith",
                full_name="Dr. Sarah Smith, MD",
                hashed_password=get_password_hash("doctor123"),
                role=UserRoleEnum.DOCTOR,
                is_active=True,
                department="Neuropsychiatry",
                specialty="Cognitive Neurology"
            )
            db.add(doctor_user)

            # Create initial technician user
            tech_user = User(
                user_id="TEC-001",
                email="tech@hospital.com",
                username="tech.jones",
                full_name="Alex Johnson, RT",
                hashed_password=get_password_hash("tech123"),
                role=UserRoleEnum.TECHNICIAN,
                is_active=True,
                department="Neurodiagnostics",
                specialty="EEG Technology"
            )
            db.add(tech_user)

            db.commit()
            print("Created initial users")

        # Check if we already have patients
        if db.query(Patient).count() == 0:
            # Create sample patients matching the existing mock data
            sample_patients = [
                {
                    "patient_id": "PAT-10492",
                    "name": "Eleanor Vance",
                    "age": 34,
                    "gender": GenderEnum.FEMALE,
                    "blood_type": BloodTypeEnum.A_PLUS,
                    "phone_number": "555-0101",
                    "email": "eleanor.vance@email.com",
                    "date_of_birth": date(1992, 5, 15),
                    "medical_history": "History of tension headaches and insomnia",
                    "primary_care_physician": "Dr. Sarah Jenkins, MD (Neuropsychiatry)",
                    "consent_given": True,
                    "consent_date": datetime.now() - timedelta(days=30),
                    "data_sharing_consent": True,
                    "created_by": 1  # Admin user
                },
                {
                    "patient_id": "PAT-10493",
                    "name": "James Wilson",
                    "age": 42,
                    "gender": GenderEnum.MALE,
                    "blood_type": BloodTypeEnum.O_PLUS,
                    "phone_number": "555-0102",
                    "email": "james.wilson@email.com",
                    "date_of_birth": date(1984, 8, 22),
                    "medical_history": "Post-concussion monitoring",
                    "primary_care_physician": "Dr. Marcus Vance, MD (Clinical Neurology)",
                    "consent_given": True,
                    "consent_date": datetime.now() - timedelta(days=25),
                    "data_sharing_consent": True,
                    "created_by": 1  # Admin user
                },
                {
                    "patient_id": "PAT-10494",
                    "name": "Sophia Martinez",
                    "age": 29,
                    "gender": GenderEnum.FEMALE,
                    "blood_type": BloodTypeEnum.B_PLUS,
                    "phone_number": "555-0103",
                    "email": "sophia.martinez@email.com",
                    "date_of_birth": date(1997, 3, 10),
                    "medical_history": "Shift work sleep disorder",
                    "primary_care_physician": "Dr. Sarah Jenkins, MD (Neuropsychiatry)",
                    "consent_given": True,
                    "consent_date": datetime.now() - timedelta(days=20),
                    "data_sharing_consent": True,
                    "created_by": 1  # Admin user
                }
            ]

            for patient_data in sample_patients:
                patient = Patient(**patient_data)
                db.add(patient)

            db.commit()
            print("Created sample patients")

        # Check if we already have clinics
        if db.query(Clinic).count() == 0:
            # Create sample clinic
            sample_clinic = Clinic(
                clinic_id="CLN-001",
                name="Neurocognitive Wellness Center",
                description="Specialized clinic for cognitive health assessment and optimization",
                address="123 Brain Health Ave, Neurocity, NC 12345",
                phone_number="555-0100",
                email="info@neurowellness.com",
                is_active=True
            )
            db.add(sample_clinic)
            db.commit()
            db.refresh(sample_clinic)
            print("Created sample clinic")

            # Create sample resources
            sample_resources = [
                {
                    "resource_id": "RES-001",
                    "clinic_id": sample_clinic.id,
                    "name": "EEG Room 1",
                    "resource_type": "EEG Equipment",
                    "is_available": True
                },
                {
                    "resource_id": "RES-002",
                    "clinic_id": sample_clinic.id,
                    "name": "Therapy Room A",
                    "resource_type": "Therapy Space",
                    "is_available": True
                },
                {
                    "resource_id": "RES-003",
                    "clinic_id": sample_clinic.id,
                    "name": "Consultation Room B",
                    "resource_type": "Office Space",
                    "is_available": True
                }
            ]

            for resource_data in sample_resources:
                resource = Resource(**resource_data)
                db.add(resource)

            db.commit()
            print("Created sample resources")

        # Check if we already have appointments
        if db.query(Appointment).count() == 0:
            # Create sample appointments
            sample_appointments = [
                {
                    "appointment_id": "APT-001",
                    "patient_id": 1,  # Eleanor Vance
                    "clinic_id": 1,  # Neurocognitive Wellness Center
                    "resource_id": 1,  # EEG Room 1
                    "scheduled_by": 2,  # Dr. Sarah Smith
                    "attended_by": 2,  # Dr. Sarah Smith
                    "appointment_type": AppointmentTypeEnum.INITIAL_EVALUATION,
                    "status": AppointmentStatusEnum.COMPLETED,
                    "scheduled_date": date(2026, 8, 20),
                    "scheduled_time": time(9, 30, 0),
                    "duration_minutes": 60,
                    "actual_start_time": time(9, 30, 0),
                    "actual_end_time": time(10, 30, 0),
                    "reason_for_visit": "Initial cognitive assessment for stress and focus issues",
                    "notes": "Patient showed elevated beta activity during initial assessment",
                    "outcomes": "Recommended neurofeedback therapy and lifestyle modifications"
                },
                {
                    "appointment_id": "APT-002",
                    "patient_id": 2,  # James Wilson
                    "clinic_id": 1,  # Neurocognitive Wellness Center
                    "resource_id": 3,  # Consultation Room B
                    "scheduled_by": 2,  # Dr. Sarah Smith
                    "attended_by": 2,  # Dr. Sarah Smith
                    "appointment_type": AppointmentTypeEnum.FOLLOW_UP,
                    "status": AppointmentStatusEnum.SCHEDULED,
                    "scheduled_date": date(2026, 8, 28),
                    "scheduled_time": time(11, 0, 0),
                    "duration_minutes": 30,
                    "reason_for_visit": "Follow-up post-concussion monitoring",
                    "notes": "Patient reporting improved symptoms",
                    "outcomes": "Continue current treatment plan"
                }
            ]

            for appointment_data in sample_appointments:
                appointment = Appointment(**appointment_data)
                db.add(appointment)

            db.commit()
            print("Created sample appointments")

    except Exception as e:
        print(f"Error initializing database: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

    # Create sample collaboration data if we have the basic data
    try:
        # Check if we already have collaboration data
        if db.query(CareTeamChannel).count() == 0:
            # Create sample care team channel
            sample_channel = CareTeamChannel(
                channel_id="CHN-001",
                name="Neurocognitive Team",
                description="Primary care team for neurocognitive patients",
                is_private=False,
                created_by=1  # Admin user
            )
            db.add(sample_channel)
            db.commit()
            db.refresh(sample_channel)
            print("Created sample care team channel")

            # Add channel members
            sample_members = [
                {
                    "channel_id": sample_channel.id,
                    "user_id": 1,  # Admin
                    "role": "owner"
                },
                {
                    "channel_id": sample_channel.id,
                    "user_id": 2,  # Doctor
                    "role": "moderator"
                },
                {
                    "channel_id": sample_channel.id,
                    "user_id": 3,  # Technician
                    "role": "member"
                }
            ]

            for member_data in sample_members:
                member = CareTeamChannelMember(**member_data)
                db.add(member)

            db.commit()
            print("Created sample channel members")

        # Create sample clinical tasks if we have patients and users
        if db.query(ClinicalTask).count() == 0 and db.query(Patient).count() > 0 and db.query(User).count() > 0:
            sample_tasks = [
                {
                    "task_id": "TSK-001",
                    "patient_id": 1,  # Eleanor Vance
                    "assigned_by": 2,  # Dr. Sarah Smith
                    "assigned_to": 3,  # Alex Johnson (Tech)
                    "title": "Follow up EEG test",
                    "description": "Schedule follow-up EEG to monitor beta activity changes",
                    "status": "pending",
                    "priority": "medium",
                    "task_type": "follow_up_assessment",
                    "due_date": datetime.now() + timedelta(days=7)
                },
                {
                    "task_id": "TSK-002",
                    "patient_id": 2,  # James Wilson
                    "assigned_by": 2,  # Dr. Sarah Smith
                    "assigned_to": 2,  # Dr. Sarah Smith (self-assigned)
                    "title": "Review medication efficacy",
                    "description": "Assess current medication plan for post-concussion symptoms",
                    "status": "in_progress",
                    "priority": "high",
                    "task_type": "medication_review",
                    "due_date": datetime.now() + timedelta(days=3)
                }
            ]

            for task_data in sample_tasks:
                task = ClinicalTask(**task_data)
                db.add(task)

            db.commit()
            print("Created sample clinical tasks")

        # Create sample shared notes if we have patients and users
        if db.query(SharedNote).count() == 0 and db.query(Patient).count() > 0 and db.query(User).count() > 0:
            sample_notes = [
                {
                    "note_id": "NOTE-001",
                    "patient_id": 1,  # Eleanor Vance
                    "created_by": 2,  # Dr. Sarah Smith
                    "title": "Initial Assessment Notes",
                    "content": "Patient presented with complaints of stress and focus difficulties. Baseline EEG showed elevated beta/alpha ratio. Recommended neurofeedback intervention.",
                    "is_confidential": False,
                    "note_type": "progress_note"
                },
                {
                    "note_id": "NOTE-002",
                    "patient_id": 2,  # James Wilson
                    "created_by": 2,  # Dr. Sarah Smith
                    "title": "Post-Concussion Follow Up",
                    "content": "Patient reports improvement in headaches and dizziness. EEG shows normalization of beta activity. Continuing current treatment plan.",
                    "is_confidential": False,
                    "note_type": "progress_note"
                }
            ]

            for note_data in sample_notes:
                note = SharedNote(**note_data)
                db.add(note)

            db.commit()
            print("Created sample shared notes")

        # Create sample care team messages
        if db.query(CareTeamMessage).count() == 0 and db.query(User).count() > 0:
            sample_messages = [
                {
                    "message_id": "MSG-001",
                    "sender_id": 2,  # Dr. Sarah Smith
                    "recipient_id": 3,  # Alex Johnson (Tech)
                    "patient_id": 1,  # Eleanor Vance
                    "subject": "EDF Baseline Review",
                    "content": "Patient Eleanor Vance's EDF recording is completed. SNN optimizer indicates moderate stress biomarkers. Please prepare baseline neurofeedback session.",
                    "is_read": False,
                    "is_urgent": False,
                    "message_type": "consultation"
                },
                {
                    "message_id": "MSG-002",
                    "sender_id": 3,  # Alex Johnson
                    "recipient_id": 2,  # Dr. Sarah Smith
                    "patient_id": 1,
                    "subject": "Session Completed",
                    "content": "Baseline EEG session completed and EDF uploaded. Beta/Alpha ratio is 1.42. Task queued for review.",
                    "is_read": True,
                    "is_urgent": False,
                    "message_type": "update"
                },
                {
                    "message_id": "MSG-003",
                    "sender_id": 1,  # Admin
                    "channel_id": 1,  # Neurocognitive Team channel
                    "subject": "Protocol Update",
                    "content": "Updated neuromorphic analysis protocol v2.4 is now active for all incoming EDF and CSV data streams.",
                    "is_read": False,
                    "is_urgent": True,
                    "message_type": "alert"
                }
            ]

            for msg_data in sample_messages:
                msg = CareTeamMessage(**msg_data)
                db.add(msg)

            db.commit()
            print("Created sample care team messages")


    except Exception as e:
        print(f"Error creating sample collaboration data: {e}")
        # Don't fail the entire initialization if sample data fails
        pass

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully")