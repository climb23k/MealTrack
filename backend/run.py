#!/usr/bin/env python3
import os
import sys

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app, db

# Create tables
with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run()
