from datetime import datetime
from flask import request
from flask_restx import Namespace, Resource
from flask_jwt_extended import jwt_required, get_jwt
from .. import db
from ..models.finance import FeeInvoice, FeePayment, Donation, Expense

finance_ns = Namespace('finance', description='Tuition, Boarding, Payroll & Financial Records')


def calculate_invoice_total(invoice):
    return (
        invoice.tuition_fee
        + invoice.uniform_fee
        + invoice.transport_fee
        + invoice.books_fee
        - invoice.discount_scholarship
    )


def normalize_invoice(invoice):
    invoice.boarding_fee = 0.0
    invoice.feeding_fee = 0.0
    invoice.total_amount = calculate_invoice_total(invoice)
    if invoice.total_amount < 0:
        invoice.total_amount = 0.0

    paid_amount = invoice.amount_paid or 0.0
    if paid_amount > invoice.total_amount:
        invoice.amount_paid = invoice.total_amount
        paid_amount = invoice.total_amount

    balance = invoice.total_amount - paid_amount
    if balance <= 0:
        invoice.status = 'Paid'
    elif paid_amount > 0:
        invoice.status = 'Partial'
    else:
        invoice.status = 'Unpaid'

    return invoice


def is_admin():
    claims = get_jwt()
    roles = claims.get('roles', [])
    return 'Admin' in roles or 'Super Admin' in roles

@finance_ns.route('/invoices')
class InvoiceList(Resource):
    @jwt_required()
    def get(self):
        invoices = FeeInvoice.query.order_by(FeeInvoice.created_at.desc()).all()
        cleaned_invoices = []
        for invoice in invoices:
            normalized = normalize_invoice(invoice)
            cleaned_invoices.append(normalized)

        if cleaned_invoices:
            db.session.commit()

        return [inv.to_dict() for inv in cleaned_invoices], 200

    @jwt_required()
    def post(self):
        from ..models.student import Student
        from ..models.user import User as UserModel
        data = request.get_json() or {}

        # ── Resolve student ──────────────────────────────────────────────────
        student_id = data.get('student_id')
        student_name = (data.get('student_name') or '').strip()

        if not student_id and student_name:
            # Look up by full name via the joined User table
            match = (Student.query
                     .join(UserModel, Student.user_id == UserModel.id)
                     .filter(UserModel.full_name.ilike(student_name))
                     .first())
            if match:
                student_id = match.id
            else:
                return {'message': f'No student found with name "{student_name}". '
                                   'Please check the name or use the student ID.'}, 404

        if not student_id:
            return {'message': 'student_id or student_name is required.'}, 400

        # ── Auto-generate invoice number if blank ────────────────────────────
        invoice_number = (data.get('invoice_number') or '').strip()
        if not invoice_number:
            count = FeeInvoice.query.count() + 1
            invoice_number = f'INV-{datetime.utcnow().year}-{count:04d}'
            # Ensure uniqueness in case of concurrent inserts
            while FeeInvoice.query.filter_by(invoice_number=invoice_number).first():
                count += 1
                invoice_number = f'INV-{datetime.utcnow().year}-{count:04d}'

        if FeeInvoice.query.filter_by(invoice_number=invoice_number).first():
            return {'message': f'Invoice number "{invoice_number}" already exists.'}, 409

        # ── Fee fields ───────────────────────────────────────────────────────
        tuition_fee          = float(data.get('tuition_fee', 0.0)          or 0.0)
        uniform_fee          = float(data.get('uniform_fee', 0.0)          or 0.0)
        transport_fee        = float(data.get('transport_fee', 0.0)        or 0.0)
        books_fee            = float(data.get('books_fee', 0.0)            or 0.0)
        discount_scholarship = float(data.get('discount_scholarship', 0.0) or 0.0)
        total_amount = data.get('total_amount')
        if total_amount is None:
            total_amount = tuition_fee + uniform_fee + transport_fee + books_fee - discount_scholarship

        inv = FeeInvoice(
            invoice_number=invoice_number,
            student_id=student_id,
            academic_term=data.get('academic_term', 'Term 1'),
            academic_year=data.get('academic_year', '2026/2027'),
            tuition_fee=tuition_fee,
            boarding_fee=0.0,
            feeding_fee=0.0,
            uniform_fee=uniform_fee,
            transport_fee=transport_fee,
            books_fee=books_fee,
            discount_scholarship=discount_scholarship,
            total_amount=float(total_amount),
            due_date=datetime.strptime(data.get('due_date'), '%Y-%m-%d').date() if data.get('due_date') else datetime.utcnow().date()
        )
        normalize_invoice(inv)
        db.session.add(inv)
        db.session.commit()
        return inv.to_dict(), 201

