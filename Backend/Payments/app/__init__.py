from flask import Flask
from flask_pymongo import PyMongo
from flask_cors import CORS

# Initialize mongo outside of create_app to make it available for import
mongo = PyMongo()

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    # Import config from root level
    app.config.from_object('config.Config')
    
    try:
        mongo.init_app(app)
        mongo.db.command('ping')
        print("Successfully connected to MongoDB!")
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        raise e
    
    # IMPORTANT: Import blueprint after app is created to avoid circular imports
    with app.app_context():
        # Import blueprints inside the function
        from app.app import payment_bp
        app.register_blueprint(payment_bp)
    
    return app