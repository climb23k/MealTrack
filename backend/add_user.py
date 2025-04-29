from app import app, db, User
from datetime import datetime
import os

# Set the production database URL
os.environ['DATABASE_URL'] = 'postgres://mealtrack_db_user:Wy7xRVuYZGOdqXMNOlOHPGGZKZnFxhHu@dpg-cnpqo8f109ks73a5kcag-a.oregon-postgres.render.com/mealtrack_db'

def init_db():
    with app.app_context():
        db.create_all()
        print("Database created!")

def add_user():
    with app.app_context():
        # Check if user already exists
        user = User.query.filter_by(
            last_name="Scott",
            birthdate=datetime.strptime("1988-12-26", "%Y-%m-%d").date()
        ).first()
        
        if user:
            print("User already exists!")
            return
        
        # Create new user
        new_user = User(
            last_name="Scott",
            birthdate=datetime.strptime("1988-12-26", "%Y-%m-%d").date()
        )
        db.session.add(new_user)
        db.session.commit()
        print("User added successfully!")

if __name__ == "__main__":
    init_db()
    add_user()
