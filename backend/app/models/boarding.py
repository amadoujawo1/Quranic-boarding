from datetime import datetime
from app import db

class Building(db.Model):
    __tablename__ = 'buildings'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False) # e.g. Abu Bakr Hall, Umar Hall, Aisha Hall
    gender = db.Column(db.String(10), nullable=False) # Boys, Girls
    total_capacity = db.Column(db.Integer, default=100)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

class Dormitory(db.Model):
    __tablename__ = 'dormitories'

    id = db.Column(db.Integer, primary_key=True)
    building_id = db.Column(db.Integer, db.ForeignKey('buildings.id', ondelete='CASCADE'), nullable=False)
    name = db.Column(db.String(100), nullable=False) # e.g. Floor 1 Dorm A
    master_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True) # Hostel Master / Matron

    building = db.relationship('Building', backref=db.backref('dormitories', lazy='dynamic'))
    master = db.relationship('User')

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

class Room(db.Model):
    __tablename__ = 'rooms'

    id = db.Column(db.Integer, primary_key=True)
    dormitory_id = db.Column(db.Integer, db.ForeignKey('dormitories.id', ondelete='CASCADE'), nullable=False)
    room_number = db.Column(db.String(20), nullable=False)
    capacity = db.Column(db.Integer, default=4)

    dormitory = db.relationship('Dormitory', backref=db.backref('rooms', lazy='dynamic'))

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

class Bed(db.Model):
    __tablename__ = 'beds'

    id = db.Column(db.Integer, primary_key=True)
    room_id = db.Column(db.Integer, db.ForeignKey('rooms.id', ondelete='CASCADE'), nullable=False)
    bed_number = db.Column(db.String(20), nullable=False) # Bed 1A, Bed 1B
    is_occupied = db.Column(db.Boolean, default=False)

    room = db.relationship('Room', backref=db.backref('beds', lazy='dynamic'))

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

class HostelAllocation(db.Model):
    __tablename__ = 'hostel_allocations'

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    bed_id = db.Column(db.Integer, db.ForeignKey('beds.id', ondelete='CASCADE'), nullable=False)
    allocated_at = db.Column(db.DateTime, default=datetime.utcnow)
    deallocated_at = db.Column(db.DateTime, nullable=True)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

class VisitorLog(db.Model):
    __tablename__ = 'visitor_logs'

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    visitor_name = db.Column(db.String(150), nullable=False)
    relationship = db.Column(db.String(50))
    contact_phone = db.Column(db.String(30))
    entry_time = db.Column(db.DateTime, default=datetime.utcnow)
    exit_time = db.Column(db.DateTime, nullable=True)
    purpose = db.Column(db.Text)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

class MaintenanceRequest(db.Model):
    __tablename__ = 'maintenance_requests'

    id = db.Column(db.Integer, primary_key=True)
    building_id = db.Column(db.Integer, db.ForeignKey('buildings.id', ondelete='CASCADE'))
    room_number = db.Column(db.String(30))
    issue_description = db.Column(db.Text, nullable=False)
    priority = db.Column(db.String(20), default='Medium') # Low, Medium, High, Emergency
    status = db.Column(db.String(20), default='Pending') # Pending, In Progress, Completed
    reported_by_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'))
    reported_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
