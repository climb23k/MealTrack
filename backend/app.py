from flask import Flask, request, jsonify, g
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import jwt
import os
from PIL import Image
import io
import base64
from dateutil.parser import parse

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    'DATABASE_URL',
    'sqlite:///mealtrack.db'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    last_name = db.Column(db.String(100), nullable=False)
    birthdate = db.Column(db.Date, nullable=False)
    meals = db.relationship('Meal', backref='user', lazy=True)

    def generate_token(self):
        return jwt.encode(
            {
                'user_id': self.id,
                'exp': datetime.utcnow() + timedelta(days=30)
            },
            app.config['SECRET_KEY'],
            algorithm='HS256'
        )

class Meal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    image = db.Column(db.LargeBinary)
    calories = db.Column(db.Integer, nullable=False)
    protein = db.Column(db.Integer, nullable=False)
    high_confidence = db.Column(db.Boolean, default=False)
    glucose_readings = db.relationship('GlucoseReading', backref='meal', lazy=True)

class GlucoseReading(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    meal_id = db.Column(db.Integer, db.ForeignKey('meal.id'), nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False)
    value = db.Column(db.Float, nullable=False)

def login_required(f):
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'No token provided'}), 401

        token = auth_header.split(' ')[1]
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            g.user_id = data['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401

        return f(*args, **kwargs)
    return decorated_function

# Routes
@app.route('/api/auth/login', methods=['POST'], endpoint='login')
def login():
    data = request.json
    print(f"Received login data: {data}")
    last_name = data.get('last_name')
    birthdate = data.get('birthdate')

    if not last_name or not birthdate:
        print(f"Missing required fields: last_name={last_name}, birthdate={birthdate}")
        return jsonify({'error': 'Last name and birthdate required'}), 400

    try:
        birthdate_obj = parse(birthdate)
        birthdate = birthdate_obj.date()
        print(f"Parsed birthdate: {birthdate}")
    except ValueError as e:
        print(f"Error parsing birthdate: {e}")
        return jsonify({'error': 'Invalid birthdate format'}), 400

    # Case-insensitive last name comparison
    user = User.query.filter(
        db.func.lower(User.last_name) == last_name.lower(),
        User.birthdate == birthdate
    ).first()
    print(f"Found user: {user}, Searching for last_name={last_name}, birthdate={birthdate}")
    
    if not user:
        return jsonify({'error': 'Invalid credentials'}), 401

    token = user.generate_token()
    return jsonify({'token': token})

@app.route('/api/meals', methods=['GET'], endpoint='get_meals')
@login_required
def get_meals():
    date = request.args.get('date')
    try:
        if date:
            date = parse(date).date()
            meals = Meal.query.filter(
                Meal.user_id == g.user_id,
                db.func.date(Meal.date) == date
            ).order_by(Meal.date.desc()).all()
        else:
            meals = Meal.query.filter_by(user_id=g.user_id).order_by(Meal.date.desc()).all()
    except ValueError:
        return jsonify({'error': 'Invalid date format'}), 400

    meals_data = []
    for meal in meals:
        meal_data = {
            'id': meal.id,
            'date': meal.date.isoformat(),
            'calories': meal.calories,
            'protein': meal.protein,
            'high_confidence': meal.high_confidence,
            'image': base64.b64encode(meal.image).decode('utf-8') if meal.image else None,
            'glucose_readings': [
                {
                    'timestamp': reading.timestamp.isoformat(),
                    'value': reading.value
                }
                for reading in meal.glucose_readings
            ]
        }
        meals_data.append(meal_data)

    return jsonify({'meals': meals_data})

@app.route('/api/meals', methods=['POST'], endpoint='add_meal')
@login_required
def add_meal():
    if 'image' not in request.files and 'image' not in request.form:
        return jsonify({'error': 'Image is required'}), 400

    data = request.form.to_dict()
    
    try:
        calories = int(data.get('calories', 0))
        protein = int(data.get('protein', 0))
    except ValueError:
        return jsonify({'error': 'Invalid calories or protein value'}), 400

    image_data = None
    if 'image' in request.files:
        image_file = request.files['image']
        if image_file:
            # Process and resize image
            img = Image.open(image_file)
            img.thumbnail((800, 800))  # Resize to max 800x800
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format='JPEG')
            image_data = img_byte_arr.getvalue()
    elif 'image' in request.form:
        # Handle base64 encoded image
        try:
            image_data = base64.b64decode(request.form['image'])
        except:
            return jsonify({'error': 'Invalid image data'}), 400

    meal = Meal(
        user_id=g.user_id,
        calories=calories,
        protein=protein,
        high_confidence=data.get('high_confidence', 'false').lower() == 'true',
        image=image_data
    )

    db.session.add(meal)
    db.session.commit()

    return jsonify({
        'id': meal.id,
        'date': meal.date.isoformat(),
        'calories': meal.calories,
        'protein': meal.protein,
        'high_confidence': meal.high_confidence,
        'image': base64.b64encode(meal.image).decode('utf-8') if meal.image else None
    })

@app.route('/api/meals/<int:meal_id>/glucose', methods=['POST'], endpoint='add_glucose_reading')
@login_required
def add_glucose_reading(meal_id):
    meal = Meal.query.filter_by(id=meal_id, user_id=g.user_id).first()
    if not meal:
        return jsonify({'error': 'Meal not found'}), 404

    data = request.json
    if not data or 'timestamp' not in data or 'value' not in data:
        return jsonify({'error': 'Timestamp and value required'}), 400

    try:
        timestamp = parse(data['timestamp'])
        value = float(data['value'])
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid timestamp or value format'}), 400

    reading = GlucoseReading(
        meal_id=meal_id,
        timestamp=timestamp,
        value=value
    )
    db.session.add(reading)
    db.session.commit()

    return jsonify({
        'id': reading.id,
        'timestamp': reading.timestamp.isoformat(),
        'value': reading.value
    })

@app.route('/api/stats/daily', methods=['GET'], endpoint='get_daily_stats')
@login_required
def get_daily_stats():
    date = request.args.get('date')
    try:
        if date:
            date = parse(date).date()
        else:
            date = datetime.utcnow().date()
    except ValueError:
        return jsonify({'error': 'Invalid date format'}), 400

    meals = Meal.query.filter(
        Meal.user_id == g.user_id,
        db.func.date(Meal.date) == date
    ).all()

    high_confidence_calories = sum(
        meal.calories for meal in meals if meal.high_confidence
    )
    low_confidence_calories = sum(
        meal.calories for meal in meals if not meal.high_confidence
    )
    total_protein = sum(meal.protein for meal in meals)

    return jsonify({
        'date': date.isoformat(),
        'high_confidence_calories': high_confidence_calories,
        'low_confidence_calories': low_confidence_calories,
        'total_protein': total_protein
    })

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
