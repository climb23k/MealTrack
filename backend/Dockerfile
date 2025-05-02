FROM python:3.11-slim

WORKDIR /app

RUN echo 'Flask==3.0.0\nFlask-SQLAlchemy==3.1.1\nFlask-Cors==4.0.0\npython-dotenv==1.0.0\ngunicorn==21.2.0\npsycopg2-binary==2.9.9\nPyJWT==2.8.0\nPillow==10.0.0\npython-dateutil==2.8.2\nrequests==2.31.0' > requirements.txt

RUN pip install -r requirements.txt

COPY . .

ENV FLASK_APP=app.py
ENV FLASK_ENV=production

EXPOSE 8000

ENV PYTHONPATH=/app
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "app:wsgi_app"]
