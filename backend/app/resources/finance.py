from datetime import datetime, date
from flask import request
from flask_restx import Namespace, Resource
from flask_jwt_extended import jwt_required, get_jwt
from .. import db
from ..models.finance import FeeInvoice, FeePayment, Donation, Expense, StudentPayment
from ..models.student import Student
from ..models.user import User as UserModel

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
    return 'Admin' in roles or 'Super Admin' in roles or 'Super Administrator' in roles

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
            period_type=data.get('period_type', 'Term'),
            period_value=data.get('period_value', 'Term 1'),
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
        if 'period_type' in data: invoice.period_type = data['period_type']
        if 'period_value' in data: invoice.period_value = data['period_value']
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
        # Delete child payment records first to avoid FK constraint errors
        FeePayment.query.filter_by(invoice_id=id).delete()
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


# ══════════════════════════════════════════════════════════════════════════════
# STUDENT MONTHLY PAYMENT MODULE ROUTES
# ══════════════════════════════════════════════════════════════════════════════

def generate_receipt_number():
    """Generates unique receipt number like REC-000123 or REC-YYYY-XXXX"""
    count = StudentPayment.query.count() + 1
    receipt_no = f"REC-{datetime.utcnow().year}-{count:04d}"
    while StudentPayment.query.filter_by(receipt_number=receipt_no).first():
        count += 1
        receipt_no = f"REC-{datetime.utcnow().year}-{count:04d}"
    return receipt_no


@finance_ns.route('/student-payments')
class StudentPaymentList(Resource):
    @jwt_required()
    def get(self):
        query = StudentPayment.query.join(Student, StudentPayment.student_id == Student.id, isouter=True)\
                                    .join(UserModel, Student.user_id == UserModel.id, isouter=True)

        # Query Filters
        student_id = request.args.get('student_id', type=int)
        if student_id:
            query = query.filter(StudentPayment.student_id == student_id)

        academic_year = request.args.get('academic_year')
        if academic_year:
            query = query.filter(StudentPayment.academic_year == academic_year)

        payment_month = request.args.get('payment_month')
        if payment_month and payment_month != 'All':
            query = query.filter(StudentPayment.payment_month.ilike(f'%{payment_month}%'))

        status = request.args.get('status')
        if status and status != 'All':
            query = query.filter(StudentPayment.status == status)

        search = request.args.get('search', '').strip()
        if search:
            search_pattern = f'%{search}%'
            query = query.filter(
                db.or_(
                    UserModel.full_name.ilike(search_pattern),
                    Student.student_id_number.ilike(search_pattern),
                    StudentPayment.receipt_number.ilike(search_pattern),
                    StudentPayment.payment_month.ilike(search_pattern),
                    StudentPayment.class_level.ilike(search_pattern)
                )
            )

        payments = query.order_by(StudentPayment.payment_date.desc(), StudentPayment.id.desc()).all()
        return [p.to_dict() for p in payments], 200

    @jwt_required()
    def post(self):
        data = request.get_json() or {}

        # Resolve student
        student_id = data.get('student_id')
        student_name = (data.get('student_name') or '').strip()
        student_id_num = (data.get('student_id_number') or '').strip()

        student = None
        if student_id:
            student = Student.query.get(student_id)
        elif student_id_num:
            student = Student.query.filter_by(student_id_number=student_id_num).first()
        elif student_name:
            student = (Student.query
                       .join(UserModel, Student.user_id == UserModel.id)
                       .filter(UserModel.full_name.ilike(student_name))
                       .first())

        if not student:
            return {'message': 'Valid student is required. Could not match student.'}, 404

        # Extract payment month and year
        payment_month = (data.get('payment_month') or 'August 2026').strip()
        academic_year = (data.get('academic_year') or '2026/2027').strip()
        class_level = (data.get('class_level') or 'Hifz Level 2').strip()
        fee_type = (data.get('fee_type') or 'Boarding / Tuition / Meals').strip()

        amount_due = float(data.get('amount_due', 2500.0) or 2500.0)
        amount_paid = float(data.get('amount_paid', 0.0) or 0.0)
        payment_method = (data.get('payment_method') or 'Cash').strip()

        receipt_number = (data.get('receipt_number') or '').strip()
        if not receipt_number:
            receipt_number = generate_receipt_number()
        else:
            existing = StudentPayment.query.filter_by(receipt_number=receipt_number).first()
            if existing:
                receipt_number = generate_receipt_number()

        payment_date_val = datetime.utcnow().date()
        if data.get('payment_date'):
            try:
                payment_date_val = datetime.strptime(data['payment_date'], '%Y-%m-%d').date()
            except Exception:
                payment_date_val = datetime.utcnow().date()

        current_user = get_jwt().get('full_name', 'Administrator')

        payment = StudentPayment(
            student_id=student.id,
            academic_year=academic_year,
            payment_month=payment_month,
            class_level=class_level,
            fee_type=fee_type,
            amount_due=amount_due,
            amount_paid=amount_paid,
            payment_date=payment_date_val,
            payment_method=payment_method,
            receipt_number=receipt_number,
            remarks=data.get('remarks', ''),
            recorded_by=current_user
        )
        payment.compute_status()
        db.session.add(payment)
        db.session.commit()
        return payment.to_dict(), 201


