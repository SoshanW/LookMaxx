from flask import Flask
from flask_jwt_extended import JWTManager
from flask_pymongo import PyMongo
from flask_cors import CORS
from .config import MONGO_URI
import os
from dotenv import load_dotenv
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import logging


logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

load_dotenv()

app = Flask(__name__)

limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"] 
)

app.config['JWT_SECRET_KEY'] = 'JWT_SECRET' 
jwt = JWTManager(app)

app.config['MONGO_URI'] = MONGO_URI
mongo = PyMongo(app)

try:
    
    mongo.db.posts.create_index([('created_at', -1)])
    mongo.db.comments.create_index([('post_id', 1), ('created_at', -1)])
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