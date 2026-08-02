from datetime import datetime
from app import db

class ClassGroup(db.Model):
    __tablename__ = 'class_groups'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False) # e.g. Grade 7, Hifz Class A, Mutawassit 1
    code = db.Column(db.String(20), unique=True)
    academic_year = db.Column(db.String(20)) # e.g. 2026/2027
    class_teacher_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)

    class_teacher = db.relationship('User')

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'code': self.code,
            'academic_year': self.academic_year,
            'class_teacher_name': self.class_teacher.full_name if self.class_teacher else None
        }

class Subject(db.Model):
    __tablename__ = 'subjects'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False) # e.g. Aqeedah, Fiqh, Hadith, Tafsir, Seerah, Arabic, Mathematics, Science
    code = db.Column(db.String(20), unique=True)
    category = db.Column(db.String(50), default='Islamic Studies') # Islamic Studies, Academic, Language
    credit_hours = db.Column(db.Integer, default=3)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'code': self.code,
            'category': self.category,
            'credit_hours': self.credit_hours
        }

class Timetable(db.Model):
    __tablename__ = 'timetables'

    id = db.Column(db.Integer, primary_key=True)
    class_id = db.Column(db.Integer, db.ForeignKey('class_groups.id', ondelete='CASCADE'), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.id', ondelete='CASCADE'), nullable=False)
    teacher_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'))
    day_of_week = db.Column(db.String(15), nullable=False) # Monday, Tuesday...
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    room_number = db.Column(db.String(30))

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

class Homework(db.Model):
    __tablename__ = 'homework'

    id = db.Column(db.Integer, primary_key=True)
    class_id = db.Column(db.Integer, db.ForeignKey('class_groups.id', ondelete='CASCADE'), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.id', ondelete='CASCADE'), nullable=False)
    teacher_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    due_date = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

class Exam(db.Model):
    __tablename__ = 'exams'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False) # Midterm 1, Final Exam
    academic_term = db.Column(db.String(50)) # Term 1, Term 2
    academic_year = db.Column(db.String(20))
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

class Grade(db.Model):
    __tablename__ = 'grades'

    id = db.Column(db.Integer, primary_key=True)
    exam_id = db.Column(db.Integer, db.ForeignKey('exams.id', ondelete='CASCADE'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey('subjects.id', ondelete='CASCADE'), nullable=False)
    marks_obtained = db.Column(db.Float, nullable=False)
    max_marks = db.Column(db.Float, default=100.0)
    grade_letter = db.Column(db.String(5)) # A+, A, B, C, D, F
    remarks = db.Column(db.String(255))

    student = db.relationship('Student', backref=db.backref('grades', lazy='dynamic'))
    subject = db.relationship('Subject')
    exam = db.relationship('Exam')

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
