from flask import Flask, request, jsonify, Blueprint
import hashlib
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, get_jwt
from pymongo import MongoClient
import json
from config import mongo

app_routes = Blueprint('app_routes', __name__)

@app_routes.route('/verify-payment' , methods = ['POST'])
def verify_payment():
    jti = get_jwt()["jti"]  # Get JWT ID
    username = get_jwt_identity

    if username:
            # Find the user's subscription in MongoDB and update it
            mongo.db.users.update_one(
                {"username": username},  # Match the user by their unique username
                {"$set": {"subscription_status": "paid"}}  # Update subscription status
            )
            return jsonify({"status": "success", "message": "Payment verified and subscription updated"})
    else:
        return jsonify({"status": "error", "message": "Invalid or expired JWT token"})