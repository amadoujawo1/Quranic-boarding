# pylint: disable=unexpected-keyword-arg
from datetime import datetime
from flask import request
# pyrefly: ignore [missing-import]
from flask_restx import Namespace, Resource
from flask_jwt_extended import jwt_required, get_jwt
from .. import db
from ..models.admission import AdmissionApplication
from ..models.student import Student, Parent
from ..models.user import User, Role

admissions_ns = Namespace('admissions', description='Admission Applications & Enrolment Management')

def is_admin():
    claims = get_jwt()
    roles = claims.get('roles', [])
    return 'Admin' in roles or 'Super Admin' in roles or 'Super Administrator' in roles

def _gen_app_number():
    """Generate a unique application reference like APP-2026-00042."""
    count = AdmissionApplication.query.count() + 1
    year = datetime.utcnow().year
    return f"APP-{year}-{count:05d}"


# ── /admissions ────────────────────────────────────────────────────────────────

@admissions_ns.route('')
class AdmissionList(Resource):

    @jwt_required()
    def get(self):
        """List all applications with optional status / search filtering."""
        status  = request.args.get('status', '')
        search  = request.args.get('search', '')
        page    = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)

        q = AdmissionApplication.query
        if status:
            q = q.filter(AdmissionApplication.status == status)
        if search:
            q = q.filter(
                AdmissionApplication.full_name.ilike(f'%{search}%') |
                AdmissionApplication.application_number.ilike(f'%{search}%') |
                AdmissionApplication.guardian_name.ilike(f'%{search}%')
            )
        q = q.order_by(AdmissionApplication.submission_date.desc())
        pagination = q.paginate(page=page, per_page=per_page, error_out=False)

        return {
            'applications': [a.to_dict() for a in pagination.items],
            'total': pagination.total,
            'page': page,
            'pages': pagination.pages,
        }, 200

    def post(self):
        """Submit a new admission application (public – no auth required)."""
        data = request.get_json() or {}
        required = ['full_name', 'date_of_birth', 'gender', 'guardian_name', 'guardian_phone']
        for field in required:
            if not data.get(field):
                return {'message': f'Missing required field: {field}'}, 400

        app_obj = AdmissionApplication(
            application_number   = _gen_app_number(),
            full_name            = data['full_name'],
            date_of_birth        = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date(),
            gender               = data['gender'],
            nationality          = data.get('nationality', 'Gambian'),
            blood_group          = data.get('blood_group'),
            previous_school      = data.get('previous_school'),
            guardian_name        = data['guardian_name'],
            guardian_relationship= data.get('guardian_relationship', 'Father'),
            guardian_phone       = data['guardian_phone'],
            guardian_email       = data.get('guardian_email'),
            guardian_address     = data.get('guardian_address'),
            guardian_occupation  = data.get('guardian_occupation'),
            programme            = data.get('programme', 'Full Hifz Programme'),
            academic_year        = data.get('academic_year', '2026/2027'),
            boarding_required    = data.get('boarding_required', True),
            quran_level          = data.get('quran_level'),
            current_juz          = data.get('current_juz', 0),
            has_previous_hifz    = data.get('has_previous_hifz', False),
            medical_conditions   = data.get('medical_conditions'),
            allergies            = data.get('allergies'),
            special_needs        = data.get('special_needs'),
            status               = 'Pending',
        )
        db.session.add(app_obj)
        db.session.commit()
        return {'message': 'Application submitted successfully', 'application_number': app_obj.application_number, 'id': app_obj.id}, 201


# ── /admissions/<id> ───────────────────────────────────────────────────────────

@admissions_ns.route('/<int:id>')
class AdmissionDetail(Resource):

    @jwt_required()
    def get(self, id):
        app_obj = AdmissionApplication.query.get_or_404(id)
        return app_obj.to_dict(), 200

    @jwt_required()
    def put(self, id):
        """Update status, schedule interview, add notes."""
        app_obj = AdmissionApplication.query.get_or_404(id)
        data = request.get_json() or {}

        updatable = [
            'status', 'interview_date', 'decision_notes',
            'programme', 'academic_year', 'boarding_required',
        ]
        for field in updatable:
            if field in data:
                if field == 'interview_date' and data[field]:
                    setattr(app_obj, field, datetime.strptime(data[field], '%Y-%m-%dT%H:%M'))
                else:
                    setattr(app_obj, field, data[field])

        if data.get('status') in ('Accepted', 'Rejected'):
            app_obj.decision_date = datetime.utcnow()

        # Track who edited the admission record
        claims = get_jwt()
        editor_name = claims.get('full_name', 'Unknown')

        db.session.commit()
        return {**app_obj.to_dict(), 'last_edited_by': editor_name, 'last_edited_at': datetime.utcnow().isoformat()}, 200

    @jwt_required()
    def delete(self, id):
        if not is_admin():
            return {'message': 'Admin privileges required'}, 403
        app_obj = AdmissionApplication.query.get_or_404(id)
        db.session.delete(app_obj)
        db.session.commit()
        return {'message': 'Application deleted'}, 200


