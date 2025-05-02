FROM python:3.11-slim

WORKDIR /app

# Copy application code first
COPY . /app/

# Install the package in development mode
RUN pip install -e .

ENV FLASK_APP=mealtrack.app
ENV FLASK_ENV=production

EXPOSE 8000

# Debug: show installed packages and try importing mealtrack
RUN pip freeze && \
    python -c "import mealtrack; print('mealtrack package found!')"

CMD ["gunicorn", "mealtrack:app", "--bind", "0.0.0.0:8000"]