@finance_ns.route('/student-payments/<int:id>')
class StudentPaymentItem(Resource):
    @jwt_required()
    def get(self, id):
        payment = StudentPayment.query.get_or_404(id)
        return payment.to_dict(), 200

    @jwt_required()
    def put(self, id):
        if not is_admin():
            return {'message': 'Admin privileges required'}, 403
        payment = StudentPayment.query.get_or_404(id)
        data = request.get_json() or {}

        if 'amount_due' in data:
            payment.amount_due = float(data['amount_due'] or 0.0)
        if 'amount_paid' in data:
            payment.amount_paid = float(data['amount_paid'] or 0.0)
        if 'payment_method' in data:
            payment.payment_method = data['payment_method']
        if 'payment_month' in data:
            payment.payment_month = data['payment_month']
        if 'academic_year' in data:
            payment.academic_year = data['academic_year']
        if 'class_level' in data:
            payment.class_level = data['class_level']
        if 'fee_type' in data:
            payment.fee_type = data['fee_type']
        if 'remarks' in data:
            payment.remarks = data['remarks']
        if 'payment_date' in data and data['payment_date']:
            try:
                payment.payment_date = datetime.strptime(data['payment_date'], '%Y-%m-%d').date()
            except Exception:
                pass

        payment.recorded_by = get_jwt().get('full_name', payment.recorded_by or 'Administrator')
        payment.compute_status()
        db.session.commit()
        return payment.to_dict(), 200

    @jwt_required()
    def delete(self, id):
        if not is_admin():
            return {'message': 'Admin privileges required'}, 403
        payment = StudentPayment.query.get_or_404(id)
        db.session.delete(payment)
        db.session.commit()
        return {'message': 'Student payment record deleted successfully'}, 200


@finance_ns.route('/student-payments/<int:id>/pay')
class StudentPaymentPay(Resource):
    @jwt_required()
    def post(self, id):
        payment = StudentPayment.query.get_or_404(id)
        data = request.get_json() or {}

        pay_add = float(data.get('amount', 0.0) or 0.0)
        if pay_add <= 0:
            return {'message': 'Payment amount must be greater than zero'}, 400

        current_paid = float(payment.amount_paid or 0.0)
        new_paid = current_paid + pay_add
        payment.amount_paid = new_paid

        if data.get('payment_method'):
            payment.payment_method = data['payment_method']
        if data.get('remarks'):
            payment.remarks = f"{payment.remarks or ''} | {data['remarks']}".strip(' | ')
        if data.get('payment_date'):
            try:
                payment.payment_date = datetime.strptime(data['payment_date'], '%Y-%m-%d').date()
            except Exception:
                payment.payment_date = datetime.utcnow().date()
        else:
            payment.payment_date = datetime.utcnow().date()

        payment.recorded_by = get_jwt().get('full_name', 'Administrator')
        payment.compute_status()
        db.session.commit()
        return payment.to_dict(), 200


@finance_ns.route('/student-payments/student/<int:student_id>')
class StudentMonthlyOverview(Resource):
    @jwt_required()
    def get(self, student_id):
        student = Student.query.get_or_404(student_id)
        records = StudentPayment.query.filter_by(student_id=student_id)\
                                      .order_by(StudentPayment.payment_date.asc(), StudentPayment.id.asc()).all()

        total_due = sum(r.amount_due for r in records)
        total_paid = sum(r.amount_paid for r in records)
        balance = total_due - total_paid

        return {
            'student_id': student.id,
            'student_id_number': student.student_id_number,
            'student_name': student.user.full_name if student.user else student.student_id_number,
            'parent_name': student.parent.user.full_name if student.parent and student.parent.user else None,
            'total_due': total_due,
            'total_paid': total_paid,
            'total_balance': max(0.0, balance),
            'records': [r.to_dict() for r in records]
        }, 200


