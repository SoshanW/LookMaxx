from flask import Flask
from flask_pymongo import PyMongo
from flask_cors import CORS

mongo = PyMongo()

def create_app():
    app = Flask(__name__)
    CORS(app)
    

    app.config.from_object('app.config.Config')
    
    try:
        mongo.init_app(app)
        mongo.db.command('ping')
        print("Successfully connected to MongoDB!")
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        raise e
    
    # Register routes
    from .routes import app_routes
    app.register_blueprint(app_routes)
    
    return app