@finance_ns.route('/invoices/<int:id>')
class InvoiceResource(Resource):
    @jwt_required()
    def put(self, id):
        if not is_admin():
            return {'message': 'Admin privileges required'}, 403
        invoice = FeeInvoice.query.get_or_404(id)
        data = request.get_json() or {}
        
        if 'due_date' in data and data['due_date']:
            invoice.due_date = datetime.strptime(data['due_date'], '%Y-%m-%d').date()
        if 'tuition_fee' in data: invoice.tuition_fee = float(data['tuition_fee'])
        if 'boarding_fee' in data: invoice.boarding_fee = 0.0
        if 'feeding_fee' in data: invoice.feeding_fee = 0.0
        if 'uniform_fee' in data: invoice.uniform_fee = float(data['uniform_fee'])
        if 'transport_fee' in data: invoice.transport_fee = float(data['transport_fee'])
        if 'books_fee' in data: invoice.books_fee = float(data['books_fee'])
        if 'discount_scholarship' in data: invoice.discount_scholarship = float(data['discount_scholarship'])
        
        normalize_invoice(invoice)
        balance = invoice.total_amount - (invoice.amount_paid or 0.0)
        
        if balance <= 0:
            invoice.status = 'Paid'
        elif invoice.amount_paid > 0:
            invoice.status = 'Partial'
        else:
            invoice.status = 'Unpaid'
            
        invoice.last_edited_by = get_jwt().get('full_name', 'Unknown Admin')
        invoice.last_edited_at = datetime.utcnow()
            
        db.session.commit()
        return invoice.to_dict(), 200

    @jwt_required()
    def delete(self, id):
        if not is_admin():
            return {'message': 'Admin privileges required'}, 403
        invoice = FeeInvoice.query.get_or_404(id)
        db.session.delete(invoice)
        db.session.commit()
        return {'message': 'Invoice deleted successfully'}, 200

@finance_ns.route('/invoices/<int:id>/pay')
class RecordPayment(Resource):
    @jwt_required()
    def post(self, id):
        invoice = FeeInvoice.query.get_or_404(id)
        data = request.get_json() or {}
        amount = float(data.get('amount', 0))
        if amount <= 0:
            return {'message': 'Payment amount must be greater than zero'}, 400

        payment = FeePayment(
            receipt_number=f'RCP-{datetime.utcnow().strftime("%Y%m%d%H%M%S")}',
            invoice_id=invoice.id,
            amount=amount,
            payment_method=data.get('payment_method', 'Bank Transfer'),
            transaction_reference=data.get('transaction_reference', '')
        )
        db.session.add(payment)

        invoice.amount_paid = (invoice.amount_paid or 0) + amount
        invoice.amount_paid = min(invoice.amount_paid, invoice.total_amount)
        balance = invoice.total_amount - invoice.amount_paid
        if balance <= 0:
            invoice.status = 'Paid'
        elif invoice.amount_paid > 0:
            invoice.status = 'Partial'

        db.session.commit()
        return invoice.to_dict(), 200

