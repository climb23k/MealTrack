FROM python:3.11-slim

WORKDIR /app

# Install dependencies directly
RUN echo 'Flask==3.0.0\nFlask-SQLAlchemy==3.1.1\nFlask-Cors==4.0.0\npython-dotenv==1.0.0\ngunicorn==21.2.0\npsycopg2-binary==2.9.9\nPyJWT==2.8.0\nPillow==10.0.0\npython-dateutil==2.8.2\nrequests==2.31.0' > requirements.txt && \
    pip install -r requirements.txt

# Copy application code
COPY . /app/

ENV FLASK_APP=mealtrack.app
ENV FLASK_ENV=production
ENV PYTHONPATH=/app

EXPOSE 8000

# Debug: show files and Python path
RUN ls -la && echo "PYTHONPATH: $PYTHONPATH" && python -c "import sys; print('\n'.join(sys.path))"

CMD ["gunicorn", "mealtrack:app", "--bind", "0.0.0.0:8000"]
