from flask import Flask
from flask_jwt_extended import JWTManager
from flask_pymongo import PyMongo
from .config import MONGO_URI

app = Flask(__name__)

app.config['MONGO_URI'] = MONGO_URI
mongo = PyMongo(app)

from . import routes
