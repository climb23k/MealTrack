FROM python:3.11-slim

WORKDIR /app

COPY . .
RUN pip install -r requirements.txt

ENV FLASK_APP=app.py
ENV FLASK_ENV=production

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "app:app"]
