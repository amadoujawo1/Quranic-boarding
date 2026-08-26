import os
import sys
from app import create_app, db
from app.models.user import User

def init_database():
    """Initialize database with seed data if it's empty."""
    try:
        print("Starting database initialization...")
        print(f"DATABASE_URL: {os.getenv('DATABASE_URL', 'Not set')}")
        
        app = create_app()
        
        with app.app_context():
            # Test database connection
            try:
                db.session.execute(db.text("SELECT 1"))
                print("Database connection successful!")
            except Exception as e:
                print(f"Database connection failed: {e}")
                raise
            
            # Check if database is empty by checking for any users
            user_count = User.query.count()
            print(f"Current user count: {user_count}")
            
            if user_count == 0:
                print("Database is empty. Running seed script...")
                # Import and run seed function
                from seed import seed_database
                seed_database(app)
                print("Database seeded successfully!")
            else:
                print(f"Database already has {user_count} user(s). Skipping seed.")
                
    except Exception as e:
        print(f"Error during database initialization: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    init_database()
