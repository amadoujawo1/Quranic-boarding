import os
import sys
from app import create_app, db
from app.models.user import User

def init_database():
    """Initialize database with seed data if it's empty."""
    app = create_app()
    
    with app.app_context():
        # Check if database is empty by checking for any users
        user_count = User.query.count()
        
        if user_count == 0:
            print("Database is empty. Running seed script...")
            # Import and run seed function
            from seed import seed_database
            seed_database(app)
            print("Database seeded successfully!")
        else:
            print(f"Database already has {user_count} user(s). Skipping seed.")

if __name__ == '__main__':
    init_database()
