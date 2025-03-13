import os
import urllib
from dotenv import load_dotenv
from flask_mail import Mail

load_dotenv()
class Config:
    
    SECRET_KEY = os.getenv('SECRET_KEY', '')
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.getenv('EMAIL_USER')  
    MAIL_PASSWORD = os.getenv('EMAIL_PASS')
    MAIL_DEFAULT_SENDER = os.getenv('EMAIL_USER')

    username = os.getenv('MONGO_USERNAME', '')
    password = os.getenv('MONGO_PASSWORD', '')

    if username and password:
        username = urllib.parse.quote_plus(username)
        password = urllib.parse.quote_plus(password)
        MONGO_URI = f'mongodb+srv://{username}:{password}@cluster0.mp7jz.mongodb.net/authdb?retryWrites=true&w=majority&appName=Cluster0'
    else:
        raise ValueError("MongoDB credentials not set. Please set MONGO_USERNAME and MONGO_PASSWORD environment variables.")
    

    JWT_SECRET_KEY = os.getenv('JWT_SECRET')

    mail = Mail()