import os
import urllib

class Config:
   
    username = urllib.parse.quote_plus(os.getenv('MONGO_USERNAME', ''))
    password = urllib.parse.quote_plus(os.getenv('MONGO_PASSWORD', ''))
    MONGO_URI = f'mongodb+srv://{username}:{password}@cluster0.mp7jz.mongodb.net/authdb?retryWrites=true&w=majority&appName=Cluster0'

    JWT_SECRET_KEY = os.getenv('JWT_SECRET')