@finance_ns.route('/donations')
class DonationList(Resource):
    def get(self):
        donations = Donation.query.order_by(Donation.created_at.desc()).all()
        return [{
            'id': d.id,
            'donor_name': d.donor_name,
            'amount': d.amount,
            'purpose': d.purpose,
            'created_at': d.created_at.isoformat(),
            'last_edited_by': d.last_edited_by,
            'last_edited_at': d.last_edited_at.isoformat() if d.last_edited_at else None
        } for d in donations], 200

    def post(self):
        data = request.get_json() or {}
        d = Donation(
            donor_name=data.get('donor_name', 'Anonymous'),
            donor_email=data.get('donor_email'),
            donor_phone=data.get('donor_phone'),
            amount=float(data.get('amount', 0.0)),
            purpose=data.get('purpose', 'General Sadaqah')
        )
        db.session.add(d)
        db.session.commit()
        return {'message': 'Thank you for your noble donation!', 'id': d.id}, 201

@finance_ns.route('/donations/<int:id>')
class DonationResource(Resource):
    @jwt_required()
    def put(self, id):
        if not is_admin():
            return {'message': 'Admin privileges required'}, 403
        d = Donation.query.get_or_404(id)
        data = request.get_json() or {}
        if 'donor_name' in data: d.donor_name = data['donor_name']
        if 'amount' in data: d.amount = float(data['amount'])
        if 'purpose' in data: d.purpose = data['purpose']
        d.last_edited_by = get_jwt().get('full_name', 'Unknown Admin')
        d.last_edited_at = datetime.utcnow()
        db.session.commit()
        return {'message': 'Donation updated successfully'}, 200

    @jwt_required()
    def delete(self, id):
        if not is_admin():
            return {'message': 'Admin privileges required'}, 403
        d = Donation.query.get_or_404(id)
        db.session.delete(d)
        db.session.commit()
        return {'message': 'Donation deleted successfully'}, 200


@finance_ns.route('/expenses')
class ExpenseList(Resource):
    def get(self):
        expenses = Expense.query.order_by(Expense.expense_date.desc()).all()
        return [{
            'id': e.id,
            'description': e.description,
            'amount': e.amount,
            'category': e.category,
            'expense_date': e.expense_date.isoformat() if e.expense_date else None,
            'last_edited_by': e.last_edited_by,
            'last_edited_at': e.last_edited_at.isoformat() if e.last_edited_at else None
        } for e in expenses], 200

    def post(self):
        data = request.get_json() or {}
        expense = Expense(
            description=data.get('description') or data.get('title') or '',
            amount=float(data.get('amount', 0.0)),
            category=data.get('category', 'General'),
            expense_date=datetime.strptime(data.get('expense_date'), '%Y-%m-%d').date() if data.get('expense_date') else datetime.utcnow().date()
        )
        db.session.add(expense)
        db.session.commit()
        return {'message': 'Expense recorded', 'id': expense.id}, 201

@finance_ns.route('/expenses/<int:id>')
class ExpenseResource(Resource):
    @jwt_required()
    def put(self, id):
        if not is_admin():
            return {'message': 'Admin privileges required'}, 403
        expense = Expense.query.get_or_404(id)
        data = request.get_json() or {}
        if 'description' in data: expense.description = data['description']
        if 'amount' in data: expense.amount = float(data['amount'])
        if 'category' in data: expense.category = data['category']
        if 'expense_date' in data and data['expense_date']:
            expense.expense_date = datetime.strptime(data['expense_date'], '%Y-%m-%d').date()
        expense.last_edited_by = get_jwt().get('full_name', 'Unknown Admin')
        expense.last_edited_at = datetime.utcnow()
        db.session.commit()
        return {'message': 'Expense updated successfully'}, 200

    @jwt_required()
    def delete(self, id):
        if not is_admin():
            return {'message': 'Admin privileges required'}, 403
        expense = Expense.query.get_or_404(id)
        db.session.delete(expense)
        db.session.commit()
        return {'message': 'Expense deleted successfully'}, 200