# ── /admissions/<id>/enrol ─────────────────────────────────────────────────────

@admissions_ns.route('/<int:id>/enrol')
class AdmissionEnrol(Resource):

    @jwt_required()
    def post(self, id):
        """Convert an Accepted application into an enrolled Student."""
        app_obj = AdmissionApplication.query.get_or_404(id)

        if app_obj.status != 'Accepted':
            return {'message': 'Application must be Accepted before enrolment'}, 400
        if app_obj.student_id:
            return {'message': 'Applicant already enrolled', 'student_id': app_obj.student_id}, 409

        # Auto-generate student identifier without creating a student login account
        year  = datetime.utcnow().year
        count = Student.query.count() + 1
        student_id_number = f"std{year}{count:03d}"

        # Resolve / create Parent profile
        existing_user = User.query.filter(User.full_name.ilike(app_obj.guardian_name.strip())).first()
        if existing_user and existing_user.parent_profile:
            parent_id = existing_user.parent_profile.id
        else:
            p_username = f"parent_{int(datetime.utcnow().timestamp())}"
            p_email    = app_obj.guardian_email or f"{p_username}@qbsms.edu"
            p_user     = User(
                username  = p_username,
                email     = p_email,
                full_name = app_obj.guardian_name,
                phone     = app_obj.guardian_phone,
            )
            p_user.set_password('ParentPass123!')
            p_role = Role.query.filter_by(name='Parent').first()
            if p_role:
                p_user.roles.append(p_role)
            db.session.add(p_user)
            db.session.flush()
            p_profile = Parent()
            p_profile.user_id = p_user.id
            p_profile.relationship = app_obj.guardian_relationship
            p_profile.address = app_obj.guardian_address
            p_profile.occupation = app_obj.guardian_occupation
            # Assign emergency contact separately
            p_profile.emergency_contact = app_obj.guardian_phone
            db.session.add(p_profile)
            db.session.flush()
            parent_id = p_profile.id

        # Create Student profile
        # Create Student profile using attribute assignment to avoid unexpected kw args
        student = Student()
        student.student_id_number = student_id_number
        student.date_of_birth = app_obj.date_of_birth
        student.gender = app_obj.gender
        student.blood_group = app_obj.blood_group
        student.parent_id = parent_id
        db.session.add(student)
        db.session.flush()

        # Update application
        app_obj.status     = 'Enrolled'
        app_obj.student_id = student.id
        db.session.commit()

        return {
            'message': f'{app_obj.full_name} enrolled successfully!',
            'student_id_number': student_id_number,
            'student_id': student.id,
            'student_account_created': False,
        }, 201


# ── /admissions/stats ──────────────────────────────────────────────────────────

@admissions_ns.route('/track')
class AdmissionTrack(Resource):
    def get(self):
        """Track an application by its reference number."""
        application_number = request.args.get('application_number', '').strip()
        if not application_number:
            return {'message': 'application_number query parameter is required'}, 400

        app_obj = AdmissionApplication.query.filter_by(application_number=application_number).first()
        if not app_obj:
            return {'message': 'Application not found'}, 404

        return {
            'id': app_obj.id,
            'application_number': app_obj.application_number,
            'full_name': app_obj.full_name,
            'programme': app_obj.programme,
            'academic_year': app_obj.academic_year,
            'status': app_obj.status,
            'submission_date': app_obj.submission_date.isoformat() if app_obj.submission_date else None,
            'interview_date': app_obj.interview_date.isoformat() if app_obj.interview_date else None,
            'decision_date': app_obj.decision_date.isoformat() if app_obj.decision_date else None,
            'decision_notes': app_obj.decision_notes,
            'guardian_name': app_obj.guardian_name,
            'guardian_email': app_obj.guardian_email,
        }, 200


@admissions_ns.route('/stats')
class AdmissionStats(Resource):
    @jwt_required()
    def get(self):
        statuses = ['Pending', 'Under Review', 'Interview Scheduled', 'Accepted', 'Rejected', 'Enrolled']
        stats = {}
        for s in statuses:
            stats[s] = AdmissionApplication.query.filter_by(status=s).count()
        stats['total'] = AdmissionApplication.query.count()
        return stats, 200
