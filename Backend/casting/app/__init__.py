from flask import Flask
from flask_jwt_extended import JWTManager
from app.config import Config, mail
from app.db import init_db
from app.config import Config
from dotenv import load_dotenv
from flask_cors import CORS
from app.db import mongo
 
load_dotenv()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    jwt = JWTManager(app)
 
    init_db(app)
    mail.init_app(app)
    CORS(app)
    
    from app.routes import main
    app.register_blueprint(main)
   
    return app