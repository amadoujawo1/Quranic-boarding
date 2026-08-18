from datetime import datetime
from .. import db

class FeeInvoice(db.Model):
    __tablename__ = 'fee_invoices'

    id = db.Column(db.Integer, primary_key=True)
    invoice_number = db.Column(db.String(50), unique=True, nullable=False) # e.g. INV-2026-001
    student_id = db.Column(db.Integer, db.ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    academic_term = db.Column(db.String(50))
    academic_year = db.Column(db.String(20))
    period_type = db.Column(db.String(20), default='Term') # Term, Month
    period_value = db.Column(db.String(50), default='Term 1') # Term 1, January, etc.

    tuition_fee = db.Column(db.Float, default=0.0)
    boarding_fee = db.Column(db.Float, default=0.0)
    feeding_fee = db.Column(db.Float, default=0.0)
    uniform_fee = db.Column(db.Float, default=0.0)
    transport_fee = db.Column(db.Float, default=0.0)
    books_fee = db.Column(db.Float, default=0.0)
    discount_scholarship = db.Column(db.Float, default=0.0)
    total_amount = db.Column(db.Float, nullable=False)
    amount_paid = db.Column(db.Float, default=0.0)
    status = db.Column(db.String(20), default='Unpaid') # Paid, Partial, Unpaid, Overdue
    due_date = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_edited_by = db.Column(db.String(150))
    last_edited_at = db.Column(db.DateTime)

    student = db.relationship('Student', backref=db.backref('invoices', lazy='dynamic'))

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def to_dict(self):
        return {
            'id': self.id,
            'invoice_number': self.invoice_number,
            'student_id': self.student_id,
            'student_name': self.student.user.full_name if self.student and self.student.user else None,
            'academic_term': self.academic_term,
            'academic_year': self.academic_year,
            'period_type': self.period_type,
            'period_value': self.period_value,
            'tuition_fee': self.tuition_fee,
            'uniform_fee': self.uniform_fee,
            'transport_fee': self.transport_fee,
            'books_fee': self.books_fee,
            'discount_scholarship': self.discount_scholarship,
            'boarding_fee': self.boarding_fee,
            'feeding_fee': self.feeding_fee,
            'total_amount': self.total_amount,
            'amount_paid': self.amount_paid,
            'balance_due': self.total_amount - self.amount_paid,
            'status': self.status,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'created_at': self.created_at.isoformat(),
            'last_edited_by': self.last_edited_by,
            'last_edited_at': self.last_edited_at.isoformat() if self.last_edited_at else None
        }

class FeePayment(db.Model):
    __tablename__ = 'fee_payments'

    id = db.Column(db.Integer, primary_key=True)
    receipt_number = db.Column(db.String(50), unique=True, nullable=False)
    invoice_id = db.Column(db.Integer, db.ForeignKey('fee_invoices.id', ondelete='CASCADE'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    payment_method = db.Column(db.String(50)) # Bank Transfer, Credit Card, Cash, Online Gateway
    transaction_reference = db.Column(db.String(100))
    payment_date = db.Column(db.DateTime, default=datetime.utcnow)

    invoice = db.relationship('FeeInvoice', backref=db.backref('payments', lazy='dynamic'))

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

class Payroll(db.Model):
    __tablename__ = 'payrolls'

    id = db.Column(db.Integer, primary_key=True)
    staff_user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    month_year = db.Column(db.String(20), nullable=False) # e.g. 2026-07
    basic_salary = db.Column(db.Float, nullable=False)
    allowances = db.Column(db.Float, default=0.0)
    deductions = db.Column(db.Float, default=0.0)
    taxes = db.Column(db.Float, default=0.0)
    net_salary = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='Pending') # Pending, Paid
    payment_date = db.Column(db.Date)

    staff = db.relationship('User', backref=db.backref('payrolls', lazy='dynamic'))

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

class Donation(db.Model):
    __tablename__ = 'donations'

    id = db.Column(db.Integer, primary_key=True)
    donor_name = db.Column(db.String(150), default='Anonymous')
    donor_email = db.Column(db.String(120))
    donor_phone = db.Column(db.String(30))
    amount = db.Column(db.Float, nullable=False)
    purpose = db.Column(db.String(100), default='General Sadaqah / Zakat') # Hifz Scholarship, Mosque Building, Food Fund
    payment_reference = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_edited_by = db.Column(db.String(150))
    last_edited_at = db.Column(db.DateTime)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

class Expense(db.Model):
    __tablename__ = 'expenses'

    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(100), nullable=False) # Kitchen Supplies, Maintenance, Salaries, Utilities
    description = db.Column(db.Text, nullable=False)
    amount = db.Column(db.Float, nullable=False)
    expense_date = db.Column(db.Date, default=datetime.utcnow)
    recorded_by_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'))
    last_edited_by = db.Column(db.String(150))
    last_edited_at = db.Column(db.DateTime)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
