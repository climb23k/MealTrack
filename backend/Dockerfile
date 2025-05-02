FROM python:3.11-slim

WORKDIR /app

# Copy everything at once since we're having issues with individual file copies
COPY . .

# Install dependencies
RUN pip install -r requirements.txt

ENV FLASK_APP=app.py
ENV FLASK_ENV=production
ENV PYTHONPATH=/app

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--chdir", "/app", "app:app"]
