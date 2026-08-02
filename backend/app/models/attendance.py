from datetime import datetime
from app import db

class SchoolAttendance(db.Model):
    __tablename__ = 'school_attendance'

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    date = db.Column(db.Date, nullable=False, default=datetime.utcnow, index=True)
    status = db.Column(db.String(20), nullable=False, default='Present') # Present, Absent, Late, Excused
    remarks = db.Column(db.String(255))
    method = db.Column(db.String(20), default='Manual') # Manual, QR Code, Biometric

    student = db.relationship('Student', backref=db.backref('school_attendances', lazy='dynamic'))

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

class HostelAttendance(db.Model):
    __tablename__ = 'hostel_attendance'

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    date = db.Column(db.Date, nullable=False, default=datetime.utcnow, index=True)
    status = db.Column(db.String(20), nullable=False, default='Present') # In Dorm, Outing, Absent, Sickbay
    remarks = db.Column(db.String(255))

    student = db.relationship('Student', backref=db.backref('hostel_attendances', lazy='dynamic'))

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

class PrayerAttendance(db.Model):
    __tablename__ = 'prayer_attendance'

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    date = db.Column(db.Date, nullable=False, default=datetime.utcnow, index=True)
    prayer_name = db.Column(db.String(15), nullable=False) # Fajr, Dhuhr, Asr, Maghrib, Isha
    status = db.Column(db.String(20), nullable=False, default='Jamaat') # Jamaat (In Congregation), Late, Excused, Absent
    remarks = db.Column(db.String(255))

    student = db.relationship('Student', backref=db.backref('prayer_attendances', lazy='dynamic'))

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

class MealAttendance(db.Model):
    __tablename__ = 'meal_attendance'

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    date = db.Column(db.Date, nullable=False, default=datetime.utcnow, index=True)
    meal_type = db.Column(db.String(15), nullable=False) # Breakfast, Lunch, Dinner
    status = db.Column(db.String(20), nullable=False, default='Attended') # Attended, Missed

    student = db.relationship('Student', backref=db.backref('meal_attendances', lazy='dynamic'))

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
