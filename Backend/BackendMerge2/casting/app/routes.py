from flask import Blueprint, jsonify, request, send_file
from flask_cors import CORS
from extensions import mongo
from bson import ObjectId
from flask_jwt_extended import get_jwt_identity, jwt_required, create_access_token
import logging
from functools import wraps
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
ch = logging.StreamHandler()
ch.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
ch.setFormatter(formatter)
logger.addHandler(ch)

casting_route = Blueprint('casting', __name__)
CORS(casting_route, 
     resources={r"/*": {"origins": "http://localhost:5173"}},
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     expose_headers=["Content-Type"])


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

def get_user():
    """ Fetch user from MongoDB """
    username = get_jwt_identity()
    user = mongo.db.users.find_one({'username': username})
    return user

@casting_route.route('/users/ffr-results/pdf', methods=['GET'])
@jwt_required()
def get_ffr_result_pdf():
    try:
        username = get_jwt_identity()
        logger.info(f"FFR PDF requested for user: {username}")

        user = get_user()

        if not user:
            logger.error(f"User not found: {username}")
            return jsonify({'error': 'User not found'}), 404
        
        # Get FFR results from the user document
        ffr_results = user.get('ffr_results', [])
        
        if not ffr_results:
            logger.warning(f"No FFR results found for user: {username}")
            return jsonify({'message': 'No FFR results found for this user'}), 200
        
        latest_result = serial_ffr_result(ffr_results[-1])
        
        # Generate PDF
        pdf_buffer = BytesIO()
        pdf = canvas.Canvas(pdf_buffer, pagesize=letter)
        pdf.setTitle("FFR Analysis Results")

        # Title
        pdf.setFont("Helvetica-Bold", 16)
        pdf.drawString(200, 750, "FFR Analysis Report")

        # User Details
        pdf.setFont("Helvetica", 12)
        pdf.drawString(50, 720, f"Name: {user.get('first_name', 'N/A')} {user.get('last_name', 'N/A')}")
        pdf.drawString(50, 700, f"Email: {user.get('email', 'N/A')}")

        # FFR Metrics
        pdf.setFont("Helvetica-Bold", 14)
        pdf.drawString(50, 670, "Facial Metrics:")
        pdf.setFont("Helvetica", 12)

        y_position = 650
        for key, value in latest_result["facial_metrics"].items():
            pdf.drawString(50, y_position, f"{key}: {value}")
            y_position -= 20

        # Comparison Data
        pdf.setFont("Helvetica-Bold", 14)
        pdf.drawString(50, y_position - 20, "Comparison Data:")
        pdf.setFont("Helvetica", 12)
        y_position -= 40
        for data in latest_result["comparison_data"]:
            pdf.drawString(50, y_position, f"- {data}")
            y_position -= 20

        pdf.save()
        pdf_buffer.seek(0)

        # Send PDF as response
        return send_file(
            pdf_buffer, 
            mimetype='application/pdf',
            as_attachment=True, 
            download_name="FFR_Results.pdf",
            # Cache-Control header to prevent caching issues
            headers={
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": "0"
            }
        )

    except Exception as e:
        logging.error(f"Error generating PDF for JWT identity {get_jwt_identity()}: {str(e)}")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500