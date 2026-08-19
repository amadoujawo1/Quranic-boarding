import os
from flask import Flask, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Extensions

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
mail = Mail()
limiter = Limiter(key_func=get_remote_address)


def _safe_add_columns(db):
    """Safely add missing columns to existing tables using raw SQL.

    This is a lightweight migration shim for SQLite/MySQL that handles schema
    changes that db.create_all() cannot apply to existing tables.
    Each ALTER TABLE is wrapped in a try/except so it's idempotent and safe
    to run on every startup.
    """
    migrations = [
        "ALTER TABLE fee_invoices ADD COLUMN period_type VARCHAR(20) DEFAULT 'Term'",
        "ALTER TABLE fee_invoices ADD COLUMN period_value VARCHAR(50) DEFAULT 'Term 1'",
    ]
    with db.engine.connect() as conn:
        for sql in migrations:
            try:
                conn.execute(db.text(sql))
                conn.commit()
            except Exception:
                # Column already exists or other benign error — skip silently
                pass


def create_app():
    """Application factory for the QBSMS backend.

    Config values are read from environment variables. A minimal set includes:
    - DATABASE_URL (e.g. mysql+pymysql://user:pass@db/qbsms)
    - JWT_SECRET_KEY
    - MAIL_SERVER, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD, MAIL_USE_TLS/SSL
    - REDIS_URL (for Celery broker)
    """
    app = Flask(__name__)

    # Basic configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///dev.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'super-secret-key')
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER', 'noreply@example.com')
    app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
    app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'true').lower() == 'true'
    app.config['MAIL_USE_SSL'] = os.getenv('MAIL_USE_SSL', 'false').lower() == 'true'

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    mail.init_app(app)
    limiter.init_app(app)

    # JWT error handlers – return clean JSON instead of crashing with 500
    @jwt.invalid_token_loader
    def invalid_token_callback(error_string):
        return {'message': 'Invalid token', 'error': error_string}, 401

    @jwt.unauthorized_loader
    def missing_token_callback(error_string):
        return {'message': 'Authorization token required', 'error': error_string}, 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_data):
        return {'message': 'Token has expired. Please log in again.'}, 401

    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_data):
        return {'message': 'Token has been revoked.'}, 401

    # Strip malformed "Bearer null" / "Bearer undefined" before JWT processing
    @app.before_request
    def sanitize_auth_header():
        from flask import request, g
        auth = request.headers.get('Authorization', '')
        if auth in ('Bearer null', 'Bearer undefined', 'Bearer'):
            # Remove so flask-jwt-extended sees no token and returns 401 cleanly
            request.environ.pop('HTTP_AUTHORIZATION', None)

    # Initialize database schema and bootstrap default data on first run
    with app.app_context():
        from .models.user import Role, User, UserRole

        db.create_all()

        # ── Schema migration shim ──────────────────────────────────────────────
        # db.create_all() won't add new columns to existing tables.
        # This block safely adds any missing columns after a model update.
        _safe_add_columns(db)

        if not Role.query.first():
            admin_role = Role(name='Super Administrator', description='Full platform access')
            db.session.add(admin_role)
            db.session.flush()
        else:
            admin_role = Role.query.filter_by(name='Super Administrator').first()

        if not User.query.first():
            admin_user = User(
                username='admin',
                email='admin@qbsms.edu',
                full_name='System Administrator',
                phone='+1234567890'
            )
            admin_user.set_password(os.getenv('DEFAULT_ADMIN_PASSWORD', 'AdminPass123!'))
            db.session.add(admin_user)
            db.session.flush()
            db.session.add(UserRole(user_id=admin_user.id, role_id=admin_role.id))

        db.session.commit()

    # Register blueprints
    from .resources import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')

    # Health check endpoint
    @app.route('/health')
    def health_check():
        return {
            'status': 'ok',
            'service': "Imaam Naafi' Centre for Quranic Memorization API",
            'version': '1.0',
            'docs': '/api/docs'
        }, 200

    # Serve the React SPA for all non-API routes
    frontend_dist = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'dist')

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_spa(path):
        if os.path.isdir(frontend_dist):
            file_path = os.path.join(frontend_dist, path)
            if path and os.path.isfile(file_path):
                return send_from_directory(frontend_dist, path)
            return send_from_directory(frontend_dist, 'index.html')
        # No frontend build present — return API info
        return {
            'status': 'ok',
            'service': "Imaam Naafi' Centre for Quranic Memorization API",
            'version': '1.0',
            'docs': '/api/docs'
        }, 200

    return app
