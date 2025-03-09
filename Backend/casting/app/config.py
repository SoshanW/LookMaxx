import os
import urllib
from flask_mail import Mail

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', '')
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.getenv('EMAIL_USER')  
    MAIL_PASSWORD = os.getenv('EMAIL_PASS')
    MAIL_DEFAULT_SENDER = os.getenv('EMAIL_USER')

    username = urllib.parse.quote_plus(os.getenv('MONGO_USERNAME', ''))
    password = urllib.parse.quote_plus(os.getenv('MONGO_PASSWORD', ''))
    MONGO_URI = f'mongodb+srv://{username}:{password}@cluster0.mp7jz.mongodb.net/authdb?retryWrites=true&w=majority&appName=Cluster0'

    JWT_SECRET_KEY = os.getenv('JWT_SECRET')

mail = Mail()
