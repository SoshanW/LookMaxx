from flask_pymongo import PyMongo
from flask_jwt_extended import JWTManager

# Initialize extensions without binding to an app
mongo = PyMongo()
jwt = JWTManager()

# JWT token blocklist
jwt_blocklist = set()