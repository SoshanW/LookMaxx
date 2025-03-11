from flask import Flask
from flask_pymongo import PyMongo
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import datetime

mongo = PyMongo()
jwt= JWTManager()
jwt_blocklist = set()

def create_app():
    app = Flask(__name__)
    CORS(app)
    

    app.config.from_object('app.config.Config')
    app.config['JWT_SECRET_KEY'] = app.config['SECRET_KEY']
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(hours=48)
    jwt.init_app(app)
    
    try:
        mongo.init_app(app)
        mongo.db.command('ping')
        print("Successfully connected to MongoDB!")
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        raise e
    
    @jwt.token_in_blocklist_loader
    def check_if_token_in_blocklist(jwt_header, jwt_payload):
        return jwt_payload["jti"] in jwt_blocklist
    
    # Register routes
    from .routes import app_routes
    app.register_blueprint(app_routes)
    
    return app