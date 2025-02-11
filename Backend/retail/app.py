from flask import Flask, request, jsonify, redirect
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from flask_pymongo import PyMongo
import stripe

app = Flask(__name__)

# MongoDB Configuration
app.config['mongo_uri'] = 'mongodb://localhost:27017/dbname'  # Remember to replace this with the proper link to db later
mongo = PyMongo(app)


if __name__ == '__main__':
    app.run(debug=True)