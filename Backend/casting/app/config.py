import os
import urllib
from dotenv import load_dotenv

load_dotenv()
class Config:
    
    username = os.getenv('MONGO_USERNAME', '')
    password = os.getenv('MONGO_PASSWORD', '')

    if username and password:
        username = urllib.parse.quote_plus(username)
        password = urllib.parse.quote_plus(password)
        MONGO_URI = f'mongodb+srv://{username}:{password}@cluster0.mp7jz.mongodb.net/authdb?retryWrites=true&w=majority&appName=Cluster0'
    else:
        raise ValueError("MongoDB credentials not set. Please set MONGO_USERNAME and MONGO_PASSWORD environment variables.")
    

    JWT_SECRET_KEY = os.getenv('JWT_SECRET')