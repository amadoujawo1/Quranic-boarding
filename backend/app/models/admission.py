from datetime import datetime
from app import db


class AdmissionApplication(db.Model):
    __tablename__ = 'admission_applications'

    def __init__(self, **kwargs):
        """Allow keyword arguments for all fields."""
        super().__init__(**kwargs)

    id = db.Column(db.Integer, primary_key=True)

    # Applicant details
    full_name        = db.Column(db.String(150), nullable=False)
    date_of_birth    = db.Column(db.Date, nullable=False)
    gender           = db.Column(db.String(10), nullable=False)
    nationality      = db.Column(db.String(80), default='Gambian')
    blood_group      = db.Column(db.String(5))
    previous_school  = db.Column(db.String(150))

    # Contact / guardian details
    guardian_name       = db.Column(db.String(150), nullable=False)
    guardian_relationship = db.Column(db.String(50), default='Father')
    guardian_phone      = db.Column(db.String(30), nullable=False)
    guardian_email      = db.Column(db.String(120))
    guardian_address    = db.Column(db.Text)
    guardian_occupation = db.Column(db.String(100))

    # Programme
    programme       = db.Column(db.String(100), default='Full Hifz Programme')
    academic_year   = db.Column(db.String(20), default='2026/2027')
    boarding_required = db.Column(db.Boolean, default=True)

    # Quran background
    quran_level     = db.Column(db.String(50))   # Beginner, Intermediate, Advanced
    current_juz     = db.Column(db.Integer, default=0)
    has_previous_hifz = db.Column(db.Boolean, default=False)

    # Medical / special needs
    medical_conditions   = db.Column(db.Text)
    allergies            = db.Column(db.Text)
    special_needs        = db.Column(db.Text)

    # Application lifecycle
    application_number  = db.Column(db.String(30), unique=True, nullable=False, index=True)
    status              = db.Column(db.String(30), default='Pending')
    # Pending | Under Review | Interview Scheduled | Accepted | Rejected | Enrolled
    submission_date     = db.Column(db.DateTime, default=datetime.utcnow)
    interview_date      = db.Column(db.DateTime, nullable=True)
    decision_date       = db.Column(db.DateTime, nullable=True)
    decision_notes      = db.Column(db.Text)

    # Link to enrolled student (if converted)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id', ondelete='SET NULL'), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'application_number': self.application_number,
            'full_name': self.full_name,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'gender': self.gender,
            'nationality': self.nationality,
            'blood_group': self.blood_group,
            'previous_school': self.previous_school,
            'guardian_name': self.guardian_name,
            'guardian_relationship': self.guardian_relationship,
            'guardian_phone': self.guardian_phone,
            'guardian_email': self.guardian_email,
            'guardian_address': self.guardian_address,
            'guardian_occupation': self.guardian_occupation,
            'programme': self.programme,
            'academic_year': self.academic_year,
            'boarding_required': self.boarding_required,
            'quran_level': self.quran_level,
            'current_juz': self.current_juz,
            'has_previous_hifz': self.has_previous_hifz,
            'medical_conditions': self.medical_conditions,
            'allergies': self.allergies,
            'special_needs': self.special_needs,
            'status': self.status,
            'submission_date': self.submission_date.isoformat() if self.submission_date else None,
            'interview_date': self.interview_date.isoformat() if self.interview_date else None,
            'decision_date': self.decision_date.isoformat() if self.decision_date else None,
            'decision_notes': self.decision_notes,
            'student_id': self.student_id,
        }
