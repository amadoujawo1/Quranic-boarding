from datetime import datetime
from flask import request
from flask_restx import Namespace, Resource
from flask_jwt_extended import jwt_required
from .. import db
from ..models.student import Student, Parent, MedicalRecord, StudentDocument, Alumni
from ..models.user import User, Role

students_ns = Namespace('students', description='Student Admission and Profile Management')

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
        db.session.commit()
        return student.to_dict(), 200
