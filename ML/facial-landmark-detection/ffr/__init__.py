from flask import Flask
from flask_pymongo import PyMongo
from flask_cors import CORS
from .config import Config  # Updated import path

mongo = PyMongo()

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    # Updated configuration loading
    app.config.from_object(Config)
    
    try:
        mongo.init_app(app)
        mongo.db.command('ping')
        print("Successfully connected to MongoDB!")
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        raise e
    
    # Register routes
    from .routes import ffr_bp  # Import the Blueprint
    app.register_blueprint(ffr_bp)  # Register the Blueprint
    
    return app