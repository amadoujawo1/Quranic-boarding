import os
from datetime import date, datetime

import pytest
from app import create_app, db
from app.models.admission import AdmissionApplication
from app.models.finance import FeeInvoice, Donation, Expense
from app.models.quran import HifzProgress
from app.models.student import Student
from app.models.user import User, Role

@pytest.fixture
def app():
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    
    with app.app_context():
        db.create_all()
        # Seed test role if not already present
        role = Role.query.filter_by(name='Super Administrator').first()
        if not role:
            role = Role(name='Super Administrator')
            db.session.add(role)
            db.session.commit()
        yield app
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()


def test_create_app_initializes_database_and_seed_user(tmp_path):
    db_path = tmp_path / 'startup.db'
    os.environ['DATABASE_URL'] = f'sqlite:///{db_path}'

    app = create_app()
    app.config['TESTING'] = True

    with app.app_context():
        from app.models.user import User
        assert User.query.count() >= 1


def test_user_creation(app):
    with app.app_context():
        u = User(username='testadmin', email='admin@test.com', full_name='Test Admin')
        u.set_password('Pass123!')
        db.session.add(u)
        db.session.commit()

        fetched = User.query.filter_by(username='testadmin').first()
        assert fetched is not None
        assert fetched.check_password('Pass123!') is True
        assert fetched.check_password('WrongPass') is False

def test_login_api(client, app):
    with app.app_context():
        u = User(username='apiuser', email='api@test.com', full_name='API User')
        u.set_password('Secret123!')
        db.session.add(u)
        db.session.commit()

    res = client.post('/api/auth/login', json={
        'username': 'apiuser',
        'password': 'Secret123!'
    })
    assert res.status_code == 200
    data = res.get_json()
    assert 'access_token' in data
    assert data['user']['username'] == 'apiuser'


def test_invoice_creation_uses_tuition_only_for_total(client, app):
    with app.app_context():
        user = User(username='financeuser', email='finance@test.com', full_name='Finance User')
        user.set_password('Secret123!')
        db.session.add(user)
        db.session.flush()

        student = Student(
            user_id=user.id,
            student_id_number='QBS-TEST-001',
            date_of_birth=date(2008, 1, 1),
            gender='Male',
        )
        db.session.add(student)
        db.session.commit()

    login_res = client.post('/api/auth/login', json={
        'username': 'financeuser',
        'password': 'Secret123!'
    })
    token = login_res.get_json()['access_token']

    res = client.post('/api/finance/invoices', headers={'Authorization': f'Bearer {token}'}, json={
        'invoice_number': 'INV-TEST-001',
        'student_id': 1,
        'tuition_fee': 1200,
        'boarding_fee': 800,
        'feeding_fee': 500,
        'due_date': '2026-09-30'
    })

    assert res.status_code == 201
    data = res.get_json()
    assert data['total_amount'] == 1200.0


def test_invoice_list_normalizes_old_boarding_and_feeding_values(client, app):
    with app.app_context():
        user = User(username='financecleanuser', email='financeclean@test.com', full_name='Finance Cleaner')
        user.set_password('Secret123!')
        db.session.add(user)
        db.session.flush()

        student = Student(
            user_id=user.id,
            student_id_number='QBS-TEST-003',
            date_of_birth=date(2008, 3, 3),
            gender='Male',
        )
        db.session.add(student)
        db.session.flush()

        db.session.add(FeeInvoice(
            invoice_number='INV-CLEAN-001',
            student_id=student.id,
            academic_term='Term 1',
            academic_year='2026/2027',
            tuition_fee=1200.0,
            boarding_fee=800.0,
            feeding_fee=500.0,
            total_amount=2500.0,
            due_date=date(2026, 9, 1),
            amount_paid=0.0,
            status='Unpaid'
        ))
        db.session.commit()

    login_res = client.post('/api/auth/login', json={
        'username': 'financecleanuser',
        'password': 'Secret123!'
    })
    token = login_res.get_json()['access_token']

    res = client.get('/api/finance/invoices', headers={'Authorization': f'Bearer {token}'})

    assert res.status_code == 200
    data = res.get_json()
    assert len(data) >= 1
    clean_inv = next((inv for inv in data if inv.get('invoice_number') == 'INV-CLEAN-001'), None)
    assert clean_inv is not None
    assert clean_inv['boarding_fee'] == 0.0
    assert clean_inv['feeding_fee'] == 0.0
    assert clean_inv['total_amount'] == 1200.0


def test_dashboard_returns_recent_activity_from_live_records(client, app):
    with app.app_context():
        user = User(username='dashboarduser', email='dashboard@test.com', full_name='Dashboard User')
        user.set_password('Secret123!')
        db.session.add(user)
        db.session.flush()

        student = Student(
            user_id=user.id,
            student_id_number='QBS-TEST-002',
            date_of_birth=date(2008, 2, 2),
            gender='Male',
        )
        db.session.add(student)
        db.session.flush()

        db.session.add(HifzProgress(
            student_id=student.id,
            date=date(2026, 8, 1),
            sabaq_surah='Al-Fatiha',
            sabaq_start_page=1,
            sabaq_end_page=5,
            sabaq_grade='A+'
        ))
        db.session.add(FeeInvoice(
            invoice_number='INV-DASH-001',
            student_id=student.id,
            academic_term='Term 1',
            academic_year='2026/2027',
            tuition_fee=1000.0,
            total_amount=1000.0,
            due_date=date(2026, 9, 1),
            amount_paid=1000.0
        ))
        db.session.add(Donation(donor_name='Test Donor', amount=500.0, purpose='Hifz Scholarship'))
        db.session.add(Expense(description='Books', amount=150.0, category='Education', expense_date=date(2026, 8, 2)))
        db.session.commit()

    login_res = client.post('/api/auth/login', json={
        'username': 'dashboarduser',
        'password': 'Secret123!'
    })
    token = login_res.get_json()['access_token']

    res = client.get('/api/dashboard/admin-stats', headers={'Authorization': f'Bearer {token}'})

    assert res.status_code == 200
    data = res.get_json()
    assert data['overview']['total_students'] >= 1
    assert 'recent_activity' in data
    assert isinstance(data['recent_activity'], list)


def test_enrolment_process(client, app):
    with app.app_context():
        admin = User(username='enroladmin', email='enroladmin@test.com', full_name='Enrol Admin')
        admin.set_password('Secret123!')
        db.session.add(admin)
        db.session.commit()

        application = AdmissionApplication(
            application_number='APP-TEST-999',
            full_name='Child Applicant',
            date_of_birth=date(2015, 1, 1),
            gender='Male',
            guardian_name='Guardian',
            guardian_phone='1234567',
            guardian_email='guardian@example.com',
            status='Accepted',
        )
        db.session.add(application)
        db.session.commit()
        application_id = application.id

    login_res = client.post('/api/auth/login', json={
        'username': 'enroladmin',
        'password': 'Secret123!'
    })
    token = login_res.get_json()['access_token']

    res = client.post(f'/api/admissions/{application_id}/enrol', headers={'Authorization': f'Bearer {token}'})

    assert res.status_code in (200, 201)

