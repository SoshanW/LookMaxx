from flask import Blueprint, jsonify, request, send_file
from extensions import mongo
from bson import ObjectId
from flask_jwt_extended import get_jwt_identity, jwt_required, create_access_token
import logging
from functools import wraps
import requests
from io import BytesIO

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
        'Graphs_and_Images': result.get('Graphs_and_Images', []),
        'pdf_url': result.get('pdf_url', None)  # Include pdf_url in serialization
    }

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
        
        latest_result = serial_ffr_result(ffr_results[-1])
        
        # Return user profile with FFR results
        return jsonify({
            'user': {
                'first_name': user.get('first_name', 'N/A'),
                'last_name': user.get('last_name', 'N/A'),
                'email': user.get('email', 'N/A'),
                'profile_picture': user.get('profile_picture', 'N/A')
            },
            'ffr_results': latest_result
        }), 200

    except Exception as e:
        logger.error(f'Error fetching user profile and FFR results: {str(e)}')
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@casting_route.route('/view-pdf/<username>', methods=['GET'])
@jwt_required()
def view_pdf(username):
    try:
        # Get current user
        current_user = get_jwt_identity()
        
        # Find the user
        user = mongo.db.users.find_one({'username': username})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get FFR results from the user document
        ffr_results = user.get('ffr_results', [])
        
        # Log for debugging
        logger.info(f"FFR results for {username}: {ffr_results}")
        
        # If no FFR results found
        if not ffr_results:
            return jsonify({'error': 'No FFR results found for this user'}), 404
        
        # Get the latest result with PDF URL
        latest_result = ffr_results[-1]
        pdf_url = latest_result.get('pdf_url')
        
        logger.info(f"PDF URL found: {pdf_url}")
        
        if not pdf_url:
            return jsonify({'error': 'No PDF report found'}), 404
        
        # Fetch the PDF content
        logger.info(f"Fetching PDF from: {pdf_url}")
        response = requests.get(pdf_url)
        
        if response.status_code != 200:
            logger.error(f"Failed to fetch PDF: Status {response.status_code}")
            return jsonify({'error': 'Failed to fetch PDF'}), 500
        
        # Create a BytesIO object from the response content
        pdf_io = BytesIO(response.content)
        pdf_io.seek(0)  # Reset the file pointer to the beginning
        
        # Return the PDF with headers for inline display
        logger.info("Returning PDF file")
        return send_file(
            pdf_io,
            mimetype='application/pdf',
            as_attachment=False,
            download_name='ffr-report.pdf'
        )
        
    except Exception as e:
        logger.error(f'Error fetching PDF: {str(e)}')
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

