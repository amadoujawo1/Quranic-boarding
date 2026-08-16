from datetime import datetime
import csv
import io
from flask import request
from flask_restx import Namespace, Resource
from flask_jwt_extended import jwt_required
from .. import db
from ..models.student import Student, Parent, MedicalRecord, StudentDocument, Alumni
from ..models.user import User, Role

students_ns = Namespace('students', description='Student Admission and Profile Management')

def _create_student_from_row(data: dict) -> dict:
    """Shared helper: create one student from a flat data dict. Returns result dict."""
    full_name    = (data.get('full_name') or '').strip()
    parent_name  = (data.get('parent_name') or '').strip()
    parent_phone = (data.get('parent_phone') or '').strip()
    parent_rel   = (data.get('parent_relationship') or 'Guardian').strip()
    gender       = (data.get('gender') or 'Male').strip()
    dob          = (data.get('date_of_birth') or '').strip()
    student_id   = (data.get('student_id_number') or '').strip()
    email        = (data.get('email') or '').strip()
    phone        = (data.get('phone') or '').strip()

    if not full_name:
        return {'ok': False, 'error': 'full_name is required'}

    # Auto-generate ID/email if missing
    existing_count = Student.query.count()
    if not student_id:
        student_id = f"QBS-{datetime.utcnow().year}-{existing_count + 1:03d}"
    if not email:
        email = f"std_{student_id.replace(' ', '_')}@qbsms.edu"

    username = f"std_{student_id.replace(' ', '_')}"

    if User.query.filter((User.username == username) | (User.email == email)).first():
        return {'ok': False, 'error': f'Username/email already exists for {full_name}'}

    user = User(username=username, email=email, full_name=full_name, phone=phone)
    user.set_password('Student123!')
    role = Role.query.filter_by(name='Student').first()
    if role:
        user.roles.append(role)
    db.session.add(user)
    db.session.flush()

    # Resolve or create parent
    parent_id = None
    if parent_name:
        existing_puser = User.query.filter(User.full_name.ilike(parent_name)).first()
        if existing_puser and existing_puser.parent_profile:
            parent_id = existing_puser.parent_profile.id
        else:
            p_username = f"parent_{int(datetime.utcnow().timestamp())}_{user.id}"
            p_email    = f"{p_username}@qbsms.edu"
            p_user = User(username=p_username, email=p_email, full_name=parent_name, phone=parent_phone)
            p_user.set_password('ParentPass123!')
            p_role = Role.query.filter_by(name='Parent').first()
            if p_role:
                p_user.roles.append(p_role)
            db.session.add(p_user)
            db.session.flush()
            p_profile = Parent(user_id=p_user.id, relationship=parent_rel, emergency_contact=parent_phone)
            db.session.add(p_profile)
            db.session.flush()
            parent_id = p_profile.id

    dob_date = None
    if dob:
        for fmt in ('%Y-%m-%d', '%d/%m/%Y', '%d-%m-%Y', '%m/%d/%Y'):
            try:
                dob_date = datetime.strptime(dob, fmt).date()
                break
            except ValueError:
                pass
    if not dob_date:
        dob_date = datetime.now().date()

    student = Student(
        user_id=user.id,
        student_id_number=student_id,
        date_of_birth=dob_date,
        gender=gender,
        parent_id=parent_id
    )
    db.session.add(student)
    return {'ok': True, 'student_id': student_id, 'name': full_name}

