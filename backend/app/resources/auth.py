from flask import request
from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import (
    create_access_token, create_refresh_token, jwt_required,
    get_jwt_identity, get_jwt
)
import pyotp
from .. import db
from ..models.user import User, Role, UserRole, ActivityLog

auth_ns = Namespace('auth', description='Authentication and Access Control Operations')

login_model = auth_ns.model('LoginInput', {
    'username': fields.String(required=True, example='admin'),
    'password': fields.String(required=True, example='AdminPass123!'),
    'totp_code': fields.String(required=False, example='123456')
})

register_model = auth_ns.model('RegisterInput', {
    'username': fields.String(required=True),
    'email': fields.String(required=True),
    'password': fields.String(required=True),
    'full_name': fields.String(required=True),
    'role': fields.String(required=True, example='Student')
})

role_update_model = auth_ns.model('RoleUpdateInput', {
    'roles': fields.List(fields.String, required=True, example=['Teacher', 'Admin'])
})

@auth_ns.route('/login')
class Login(Resource):
    @auth_ns.expect(login_model)
    def post(self):
        data = request.get_json() or {}
        username = data.get('username')
        password = data.get('password')
        totp_code = data.get('totp_code')

        user = User.query.filter((User.username == username) | (User.email == username)).first()
        if not user or not user.check_password(password):
            return {'message': 'Invalid username or password'}, 401

        if not user.is_active:
            return {'message': 'User account is deactivated'}, 403

        if user.is_2fa_enabled:
            if not totp_code:
                return {'message': '2FA code required', 'requires_2fa': True}, 402
            totp = pyotp.TOTP(user.totp_secret)
            if not totp.verify(totp_code):
                return {'message': 'Invalid 2FA code'}, 401

        # Generate tokens with roles
        roles = [r.name for r in user.roles]
        additional_claims = {'roles': roles, 'user_id': user.id, 'full_name': user.full_name}
        access_token = create_access_token(identity=user.username, additional_claims=additional_claims)
        refresh_token = create_refresh_token(identity=user.username, additional_claims=additional_claims)

        # Log activity
        log = ActivityLog(user_id=user.id, action='Login Successful', ip_address=request.remote_addr)
        db.session.add(log)
        db.session.commit()

        return {
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict()
        }, 200

@auth_ns.route('/users')
class UsersList(Resource):
    @jwt_required()
    def get(self):
        # Exclude users whose roles are exclusively Student or Parent —
        # those are managed via Student Management, not Users & Roles.
        excluded_roles = {'Student', 'Parent'}
        all_users = User.query.order_by(User.created_at.desc()).all()
        users = [
            u for u in all_users
            if not u.roles or not set(r.name for r in u.roles).issubset(excluded_roles)
        ]
        return [u.to_dict() for u in users], 200

@auth_ns.route('/register')
class Register(Resource):
    @auth_ns.expect(register_model)
    def post(self):
        data = request.get_json() or {}
        username = data.get('username')
        email = data.get('email')
        
        if User.query.filter_by(username=username).first() or User.query.filter_by(email=email).first():
            return {'message': 'Username or email already exists'}, 400

        user = User(
            username=username,
            email=email,
            full_name=data.get('full_name')
        )
        user.set_password(data.get('password'))
        
        db.session.add(user)
        db.session.flush() # To get user ID

        # Assign Role
        role_name = data.get('role', 'Student')
        role = Role.query.filter_by(name=role_name).first()
        if not role:
            role = Role(name=role_name, description=f'{role_name} privileges')
            db.session.add(role)
            db.session.flush()
        
        ur = UserRole(user_id=user.id, role_id=role.id)
        db.session.add(ur)
        db.session.commit()

        return user.to_dict(), 201

@auth_ns.route('/users/<int:user_id>')
class UserResource(Resource):
    @jwt_required()
    def delete(self, user_id):
        identity = get_jwt_identity()
        current_user = User.query.filter_by(username=identity).first()
        if current_user and current_user.id == user_id:
            return {'message': 'You cannot delete your own account'}, 400

        user = User.query.get_or_404(user_id)

        # Remove FK-constrained child records first
        UserRole.query.filter_by(user_id=user.id).delete()
        ActivityLog.query.filter_by(user_id=user.id).delete()

        db.session.delete(user)
        db.session.commit()
        return {'message': 'User deleted successfully'}, 200

@auth_ns.route('/users/<int:user_id>/roles')
class UserRolesResource(Resource):
    @auth_ns.expect(role_update_model)
    @jwt_required()
    def put(self, user_id):
        user = User.query.get_or_404(user_id)
        data = request.get_json() or {}
        new_roles = data.get('roles', [])

        # Remove existing roles
        UserRole.query.filter_by(user_id=user.id).delete()

        # Add new roles
        for role_name in new_roles:
            role = Role.query.filter_by(name=role_name).first()
            if not role:
                role = Role(name=role_name, description=f'{role_name} privileges')
                db.session.add(role)
                db.session.flush()
            ur = UserRole(user_id=user.id, role_id=role.id)
            db.session.add(ur)

        db.session.commit()
        return user.to_dict(), 200


@auth_ns.route('/refresh')
class Refresh(Resource):
    @jwt_required(refresh=True)
    def post(self):
        identity = get_jwt_identity()
        user = User.query.filter_by(username=identity).first()
        if not user:
            return {'message': 'User not found'}, 404
        
        roles = [r.name for r in user.roles]
        additional_claims = {'roles': roles, 'user_id': user.id, 'full_name': user.full_name}
        access_token = create_access_token(identity=user.username, additional_claims=additional_claims)
        return {'access_token': access_token}, 200

@auth_ns.route('/me')
class UserProfile(Resource):
    @jwt_required()
    def get(self):
        identity = get_jwt_identity()
        user = User.query.filter_by(username=identity).first()
        if not user:
            return {'message': 'User not found'}, 404
        return user.to_dict(), 200

@auth_ns.route('/enable-2fa')
class Enable2FA(Resource):
    @jwt_required()
    def post(self):
        identity = get_jwt_identity()
        user = User.query.filter_by(username=identity).first()
        if not user:
            return {'message': 'User not found'}, 404

        secret = pyotp.random_base32()
        user.totp_secret = secret
        totp = pyotp.TOTP(secret)
        provisioning_uri = totp.provisioning_uri(name=user.email, issuer_name="QBSMS Boarding School")
        
        db.session.commit()
        return {
            'secret': secret,
            'qr_uri': provisioning_uri
        }, 200
