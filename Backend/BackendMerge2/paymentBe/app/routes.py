from flask import Flask, request, jsonify, Blueprint
import hashlib
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, get_jwt
from pymongo import MongoClient
import json
from app.config import mongo
import datetime
from flask import current_app

app_routes = Blueprint('app_routes', __name__)

@app_routes.route('/verify-payment' , methods = ['POST'])
def verify_payment():
    try:
        username = get_jwt_identity()
        jwt_payload = get_jwt() # Get JWT ID
        status_code = request.form.get('status_code')

        user = mongo.db.users.find_one({"username":username})

        if not user :
                return jsonify({
                    "status": "error", 
                    "message": "User not found"
                }), 404
        
        if status_code != '2':
                return jsonify({
                            "status": "error", 
                            "message": "Payment Verification failed"
                        }), 400
            
        # Update the user's subscription status
        result = mongo.db.users.update_one(
                {"username": username},
                {"$set": {
                    "subscription": "paid",
                    "subscription_updated_at": datetime.datetime.utcnow()
                }}
            )
        
        if result.modified_count > 0:
            return jsonify({
                "status": "success", 
                "message": "Subscription updated successfully"
            }), 200
        else:
            return jsonify({
                "status": "error", 
                "message": "Failed to update subscription"
            }), 500
        
    except Exception as e:
        print(f"Payment verification error: {str(e)}")
        
        return jsonify({
            "status": "error", 
            "message": "An unexpected error occurred"
        }), 500