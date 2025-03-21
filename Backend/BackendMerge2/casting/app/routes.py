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
import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from werkzeug.utils import secure_filename
from datetime import datetime
import app

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

@casting_route.route('/application/submit', methods=['POST'])
@jwt_required()
def submit_application():
    try:
        # Get user from token
        username = get_jwt_identity()
        user = mongo.db.users.find_one({'username': username})
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get form data
        form_data = {
            'firstName': request.form.get('firstName', ''),
            'lastName': request.form.get('lastName', ''),
            'email': request.form.get('email', ''),
            'phone': request.form.get('phone', ''),
            'age': request.form.get('age', ''),
            'gender': request.form.get('gender', ''),
            'country': request.form.get('country', ''),
            'height': request.form.get('height', ''),
            'bustChest': request.form.get('bustChest', ''),
            'waistHips': request.form.get('waistHips', ''),
            'message': request.form.get('message', '')
        }
        
        # Validate required fields
        required_fields = ['firstName', 'lastName', 'email', 'phone', 'age', 'gender', 'country', 'height', 'bustChest', 'waistHips']
        for field in required_fields:
            if not form_data[field]:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Check if PDF was uploaded
        pdf_file = None
        if 'ffr_results_pdf' in request.files:
            pdf_file = request.files['ffr_results_pdf']
                
        ffr_results = user.get('ffr_results', [])
            
        if not ffr_results:
            logger.warning(f"No FFR results found for user: {username}")
                   
        # Send email with the form data and PDF attachment
        send_application_email(form_data, pdf_file, user)
        
        # Store application in database
        store_application(form_data, user)
        
        return jsonify({'message': 'Application submitted successfully'}), 200
    
    except Exception as e:
        logger.error(f"Error submitting application: {str(e)}")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

def send_application_email(form_data, pdf_file, user):
    """
    Sends an email with application form data and PDF attachment
    """
    try:
        # Email configuration - get these from your app config
        sender_email = app.config.get('EMAIL_SENDER', "lookmaxxofficial@gmail.com")
        receiver_email = app.config.get('EMAIL_RECIPIENTS', ["fred23official.com"])[0]
        password = os.environ.get('EMAIL_PASS')  # Get from environment variable
        
        if not password:
            logger.error("Email password not found in environment variables")
            return False
        
        # Create message
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = receiver_email
        msg['Subject'] = f"New Model Application: {form_data['firstName']} {form_data['lastName']}"
        
        # Email body
        body = f"""
        New Model Application Submission
        
        Applicant Details:
        ------------------
        Name: {form_data['firstName']} {form_data['lastName']}
        Email: {form_data['email']}
        Phone: {form_data['phone']}
        Age: {form_data['age']}
        Gender: {form_data['gender']}
        Country: {form_data['country']}
        
        Model Measurements:
        ------------------
        Height: {form_data['height']}
        Bust/Chest: {form_data['bustChest']}
        Waist/Hips: {form_data['waistHips']}
        
        Additional Message:
        ------------------
        {form_data['message']}
        
        User Account Info:
        ------------------
        Username: {user.get('username', 'N/A')}
        User ID: {str(user.get('_id', 'N/A'))}
        """
        
        msg.attach(MIMEText(body, 'plain'))
        
        # Attach PDF if available
        if pdf_file:
            try:
                # For file-like objects (BytesIO)
                if hasattr(pdf_file, 'read'):
                    pdf_attachment = MIMEApplication(pdf_file.read(), _subtype='pdf')
                    pdf_file.seek(0)  # Reset file pointer
                
                # Add header
                pdf_attachment.add_header('Content-Disposition', 'attachment', 
                                         filename='FFR_Results.pdf')
                msg.attach(pdf_attachment)
                logger.info("PDF attached to email successfully")
            except Exception as e:
                logger.error(f"Error attaching PDF: {str(e)}")
        
        # Get email server settings from config
        email_server = app.config.get('EMAIL_SERVER', 'smtp.gmail.com')
        email_port = app.config.get('EMAIL_PORT', 587)
        
        # Send email
        with smtplib.SMTP(email_server, email_port) as server:
            server.starttls()
            server.login(sender_email, password)
            server.send_message(msg)
            
        logger.info(f"Application email sent successfully for {form_data['firstName']} {form_data['lastName']}")
        return True
    
    except Exception as e:
        logger.error(f"Error sending application email: {str(e)}")
        # Continue with submission even if email fails
        return False

def store_application(form_data, user):
    """
    Stores the application data in the database
    """
    try:
        # Create application record
        application = {
            'user_id': user.get('_id'),
            'username': user.get('username'),
            'submitted_at': datetime.utcnow(),
            'status': 'pending',
            'form_data': form_data
        }
        
        # Insert into applications collection
        mongo.db.applications.insert_one(application)
        
        # Also update user record
        mongo.db.users.update_one(
            {'_id': user.get('_id')},
            {'$push': {'applications': application}}
        )
        
        logger.info(f"Application stored in database for user: {user.get('username')}")
        return True
    
    except Exception as e:
        logger.error(f"Error storing application: {str(e)}")
        return False