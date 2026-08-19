import pytest
from datetime import date
from app import create_app, db
from app.models.user import User, Role
from app.models.student import Student
from app.models.finance import StudentPayment
from flask_jwt_extended import create_access_token


@pytest.fixture
def app():
    app = create_app()
    app.config.update({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
        'JWT_SECRET_KEY': 'super-secret-jwt-key-for-unit-testing-32bytes'
    })

    with app.app_context():
        db.create_all()
        # Clear out any student payments in memory
        StudentPayment.query.delete()
        
        # Setup roles
        admin_role = Role.query.filter_by(name='Super Administrator').first()
        if not admin_role:
            admin_role = Role(name='Super Administrator', description='Admin')
            db.session.add(admin_role)

        student_role = Role.query.filter_by(name='Student').first()
        if not student_role:
            student_role = Role(name='Student', description='Student')
            db.session.add(student_role)
            
        db.session.flush()

        # Admin user
        admin = User.query.filter_by(username='testadmin').first()
        if not admin:
            admin = User(username='testadmin', email='admin@test.com', full_name='Admin Suwaibou')
            admin.set_password('pass123')
            admin.roles.append(admin_role)
            db.session.add(admin)

        # Student user & student
        s_user = User.query.filter_by(username='abdul_jallow').first()
        if not s_user:
            s_user = User(username='abdul_jallow', email='abdul@test.com', full_name='Abdul Rahman Jallow')
            s_user.set_password('pass123')
            s_user.roles.append(student_role)
            db.session.add(s_user)
            db.session.flush()

        student = Student.query.filter_by(student_id_number='INCM-2026-001').first()
        if not student:
            student = Student(
                user_id=s_user.id,
                student_id_number='INCM-2026-001',
                date_of_birth=date(2013, 1, 1),
                gender='Male',
                status='Active'
            )
            db.session.add(student)
            
        db.session.commit()

        yield app

        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def admin_token(app):
    with app.app_context():
        admin = User.query.filter_by(username='testadmin').first()
        return create_access_token(
            identity=str(admin.id),
            additional_claims={'roles': ['Super Administrator'], 'full_name': admin.full_name}
        )


def test_create_and_get_student_payment(client, admin_token):
    headers = {'Authorization': f'Bearer {admin_token}'}

    # 1. Create a payment record for August 2026 (Paid in full)
    res = client.post('/api/finance/student-payments', headers=headers, json={
        'student_id_number': 'INCM-2026-001',
        'payment_month': 'August 2026',
        'academic_year': '2026/2027',
        'class_level': 'Hifz Level 2',
        'fee_type': 'Boarding / Tuition / Meals',
        'amount_due': 2500,
        'amount_paid': 2500,
        'payment_method': 'Cash',
        'receipt_number': 'REC-UNIQUE-001'
    })
    assert res.status_code == 201
    data = res.get_json()
    assert data['student_name'] == 'Abdul Rahman Jallow'
    assert data['amount_due'] == 2500.0
    assert data['amount_paid'] == 2500.0
    assert data['balance'] == 0.0
    assert data['status'] == 'Paid'
    assert data['receipt_number'] == 'REC-UNIQUE-001'

    # 2. Create partial payment for October 2026
    res2 = client.post('/api/finance/student-payments', headers=headers, json={
        'student_id_number': 'INCM-2026-001',
        'payment_month': 'October 2026',
        'amount_due': 2500,
        'amount_paid': 2000,
        'payment_method': 'Bank Transfer'
    })
    assert res2.status_code == 201
    d2 = res2.get_json()
    assert d2['status'] == 'Partial'
    assert d2['balance'] == 500.0
    rec_id = d2['id']

    # 3. Pay remaining balance
    res_pay = client.post(f'/api/finance/student-payments/{rec_id}/pay', headers=headers, json={
        'amount': 500,
        'payment_method': 'Cash',
        'remarks': 'Paid remaining GMD 500'
    })
    assert res_pay.status_code == 200
    d_paid = res_pay.get_json()
    assert d_paid['amount_paid'] == 2500.0
    assert d_paid['balance'] == 0.0
    assert d_paid['status'] == 'Paid'

    # 4. Check stats endpoint
    res_stats = client.get('/api/finance/student-payments/stats', headers=headers)
    assert res_stats.status_code == 200
    stats = res_stats.get_json()
    assert stats['total_due'] == 5000.0
    assert stats['total_collected'] == 5000.0
    assert stats['outstanding_balance'] == 0.0
    assert stats['paid_count'] == 2


def test_batch_generate_dues(client, admin_token):
    headers = {'Authorization': f'Bearer {admin_token}'}

    res = client.post('/api/finance/student-payments/generate-month', headers=headers, json={
        'payment_month': 'September 2026',
        'academic_year': '2026/2027',
        'amount_due': 2500,
        'fee_type': 'Boarding / Tuition / Meals',
        'class_level': 'Hifz Level 2'
    })
    assert res.status_code == 201
    data = res.get_json()
    assert data['created_count'] >= 1
