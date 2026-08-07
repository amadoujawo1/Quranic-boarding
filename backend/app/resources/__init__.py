from flask import Blueprint
from flask_restx import Api

api_bp = Blueprint('api', __name__)
api = Api(
    api_bp,
    version='1.0',
    title='Centre for Quranic Memorization API',
    description='Comprehensive RESTful API for managing Academics, Hifz, Boarding, Attendance, Fees & Portals.',
    doc='/docs'
)

# Import and register namespaces
from .auth import auth_ns
from .students import students_ns
from .hifz import hifz_ns
from .academic import academic_ns
from .attendance import attendance_ns
from .boarding import boarding_ns
from .finance import finance_ns
from .dashboard import dashboard_ns
from .admissions import admissions_ns

api.add_namespace(auth_ns, path='/auth')
api.add_namespace(students_ns, path='/students')
api.add_namespace(hifz_ns, path='/hifz')
api.add_namespace(academic_ns, path='/academic')
api.add_namespace(attendance_ns, path='/attendance')
api.add_namespace(boarding_ns, path='/boarding')
api.add_namespace(finance_ns, path='/finance')
api.add_namespace(dashboard_ns, path='/dashboard')
api.add_namespace(admissions_ns, path='/admissions')

# JWT Exception handlers for Flask-RESTX
from jwt.exceptions import PyJWTError, ExpiredSignatureError, InvalidTokenError
from flask_jwt_extended.exceptions import JWTExtendedException, NoAuthorizationError

@api.errorhandler(NoAuthorizationError)
@api.errorhandler(ExpiredSignatureError)
@api.errorhandler(InvalidTokenError)
@api.errorhandler(JWTExtendedException)
@api.errorhandler(PyJWTError)
def handle_jwt_exceptions(error):
    return {'message': str(error) or 'Authentication token invalid or expired'}, 401
