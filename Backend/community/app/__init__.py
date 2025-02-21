from flask import Flask
from flask_jwt_extended import JWTManager
from flask_pymongo import PyMongo
from flask_cors import CORS
from .config import MONGO_URI
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

app.config['JWT_SECRET_KEY'] = 'JWT_SECRET' 
jwt = JWTManager(app)

app.config['MONGO_URI'] = MONGO_URI
mongo = PyMongo(app)

app.config['ENV'] = os.getenv('ENVIRONMENT', 'production')
CORS(app)

@app.errorhandler(404)
def not_found(error):
    return {'error':'Resource not found'}, 404

@app.errorhandler(500)
def internal_error(error):
    return {'error':'Internal server error'}, 500
from . import routes
