# MealTrack

A simple meal logging and health tracking app focused on estimated calorie intake, confidence levels, and post-meal glucose monitoring.

## Features

- Simple authentication (last name + birthdate)
- Meal logging with photos
- Calorie and protein tracking
- Confidence level tracking for meal estimates
- Glucose monitoring integration
- Daily intake visualization
- Apple Health integration
- Offline support

## Project Structure

```
MealTrack/
├── backend/           # Flask API
│   ├── app.py        # Main application file
│   └── requirements.txt
└── mobile/           # React Native mobile app
```

## Backend Setup

1. Create a virtual environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the development server:
   ```bash
   python app.py
   ```

## Mobile App Setup

(Coming soon)

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with last name and birthdate

### Meals
- `GET /api/meals` - Get all meals
- `GET /api/meals?date=YYYY-MM-DD` - Get meals for a specific date
- `POST /api/meals` - Add a new meal
- `POST /api/meals/:id/glucose` - Add glucose reading for a meal

### Stats
- `GET /api/stats/daily` - Get daily statistics

## Deployment

The backend can be easily deployed to various platforms:

1. Render
2. Railway
3. Google App Engine
4. AWS Elastic Beanstalk

Detailed deployment instructions coming soon.

## Contributing

This is a personal project. Feel free to fork and modify for your own use.
