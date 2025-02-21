import os
from dotenv import load_dotenv
import urllib.parse

# MongoDB credentials and URI setup
username = os.getenv('MONGO_USERNAME')
password = os.getenv('MONGO_PASSWORD')
encoded_username = urllib.parse.quote_plus(username)
encoded_password = urllib.parse.quote_plus(password)

MONGO_URI = f'mongodb+srv://{encoded_username}:{encoded_password}@cluster0.mp7jz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