@students_ns.route('')
class StudentList(Resource):
    @jwt_required()
    def get(self):
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', '', type=str)
        status_filter = request.args.get('status', '', type=str)

        query = Student.query.join(User)
        if search:
            query = query.filter((User.full_name.ilike(f'%{search}%')) | (Student.student_id_number.ilike(f'%{search}%')))
        if status_filter:
            query = query.filter(Student.status == status_filter)

        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        return {
            'students': [s.to_dict() for s in pagination.items],
            'total': pagination.total,
            'page': page,
            'pages': pagination.pages
        }, 200

    @jwt_required()
    def post(self):
        data = request.get_json() or {}
        username = data.get('username') or f"std_{data.get('student_id_number')}"
        email = data.get('email')
        full_name = data.get('full_name')
        password = data.get('password', 'Student123!')

        if User.query.filter((User.username == username) | (User.email == email)).first():
            return {'message': 'User with this email or username already exists'}, 400

        user = User(username=username, email=email, full_name=full_name, phone=data.get('phone'))
        user.set_password(password)
        
        role = Role.query.filter_by(name='Student').first()
        if role:
            user.roles.append(role)
        db.session.add(user)
        db.session.flush()

        # Resolve or create Parent profile
        parent_id = data.get('parent_id')
        parent_name = data.get('parent_name')

        if not parent_id and parent_name:
            # Search for existing parent by user full_name
            existing_user = User.query.filter(User.full_name.ilike(parent_name.strip())).first()
            if existing_user and existing_user.parent_profile:
                parent_id = existing_user.parent_profile.id
            else:
                # Create Parent User and Parent Profile
                p_username = f"parent_{int(datetime.utcnow().timestamp())}_{user.id}"
                p_email = f"{p_username}@qbsms.edu"
                p_user = User(
                    username=p_username,
                    email=p_email,
                    full_name=parent_name.strip(),
                    phone=data.get('parent_phone', '')
                )
                p_user.set_password('ParentPass123!')
                p_role = Role.query.filter_by(name='Parent').first()
                if p_role:
                    p_user.roles.append(p_role)
                db.session.add(p_user)
                db.session.flush()

                p_profile = Parent(
                    user_id=p_user.id,
                    relationship=data.get('parent_relationship', 'Guardian'),
                    emergency_contact=data.get('parent_phone', '')
                )
                db.session.add(p_profile)
                db.session.flush()
                parent_id = p_profile.id

        student = Student(
            user_id=user.id,
            student_id_number=data.get('student_id_number'),
            date_of_birth=datetime.strptime(data.get('date_of_birth'), '%Y-%m-%d').date() if data.get('date_of_birth') else datetime.now().date(),
            gender=data.get('gender', 'Male'),
            blood_group=data.get('blood_group'),
            parent_id=parent_id
        )
        db.session.add(student)
        db.session.commit()

        return student.to_dict(), 201

@students_ns.route('/<int:id>')
class StudentDetail(Resource):
    @jwt_required()
    def get(self, id):
        student = Student.query.get_or_404(id)
        return student.to_dict(), 200

    @jwt_required()
    def put(self, id):
        student = Student.query.get_or_404(id)
        data = request.get_json() or {}
        if 'status' in data:
            student.status = data['status']
        if 'blood_group' in data:
            student.blood_group = data['blood_group']
        if 'gender' in data:
            student.gender = data['gender']
        if 'date_of_birth' in data and data['date_of_birth']:
            student.date_of_birth = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
        # Update the linked user's full name
        if 'full_name' in data and student.user:
            student.user.full_name = data['full_name']
        db.session.commit()
        return student.to_dict(), 200

    @jwt_required()
    def delete(self, id):
        student = Student.query.get_or_404(id)
        user = student.user
        db.session.delete(student)
        if user:
            db.session.delete(user)
        db.session.commit()
        return {'message': 'Student deleted successfully'}, 200


@students_ns.route('/import')
class StudentImport(Resource):
    @jwt_required()
    def post(self):
        """Bulk import students from a CSV or XLSX file."""
        if 'file' not in request.files:
            return {'message': 'No file provided. Send a multipart field named "file".'}, 400

        f = request.files['file']
        filename = f.filename.lower()

        rows = []

        if filename.endswith('.csv'):
            try:
                content = f.read().decode('utf-8-sig')  # handle BOM
                reader = csv.DictReader(io.StringIO(content))
                rows = [dict(r) for r in reader]
            except Exception as e:
                return {'message': f'Failed to parse CSV: {str(e)}'}, 400

        elif filename.endswith('.xlsx'):
            try:
                import openpyxl
                wb = openpyxl.load_workbook(f, read_only=True, data_only=True)
                ws = wb.active
                headers = [str(cell.value).strip() if cell.value else '' for cell in next(ws.iter_rows(min_row=1, max_row=1))]
                for row in ws.iter_rows(min_row=2, values_only=True):
                    rows.append({headers[i]: (str(v).strip() if v is not None else '') for i, v in enumerate(row)})
            except Exception as e:
                return {'message': f'Failed to parse XLSX: {str(e)}'}, 400
        else:
            return {'message': 'Unsupported file type. Please upload a .csv or .xlsx file.'}, 400

        if not rows:
            return {'message': 'The file is empty or has no data rows.'}, 400

        results = []
        imported = 0
        failed = 0

        for i, row in enumerate(rows, start=1):
            # Normalize common header variants
            normalized = {}
            for k, v in row.items():
                key = (k or '').lower().strip().replace(' ', '_')
                normalized[key] = v
            try:
                result = _create_student_from_row(normalized)
                if result['ok']:
                    db.session.commit()
                    imported += 1
                    results.append({'row': i, 'status': 'success', 'name': result['name'], 'student_id': result['student_id']})
                else:
                    db.session.rollback()
                    failed += 1
                    results.append({'row': i, 'status': 'error', 'error': result['error']})
            except Exception as e:
                db.session.rollback()
                failed += 1
                results.append({'row': i, 'status': 'error', 'error': str(e)})

        return {
            'summary': {'total': len(rows), 'imported': imported, 'failed': failed},
            'results': results
        }, 200


