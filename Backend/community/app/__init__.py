from flask import Flask
from flask_jwt_extended import JWTManager
from flask_pymongo import PyMongo
from .config import MONGO_URI
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

app.config['JWT_SECRET_KEY'] = 'JWT_SECRET' 
jwt = JWTManager(app)

app.config['MONGO_URI'] = MONGO_URI
mongo = PyMongo(app)

from . import routes
