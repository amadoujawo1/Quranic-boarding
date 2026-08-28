import pytest
from app import create_app, db
from app.models.admission import AdmissionInquiry
from app.models.user import User, Role
from flask_jwt_extended import create_access_token


@pytest.fixture
def app():
    app = create_app()
    app.config.update({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
        'JWT_SECRET_KEY': 'test-secret-key-for-jwt-testing-32b',
        'MAIL_SUPPRESS_SEND': True,
    })

    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


def test_submit_admissions_inquiry_success(client, app):
    payload = {
        'name': 'Fatou Bah',
        'email': 'fatou.bah@example.com',
        'phone': '+220 7891234',
        'message': 'I would like to enroll my 10-year-old son in the Hifz boarding program.'
    }

    res = client.post('/api/admissions/inquiry', json=payload)
    assert res.status_code == 201
    data = res.get_json()
    assert 'inquiry_id' in data
    assert data['recipient'] == 'ousainouss@yahoo.com'

    with app.app_context():
        inquiry = AdmissionInquiry.query.get(data['inquiry_id'])
        assert inquiry is not None
        assert inquiry.name == 'Fatou Bah'
        assert inquiry.email == 'fatou.bah@example.com'
        assert inquiry.phone == '+220 7891234'
        assert inquiry.recipient_email == 'ousainouss@yahoo.com'
        assert inquiry.status == 'New'


def test_submit_admissions_inquiry_missing_fields(client, app):
    payload = {
        'name': 'Fatou Bah',
        # missing email and message
    }

    res = client.post('/api/admissions/inquiry', json=payload)
    assert res.status_code == 400
    data = res.get_json()
    assert 'required' in data['message'].lower()


def test_get_admissions_inquiries_admin_only(client, app):
    with app.app_context():
        inquiry = AdmissionInquiry(
            name='Alieu Jallow',
            email='alieu@example.com',
            message='What are the school fees for 2026/2027?',
            recipient_email='ousainouss@yahoo.com'
        )
        db.session.add(inquiry)

        role = Role.query.filter_by(name='Super Administrator').first()
        if not role:
            role = Role(name='Super Administrator')
            db.session.add(role)
            db.session.flush()

        admin = User(username='admin_inq', email='admin_inq@qbsms.edu', full_name='Admin Inq')
        admin.set_password('AdminPass123!')
        admin.roles.append(role)
        db.session.add(admin)
        db.session.commit()

        token = create_access_token(identity=str(admin.id), additional_claims={'roles': ['Super Administrator']})

    # Unauthenticated should fail
    unauth_res = client.get('/api/admissions/inquiry')
    assert unauth_res.status_code in (401, 422)

    # Authenticated should succeed
    auth_res = client.get('/api/admissions/inquiry', headers={'Authorization': f'Bearer {token}'})
    assert auth_res.status_code == 200
    data = auth_res.get_json()
    assert data['total'] >= 1
    assert data['inquiries'][0]['name'] == 'Alieu Jallow'