@students_ns.route('/alumni')
class AlumniList(Resource):
    def get(self):
        """List all Hifz Huffaz Graduates (Alumni)."""
        search = request.args.get('search', '', type=str)
        year = request.args.get('year', type=int)

        query = Alumni.query.join(Student).join(User)

        if search:
            query = query.filter(
                (User.full_name.ilike(f'%{search}%')) |
                (Student.student_id_number.ilike(f'%{search}%')) |
                (Alumni.current_occupation.ilike(f'%{search}%')) |
                (Alumni.higher_education.ilike(f'%{search}%'))
            )
        if year:
            query = query.filter(Alumni.graduation_year == year)

        alumni_records = query.order_by(Alumni.graduation_year.desc(), Alumni.hifz_completion_date.desc()).all()
        return {
            'alumni': [a.to_dict() for a in alumni_records],
            'total': len(alumni_records)
        }, 200

    @jwt_required()
    def post(self):
        """Input and register a new Hifz Huffaz Graduate."""
        data = request.get_json() or {}

        student_id = data.get('student_id')
        full_name = data.get('full_name')

        student = None
        if student_id:
            student = Student.query.get(student_id)

        if not student and full_name:
            existing_user = User.query.filter(User.full_name.ilike(full_name.strip())).first()
            if existing_user and existing_user.student_profile:
                student = existing_user.student_profile
            else:
                ts = int(datetime.utcnow().timestamp())
                std_num = data.get('student_id_number') or f"QBS-GRAD-{ts % 10000:04d}"
                username = f"hafiz_{std_num.replace(' ', '_').lower()}"
                email = data.get('contact_email') or f"{username}@qbsms.edu"

                if User.query.filter((User.username == username) | (User.email == email)).first():
                    username = f"{username}_{ts}"
                    email = f"grad_{ts}@qbsms.edu"

                user = User(username=username, email=email, full_name=full_name.strip(), phone=data.get('phone'))
                user.set_password('HafizPass123!')
                role = Role.query.filter_by(name='Student').first()
                if role:
                    user.roles.append(role)
                db.session.add(user)
                db.session.flush()

                student = Student(
                    user_id=user.id,
                    student_id_number=std_num,
                    date_of_birth=datetime.utcnow().date(),
                    gender=data.get('gender', 'Male'),
                    status='Graduated'
                )
                db.session.add(student)
                db.session.flush()

        if not student:
            return {'message': 'Student ID or valid Full Name is required to input graduate'}, 400

        student.status = 'Graduated'

        grad_year = data.get('graduation_year') or datetime.utcnow().year
        completion_date_str = data.get('hifz_completion_date')
        completion_date = None
        if completion_date_str:
            try:
                completion_date = datetime.strptime(completion_date_str, '%Y-%m-%d').date()
            except ValueError:
                completion_date = datetime.utcnow().date()
        else:
            completion_date = datetime.utcnow().date()

        alumni = Alumni.query.filter_by(student_id=student.id).first()
        if alumni:
            alumni.graduation_year = grad_year
            alumni.hifz_completion_date = completion_date
            alumni.current_occupation = data.get('current_occupation', alumni.current_occupation)
            alumni.higher_education = data.get('higher_education', alumni.higher_education)
            alumni.contact_email = data.get('contact_email', alumni.contact_email)
        else:
            alumni = Alumni(
                student_id=student.id,
                graduation_year=grad_year,
                hifz_completion_date=completion_date,
                current_occupation=data.get('current_occupation', 'Alumni Hafiz'),
                higher_education=data.get('higher_education', 'Higher Islamic & Secular Studies'),
                contact_email=data.get('contact_email', student.user.email if student.user else None)
            )
            db.session.add(alumni)

        db.session.commit()
        return alumni.to_dict(), 201


@students_ns.route('/alumni/<int:id>')
class AlumniDetail(Resource):
    @jwt_required()
    def put(self, id):
        alumni = Alumni.query.get_or_404(id)
        data = request.get_json() or {}

        if 'graduation_year' in data:
            alumni.graduation_year = data['graduation_year']
        if 'hifz_completion_date' in data and data['hifz_completion_date']:
            try:
                alumni.hifz_completion_date = datetime.strptime(data['hifz_completion_date'], '%Y-%m-%d').date()
            except ValueError:
                pass
        if 'current_occupation' in data:
            alumni.current_occupation = data['current_occupation']
        if 'higher_education' in data:
            alumni.higher_education = data['higher_education']
        if 'contact_email' in data:
            alumni.contact_email = data['contact_email']
        if 'full_name' in data and alumni.student and alumni.student.user:
            alumni.student.user.full_name = data['full_name']

        db.session.commit()
        return alumni.to_dict(), 200

    @jwt_required()
    def delete(self, id):
        alumni = Alumni.query.get_or_404(id)
        db.session.delete(alumni)
        db.session.commit()
        return {'message': 'Graduate record removed successfully'}, 200

