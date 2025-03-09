from flask import Blueprint, jsonify, request
from app.db import mongo
from bson import ObjectId
from flask_jwt_extended import get_jwt_identity, jwt_required, create_access_token
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
ch = logging.StreamHandler()
ch.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
ch.setFormatter(formatter)
logger.addHandler(ch)

main = Blueprint('main', __name__)

def serial_user(user):
    return{
        'first_name': user['first_name'],
        'last_name': user['last_name'],
        'email': user.get('email', 'N/A'),
        'ffr_results': user.get('ffr_results', 'N/A'),
    }

@main.route('/login', methods=['POST'])
def login():
    print(request.json)
    username = request.json.get('username')
    if not username: 
        return jsonify({"error":"Missing Username"}), 400
    
    user = mongo.db.users.find_one({'username':username})
    if not user: 
        return jsonify({'error':'user not found'}), 404
    
    access_token = create_access_token(identity=str(user['_id']))
    return jsonify(access_token=access_token), 200


@main.route('/users/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        user_id = get_jwt_identity()
        print(f"User ID from JWT: {user_id}")

        if not ObjectId.is_valid(user_id):
            return jsonify({'error':'Invalid user ID'}), 400
        
        user = mongo.db.users.find_one({'_id': ObjectId(user_id)}, { 'password':0})
        logger.info(f"User data retrieved: {user}")
        
        if not user:
            return jsonify({'error': 'User not found'}), 404

        return jsonify({'user': serial_user(user)}), 200
    
    except Exception as e:
        logger.error(f'Error fetching user profile: {str(e)}')
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500