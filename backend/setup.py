from setuptools import setup, find_packages

setup(
    name="mealtrack",
    version="0.1",
    packages=find_packages(),
    install_requires=[
        'Flask==3.0.0',
        'Flask-SQLAlchemy==3.1.1',
        'Flask-Cors==4.0.0',
        'python-dotenv==1.0.0',
        'gunicorn==21.2.0',
        'psycopg2-binary==2.9.9',
        'PyJWT==2.8.0',
        'Pillow==10.0.0',
        'python-dateutil==2.8.2',
        'requests==2.31.0'
    ]
)
