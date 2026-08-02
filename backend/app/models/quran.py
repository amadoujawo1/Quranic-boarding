from datetime import datetime
from .. import db

class HifzProgress(db.Model):
    __tablename__ = 'hifz_progress'

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    teacher_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    date = db.Column(db.Date, nullable=False, default=datetime.utcnow, index=True)

    # Sabaq (New Memorization)
    sabaq_surah = db.Column(db.String(100))
    sabaq_juz = db.Column(db.Integer)
    sabaq_start_page = db.Column(db.Integer)
    sabaq_end_page = db.Column(db.Integer)
    sabaq_grade = db.Column(db.String(10)) # A+, A, B, C, F

    # Sabqi (Recent Revision)
    sabqi_juz = db.Column(db.Integer)
    sabqi_pages = db.Column(db.String(50))
    sabqi_grade = db.Column(db.String(10))

    # Manzil (Overall Old Revision)
    manzil_juz = db.Column(db.Integer)
    manzil_pages = db.Column(db.String(50))
    manzil_grade = db.Column(db.String(10))

    teacher_notes = db.Column(db.Text)

    student = db.relationship('Student', backref=db.backref('hifz_records', lazy='dynamic'))
    teacher = db.relationship('User')

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'student_name': self.student.user.full_name if self.student and self.student.user else None,
            'teacher_name': self.teacher.full_name if self.teacher else None,
            'date': self.date.isoformat() if self.date else None,
            'sabaq': {
                'surah': self.sabaq_surah,
                'juz': self.sabaq_juz,
                'start_page': self.sabaq_start_page,
                'end_page': self.sabaq_end_page,
                'grade': self.sabaq_grade
            },
            'sabqi': {
                'juz': self.sabqi_juz,
                'pages': self.sabqi_pages,
                'grade': self.sabqi_grade
            },
            'manzil': {
                'juz': self.manzil_juz,
                'pages': self.manzil_pages,
                'grade': self.manzil_grade
            },
            'teacher_notes': self.teacher_notes
        }

class TajweedEvaluation(db.Model):
    __tablename__ = 'tajweed_evaluations'

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    evaluator_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'))
    evaluation_date = db.Column(db.Date, default=datetime.utcnow)

    makharij_score = db.Column(db.Float) # Out of 100
    sifat_score = db.Column(db.Float)
    madd_rules_score = db.Column(db.Float)
    ghunnah_score = db.Column(db.Float)
    overall_tajweed_score = db.Column(db.Float)
    fluency_score = db.Column(db.Float)
    comments = db.Column(db.Text)

    student = db.relationship('Student', backref=db.backref('tajweed_evaluations', lazy='dynamic'))
