from datetime import datetime
from .. import db

class ClinicVisit(db.Model):
    __tablename__ = 'clinic_visits'

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    visit_date = db.Column(db.DateTime, default=datetime.utcnow)
    symptoms = db.Column(db.Text, nullable=False)
    diagnosis = db.Column(db.Text)
    treatment_given = db.Column(db.Text)
    prescribed_medication = db.Column(db.Text)
    referred_to_hospital = db.Column(db.Boolean, default=False)
    attending_staff_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'))

    student = db.relationship('Student', backref=db.backref('clinic_visits', lazy='dynamic'))

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

class Vaccination(db.Model):
    __tablename__ = 'vaccinations'

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    vaccine_name = db.Column(db.String(100), nullable=False)
    dose_number = db.Column(db.Integer, default=1)
    administered_date = db.Column(db.Date, nullable=False)
    next_due_date = db.Column(db.Date, nullable=True)

    student = db.relationship('Student', backref=db.backref('vaccinations', lazy='dynamic'))

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
