from flask import Flask
from Signup.app.routes import signup_routes, register_jwt_callbacks
from ML.facial_landmark_detection.ffr.routes import ffr_bp
import os
import sys
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import datetime
from extensions import mongo, jwt
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import logging
import urllib.parse

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

def create_unified_app():
    app = Flask(__name__)
    app.config.from_pyfile('configuration.py')

    # Enable CORS
    CORS(app, resources={r"/*": {"origins": "*"}})
    
    # Configure from the root config file using absolute path
    current_dir = os.path.dirname(os.path.abspath(__file__))
    config_path = os.path.join(current_dir, 'configuration.py')
    
    # Check if the config file exists
    if os.path.exists(config_path):
        print(f"Loading configuration from: {config_path}")
        app.config.from_pyfile(config_path)
    else:
        print(f"WARNING: Configuration file not found at: {config_path}")
        # Set some default configurations to prevent crashes
        app.config['SECRET_KEY'] = '96b41565d0018c9e66ff14bf5a9c81b265bde323'
        app.config['MONGO_URI'] = "mongodb+srv://robertshemeshi:FC34K9IcO7uw6DES@cluster0.mp7jz.mongodb.net/authdb?retryWrites=true&w=majority&appName=Cluster0"
        app.config['JWT_SECRET_KEY'] = app.config['SECRET_KEY']
        app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(hours=5)

    # JWT Configuration
    app.config['JWT_SECRET_KEY'] = app.config.get('SECRET_KEY')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = app.config.get('JWT_ACCESS_TOKEN_EXPIRES', datetime.timedelta(hours=5))
    jwt.init_app(app)
    
    # Register JWT callbacks
    register_jwt_callbacks(jwt)
    
    # MongoDB Connection
    try:
        mongo.init_app(app)
        mongo.db.command('ping')
        print("Successfully connected to MongoDB!")
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        raise e

    # Register blueprints
    app.register_blueprint(signup_routes, url_prefix='/auth')
    app.register_blueprint(ffr_bp, url_prefix='/ffr')

    return app

if __name__ == '__main__':
    app = create_unified_app()
    app.run(debug=True)