@finance_ns.route('/student-payments/stats')
class StudentPaymentStats(Resource):
    @jwt_required()
    def get(self):
        records = StudentPayment.query.all()
        for r in records:
            r.compute_status()

        total_due = sum(r.amount_due for r in records)
        total_collected = sum(r.amount_paid for r in records)
        outstanding_balance = sum(r.balance for r in records)

        paid_count = sum(1 for r in records if r.status == 'Paid')
        partial_count = sum(1 for r in records if r.status == 'Partial')
        unpaid_count = sum(1 for r in records if r.status == 'Unpaid')

        # Group by month for collection report
        months_dict = {}
        for r in records:
            m = r.payment_month or 'Other'
            if m not in months_dict:
                months_dict[m] = {
                    'month': m,
                    'total_due': 0.0,
                    'total_collected': 0.0,
                    'outstanding': 0.0,
                    'paid_count': 0,
                    'partial_count': 0,
                    'unpaid_count': 0,
                    'total_records': 0
                }
            months_dict[m]['total_due'] += r.amount_due
            months_dict[m]['total_collected'] += r.amount_paid
            months_dict[m]['outstanding'] += r.balance
            months_dict[m]['total_records'] += 1
            if r.status == 'Paid':
                months_dict[m]['paid_count'] += 1
            elif r.status == 'Partial':
                months_dict[m]['partial_count'] += 1
            else:
                months_dict[m]['unpaid_count'] += 1

        monthly_reports = []
        for m_data in months_dict.values():
            rate = round((m_data['total_collected'] / m_data['total_due'] * 100), 1) if m_data['total_due'] > 0 else 0
            m_data['collection_rate'] = rate
            monthly_reports.append(m_data)

        return {
            'total_due': total_due,
            'total_collected': total_collected,
            'outstanding_balance': outstanding_balance,
            'paid_count': paid_count,
            'partial_count': partial_count,
            'unpaid_count': unpaid_count,
            'total_records': len(records),
            'monthly_reports': monthly_reports
        }, 200


@finance_ns.route('/student-payments/generate-month')
class StudentPaymentBatchGenerate(Resource):
    @jwt_required()
    def post(self):
        if not is_admin():
            return {'message': 'Admin privileges required'}, 403

        data = request.get_json() or {}
        payment_month = (data.get('payment_month') or '').strip()
        academic_year = (data.get('academic_year') or '2026/2027').strip()
        amount_due = float(data.get('amount_due', 2500.0) or 2500.0)
        fee_type = (data.get('fee_type') or 'Boarding / Tuition / Meals').strip()
        class_level = (data.get('class_level') or 'All Levels').strip()

        if not payment_month:
            return {'message': 'Payment month is required (e.g. August 2026).'}, 400

        active_students = Student.query.filter_by(status='Active').all()
        created_count = 0
        skipped_count = 0

        for student in active_students:
            # Check if this student already has a record for this month
            existing = StudentPayment.query.filter_by(
                student_id=student.id,
                payment_month=payment_month,
                academic_year=academic_year
            ).first()

            if existing:
                skipped_count += 1
                continue

            receipt_number = generate_receipt_number()
            st_level = class_level if class_level != 'All Levels' else 'Hifz Level 2'

            rec = StudentPayment(
                student_id=student.id,
                academic_year=academic_year,
                payment_month=payment_month,
                class_level=st_level,
                fee_type=fee_type,
                amount_due=amount_due,
                amount_paid=0.0,
                payment_date=datetime.utcnow().date(),
                payment_method='Cash',
                receipt_number=receipt_number,
                status='Unpaid',
                remarks=f'Monthly fee dues generated for {payment_month}',
                recorded_by=get_jwt().get('full_name', 'System Admin')
            )
            rec.compute_status()
            db.session.add(rec)
            db.session.flush() # Ensure receipt uniqueness check in loop
            created_count += 1

        db.session.commit()
        return {
            'message': f'Successfully generated {created_count} monthly payment records for {payment_month}. ({skipped_count} already existed).',
            'created_count': created_count,
            'skipped_count': skipped_count
        }, 201

