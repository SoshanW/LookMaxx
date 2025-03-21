from flask import Blueprint, jsonify, request, send_file
from flask_cors import CORS
from extensions import mongo
from bson import ObjectId
from flask_jwt_extended import get_jwt_identity, jwt_required, create_access_token
import logging
from functools import wraps
from io import BytesIO
import boto3
from PIL import Image
import requests
from reportlab.lib.utils import ImageReader
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from werkzeug.utils import secure_filename
from datetime import datetime


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

EMAIL_SENDER = os.environ.get('EMAIL_SENDER', "lookmaxxofficial@gmail.com")
EMAIL_RECIPIENTS = os.environ.get('EMAIL_RECIPIENTS', "fred23official.com").split(',')
EMAIL_SERVER = os.environ.get('EMAIL_SERVER', "smtp.gmail.com")
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', "587"))
EMAIL_PASS = os.environ.get('EMAIL_PASS')

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

S3_BUCKET_NAME = "looksci-user-data"
s3_client = boto3.client('s3')

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

        y_position -= 30  # Space before adding images
        pdf.setFont("Helvetica-Bold", 14)
        pdf.drawString(50, y_position, "Graphs and Images:")
        y_position -= 20

        for key, s3_url in latest_result["Graphs_and_Images"].items():
            pdf.setFont("Helvetica", 12)
            pdf.drawString(50, y_position, key)  # Image label
            y_position -= 20

            # Extract object key from S3 URL
            s3_path = s3_url.replace(f"s3://{S3_BUCKET_NAME}/", "")
            try:
                # Download image from S3
                img_data = s3_client.get_object(Bucket=S3_BUCKET_NAME, Key=s3_path)["Body"].read()
                
                # Convert to a format compatible with reportlab
                image = Image.open(BytesIO(img_data))
                img_reader = ImageReader(image)
                
                # Draw image on PDF
                pdf.drawImage(img_reader, 50, y_position - 150, width=200, height=150)
                y_position -= 170  # Adjust y position for next image
            except Exception as e:
                logger.error(f"Error retrieving image {s3_url}: {str(e)}")
                pdf.drawString(50, y_position, "Error loading image")
                y_position -= 20

        pdf.save()
        pdf_buffer.seek(0)

        # Send PDF as response
        response = send_file(
            pdf_buffer, 
            mimetype='application/pdf',
            as_attachment=True, 
            download_name="FFR_Results.pdf"
        )
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"

        return response

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
        sender_email = EMAIL_SENDER
        receiver_email = EMAIL_RECIPIENTS[0]
        password = EMAIL_PASS  
        
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
        email_server = EMAIL_SERVER
        email_port = EMAIL_PORT
        
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