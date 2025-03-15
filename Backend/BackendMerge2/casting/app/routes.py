from flask import Blueprint, jsonify, request
from extensions import mongo
from bson import ObjectId
from flask_jwt_extended import get_jwt_identity, jwt_required, create_access_token
import logging
from functools import wraps

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
ch = logging.StreamHandler()
ch.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
ch.setFormatter(formatter)
logger.addHandler(ch)

casting_route = Blueprint('casting', __name__)

def serial_user(user):
    return{
        'first_name': user['first_name'],
        'last_name': user['last_name'],
        'email': user.get('email', 'N/A'),
        'ffr_results': user.get('ffr_results', 'N/A'),
    }

def get_user():
    username = get_jwt_identity()
    
    user = mongo.db.users.find_one({'username': username})
    if not user:
        return None, {'error': 'User not found'}, 404
    
    return user

def serial_ffr_result(result):
    """
    Serialize FFR result to a dictionary
    """
    return {
        'FFR_pic': result.get('FFR_pic', 'N/A'),
        'facial_metrics': result.get('facial_metrics', {}),
        'comparison_data': result.get('comparison_data', []),
        'Graphs_and_Images': result.get('Graphs_and_Images', [])
    }


# @main.route('/login', methods=['POST'])
# def login():
#     print(request.json)
#     username = request.json.get('username')
#     if not username: 
#         return jsonify({"error":"Missing Username"}), 400

#     user = mongo.db.users.find_one({'username':username})
#     if not user: 
#         return jsonify({'error':'user not found'}), 404

#     access_token = create_access_token(identity=str(user['_id']))
#     return jsonify(access_token=access_token), 200

@casting_route.route('/users/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        user = get_user()
        
        logger.info(f"User data retrieved: {user}")

        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get FFR results from the user document
        ffr_results = user.get('ffr_results', [])
        
        # Serialize FFR results
        serialized_ffr_results = [serial_ffr_result(result) for result in ffr_results]
        
        # If no FFR results found
        if not serialized_ffr_results:
            return jsonify({
                'user': {
                    'first_name': user.get('first_name', 'N/A'),
                    'last_name': user.get('last_name', 'N/A'),
                    'email': user.get('email', 'N/A'),
                    'profile_picture': user.get('profile_picture', 'N/A')
                },
                'ffr_results': [],
                'message': 'No FFR results found for this user'
            }), 200
        
        # Return user profile with FFR results
        return jsonify({
            'user': {
                'first_name': user.get('first_name', 'N/A'),
                'last_name': user.get('last_name', 'N/A'),
                'email': user.get('email', 'N/A'),
                'profile_picture': user.get('profile_picture', 'N/A')
            },
            'ffr_results': serialized_ffr_results
        }), 200

    except Exception as e:
        logger.error(f'Error fetching user profile and FFR results: {str(e)}')
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500
    

# @main.route('/send-email', methods=['POST'])
# @jwt_required()
# def send_mail_route():
#     try:
#         user, error_response, status_code = get_user()
#         if error_response:
#             return jsonify(error_response), status_code
         
#         data = request.json
#         receive_mail = data.get('receive_mail')
#         msg_text = data.get('message', '')
 
#         if not receive_mail:
#             return jsonify({"error": "Recipient email is required"}), 400
 
#         response, status_code = send_mail(user, receive_mail, msg_text)
#         return jsonify(response), status_code
 
#     except Exception as e:
#         logger.error(f'Error sending email: {str(e)}')
#         return jsonify({'error': f'Internal server error: {str(e)}'}), 500
    
# @main.route('/submit-form', methods=['POST'])
# def submit_form():
#     try:
         
#         form_data = request.json
#         logger.info(f"Received form data: {form_data}")
         
        
#         if not form_data:
#             return jsonify({"error": "No form data received"}), 400
         
#         user_data = {
#             'first_name': form_data.get('first_name', ''),
#             'last_name': form_data.get('last_name', ''),
#             'email': form_data.get('email', ''),
#             'ffr_results': form_data.get('ffr_results', 'N/A')
#         }
         
#         message = form_data.get('message', '')
         
#         recipient_email = form_data.get('recipient_email', 'default-recipient@example.com')
 
#         response, status_code = send_mail(user_data, recipient_email, message)
         
#         return jsonify(response), status_code
         
#     except Exception as e:
#         logger.error(f"Error processing form submission: {str(e)}")
#         return jsonify({"error": f"Server error: {str(e)}"}), 500