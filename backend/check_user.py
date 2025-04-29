from app import app, db, User
from datetime import datetime

def check_user():
    with app.app_context():
        # Find user with last name Scott
        user = User.query.filter_by(last_name="Scott").first()
        if user:
            print(f"Found user: Last name={user.last_name}, Birthdate={user.birthdate}")
        else:
            print("No user found with last name Scott")

if __name__ == "__main__":
    check_user()
