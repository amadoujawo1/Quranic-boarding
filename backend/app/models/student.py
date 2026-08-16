from datetime import datetime
from .. import db

class Parent(db.Model):
    __tablename__ = 'parents'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    relationship = db.Column(db.String(50)) # Father, Mother, Guardian
    occupation = db.Column(db.String(100))
    address = db.Column(db.Text)
    emergency_contact = db.Column(db.String(30))

    user = db.relationship('User', backref=db.backref('parent_profile', uselist=False))

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.user.full_name if self.user else None,
            'email': self.user.email if self.user else None,
            'phone': self.user.phone if self.user else None,
            'relationship': self.relationship,
            'occupation': self.occupation,
            'address': self.address,
            'emergency_contact': self.emergency_contact
        }

class Student(db.Model):
    __tablename__ = 'students'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=True)
    parent_id = db.Column(db.Integer, db.ForeignKey('parents.id', ondelete='SET NULL'), nullable=True)
    student_id_number = db.Column(db.String(50), unique=True, nullable=False, index=True) # e.g. QBS-2026-001
    qr_code = db.Column(db.String(255), nullable=True)
    date_of_birth = db.Column(db.Date, nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    blood_group = db.Column(db.String(5))
    admission_date = db.Column(db.Date, default=datetime.utcnow)
    status = db.Column(db.String(30), default='Active') # Active, Graduated, Suspended, Alumni
    class_id = db.Column(db.Integer, db.ForeignKey('class_groups.id', ondelete='SET NULL'), nullable=True)
    dormitory_bed_id = db.Column(db.Integer, db.ForeignKey('beds.id', ondelete='SET NULL'), nullable=True)

    user = db.relationship('User', backref=db.backref('student_profile', uselist=False))
    parent = db.relationship('Parent', backref=db.backref('students', lazy='dynamic'))

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'student_id_number': self.student_id_number,
            'full_name': self.user.full_name if self.user else None,
            'email': self.user.email if self.user else None,
            'phone': self.user.phone if self.user else None,
            'parent_id': self.parent_id,
            'parent_name': self.parent.user.full_name if self.parent and self.parent.user else None,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'gender': self.gender,
            'blood_group': self.blood_group,
            'admission_date': self.admission_date.isoformat() if self.admission_date else None,
            'status': self.status,
            'qr_code': self.qr_code,
            'avatar_url': self.user.avatar_url if self.user else None
        }

class MedicalRecord(db.Model):
    __tablename__ = 'medical_records'

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    allergies = db.Column(db.Text)
    chronic_conditions = db.Column(db.Text)
    dietary_restrictions = db.Column(db.Text)
    emergency_instructions = db.Column(db.Text)

    student = db.relationship('Student', backref=db.backref('medical_record', uselist=False))

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

class StudentDocument(db.Model):
    __tablename__ = 'student_documents'

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    document_type = db.Column(db.String(50)) # Birth Certificate, Transfer Certificate, Medical Report
    file_path = db.Column(db.String(255), nullable=False)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

class Alumni(db.Model):
    __tablename__ = 'alumni'

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    graduation_year = db.Column(db.Integer, nullable=False)
    hifz_completion_date = db.Column(db.Date)
    current_occupation = db.Column(db.String(150))
    higher_education = db.Column(db.String(150))
    contact_email = db.Column(db.String(120))

    student = db.relationship('Student', backref=db.backref('alumni_record', uselist=False))

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def to_dict(self):
        full_name = self.student.user.full_name if self.student and self.student.user else None
        student_id_number = self.student.student_id_number if self.student else None
        return {
            'id': self.id,
            'student_id': self.student_id,
            'student_id_number': student_id_number,
            'full_name': full_name,
            'graduation_year': self.graduation_year,
            'hifz_completion_date': self.hifz_completion_date.isoformat() if self.hifz_completion_date else None,
            'current_occupation': self.current_occupation,
            'higher_education': self.higher_education,
            'contact_email': self.contact_email
        }

