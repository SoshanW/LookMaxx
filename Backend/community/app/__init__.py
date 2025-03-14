from flask import Flask
from flask_jwt_extended import JWTManager
from flask_pymongo import PyMongo
from flask_cors import CORS
import os
from dotenv import load_dotenv
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import logging
import urllib.parse


logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

load_dotenv()

app = Flask(__name__)

app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET') 
jwt = JWTManager(app)

username = urllib.parse.quote_plus(os.getenv('MONGO_USERNAME', ''))
password = urllib.parse.quote_plus(os.getenv('MONGO_PASSWORD', ''))
app.config['MONGO_URI'] = f'mongodb+srv://{username}:{password}@cluster0.mp7jz.mongodb.net/authdb?retryWrites=true&w=majority&appName=Cluster0'
mongo = PyMongo(app)

limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"] 
)

print("Username:", os.getenv('MONGO_USERNAME'))
print("Password:", os.getenv('MONGO_PASSWORD'))

print("MongoDB URI:", app.config["MONGO_URI"])

try:
    mongo.db.command("ping") 
    print("MongoDB connected successfully")
except Exception as e:
    print(f"MongoDB connection error: {str(e)}")

try:
    mongo.db.users.create_index([('posts.created_on', -1)])
    mongo.db.users.create_index([('posts.id', 1)])
    mongo.db.users.create_index([('comments.id', 1)])
    logger.info("MongoDB indexes created successfully")
except Exception as e:
    logger.error(f"Failed to create MongoDB indexes: {str(e)}")

app.config['ENV'] = os.getenv('ENVIRONMENT', 'production')
CORS(app)

@app.errorhandler(404)
def not_found(error):
    return {'error':'Resource not found'}, 404

@app.errorhandler(500)
def internal_error(error):
    return {'error':'Internal server error'}, 500

from . import routes