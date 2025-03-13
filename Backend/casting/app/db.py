from flask_pymongo import PyMongo
from app.config import Config
from flask import current_app

mongo = PyMongo()
 
def init_db(app):
    mongo.init_app(app)
    print("MongoDB URI:", app.config["MONGO_URI"])

    try:
        mongo.db.command("ping")
        print("MongoDb connected successfully")
 
    except Exception as e:
        print(f"MongoDB connection error: {str(e)}")