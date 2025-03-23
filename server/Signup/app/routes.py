from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from extensions import mongo, jwt_blocklist
from werkzeug.security import generate_password_hash, check_password_hash
import boto3
import os
from botocore.exceptions import ClientError
from werkzeug.utils import secure_filename
import datetime
from flask_jwt_extended import create_access_token, JWTManager, jwt_required, get_jwt_identity, get_jwt
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask_cors import CORS

signup_routes = Blueprint('signup', __name__)

# AWS client initialized with environment variables first, then fallback to config
def get_s3_client():
    """Get S3 client with configuration from environment variables or app config"""
    from flask import current_app
    
    aws_access_key = os.environ.get('AWS_ACCESS_KEY', current_app.config.get('AWS_ACCESS_KEY'))
    aws_secret_key = os.environ.get('AWS_SECRET_ACCESS_KEY', current_app.config.get('AWS_SECRET_ACCESS_KEY'))
    aws_region = os.environ.get('AWS_REGION', current_app.config.get('AWS_REGION'))
    
    return boto3.client(
        's3',
        aws_access_key_id=aws_access_key,
        aws_secret_access_key=aws_secret_key,
        region_name=aws_region
    )

def s3_uri_to_url(s3_uri):
    """
    Convert S3 URI to public HTTPS URL
    
    :param s3_uri: S3 URI in format s3://bucket-name/path/to/object
    :return: HTTPS URL
    """
    from flask import current_app
    
    if not s3_uri or not s3_uri.startswith('s3://'):
        return None
    
    parts = s3_uri[5:].split('/', 1)
    if len(parts) != 2:
        return None
    
    bucket, key = parts
    # Use environment variable first, then fall back to config
    region = os.environ.get('AWS_REGION', current_app.config.get('AWS_REGION'))
    
    if region == 'us-east-1':
        url = f"https://{bucket}.s3.amazonaws.com/{key}"
    else:
        url = f"https://{bucket}.s3.{region}.amazonaws.com/{key}"
    
    return url

def upload_file_to_s3(file, username):
    """
    Upload a file to the S3 bucket
    
    :param file: File to upload
    :param username: Username to create filename with
    :return: HTTPS URL of the uploaded file (not S3 URI)
    """
    from flask import current_app
    
    filename = f"{username}_profile.jpg"
    s3_prefix = os.environ.get('S3_PROFILE_PICTURES_PREFIX', current_app.config.get('S3_PROFILE_PICTURES_PREFIX'))
    s3_path = s3_prefix + filename
    s3_client = get_s3_client()
    s3_bucket = os.environ.get('S3_BUCKET', current_app.config.get('S3_BUCKET'))
    
    try:
        s3_client.upload_fileobj(
            file,
            s3_bucket,
            s3_path,
            ExtraArgs={
                'ContentType': file.content_type
            }
        )
        
        s3_uri = f"s3://{s3_bucket}/{s3_path}"
        https_url = s3_uri_to_url(s3_uri)
        
        return https_url
    
    except ClientError as e:
        print(f"Error uploading to S3: {e}")
        return None
    
def delete_user_images_from_s3(username):
    """
    Delete all images associated with a user from S3
    
    :param username: Username of the user whose files to delete
    :return: Dictionary with success/failure for each type of image
    """
    from flask import current_app
    
    result = {
        "profile_deleted": False,
        "comparison_deleted": False,
        "ffr_upload_deleted": False,
        "ffr_deleted": False,
        "ffr_delete_errors": []
    }
    
    s3_client = get_s3_client()
    s3_bucket = os.environ.get('S3_BUCKET', current_app.config.get('S3_BUCKET'))
    profile_prefix = os.environ.get('S3_PROFILE_PICTURES_PREFIX', current_app.config.get('S3_PROFILE_PICTURES_PREFIX'))
    ffr_upload_prefix = os.environ.get('S3_FFR_PICTURES_UPLOAD', current_app.config.get('S3_FFR_PICTURES_UPLOAD'))
    ffr_generated_prefix = os.environ.get('S3_FFR_PICTURES_GENERATED', current_app.config.get('S3_FFR_PICTURES_GENERATED'))
    
    try:
        # DELETING PROFILE PIC
        profile_filename = f"{username}_profile.jpg"
        profile_path = profile_prefix + profile_filename
        
        print(f"Attempting to delete profile picture at: {profile_path}")
        
        try:
            s3_client.delete_object(
                Bucket=s3_bucket,
                Key=profile_path
            )
            result["profile_deleted"] = True
            print(f"Profile picture deletion request sent for: {profile_path}")
        except ClientError as e:
            print(f"Error in first deletion attempt: {str(e)}")
            
            # If first approach fails, try listing objects
            if not result["profile_deleted"]:
                print("Trying alternative approach - listing objects with profile picture prefix")
                try:
                    prefix = f"{profile_prefix}{username}"
                    response = s3_client.list_objects_v2(
                        Bucket=s3_bucket,
                        Prefix=prefix
                    )
                    
                    if 'Contents' in response:
                        profile_objects = [obj for obj in response['Contents'] if "profile" in obj['Key'].lower()]
                        
                        if profile_objects:
                            for obj in profile_objects:
                                s3_client.delete_object(
                                    Bucket=s3_bucket,
                                    Key=obj['Key']
                                )
                                print(f"Deleted profile picture with key: {obj['Key']}")
                            
                            result["profile_deleted"] = True
                        else:
                            print(f"No comparison graph found for prefix: {prefix}")
                    else:
                        print(f"No objects found for prefix: {prefix}")
                except ClientError as e:
                    print(f"Error in second deletion attempt: {str(e)}")

        # DELETING FFR UPLOAD PIC
        ffr_upload_filename = f"{username}_ffr.jpg"
        ffr_upload_path = ffr_upload_prefix + ffr_upload_filename
        
        print(f"Attempting to delete profile picture at: {ffr_upload_path}")
        
        try:
            s3_client.delete_object(
                Bucket=s3_bucket,
                Key=ffr_upload_path
            )
            result["ffr_upload_deleted"] = True
            print(f"Profile picture deletion request sent for: {ffr_upload_path}")
        except ClientError as e:
            print(f"Error in first deletion attempt: {str(e)}")

        # DELETING COMPARISON REPORT PIC
        comparison_filename = f"{username}_comparison_report.png"  
        comparison_path = ffr_generated_prefix + comparison_filename
        
        print(f"Attempting to delete profile picture at: {comparison_path}")
        
        try:
            s3_client.delete_object(
                Bucket=s3_bucket,
                Key=comparison_path
            )
            result["comparison_deleted"] = True
            print(f"Comparison report picture deletion request sent for: {comparison_path}")
        except ClientError as e:
            print(f"Error in first deletion attempt: {str(e)}")
        
        # DELETING FFR PIC GENERATED PIC
        ffr_prefix = f"{ffr_generated_prefix}{username}/"
        
        print(f"Looking for FFR pictures with prefix: {ffr_prefix}")
        
        response = s3_client.list_objects_v2(
            Bucket=s3_bucket,
            Prefix=ffr_prefix
        )
        
        # If there are FFR pictures, delete them
        if 'Contents' in response:
            objects_to_delete = [{'Key': obj['Key']} for obj in response['Contents']]
            
            print(f"Found {len(objects_to_delete)} FFR pictures to delete")
            
            if objects_to_delete:
                s3_client.delete_objects(
                    Bucket=s3_bucket,
                    Delete={'Objects': objects_to_delete}
                )
                result["ffr_deleted"] = True
                print(f"FFR pictures deletion request sent")
            else:
                print("No FFR pictures found to delete")
        else:
            print(f"No FFR pictures found for user {username}")
                
    except ClientError as e:
        error_msg = f"Error deleting from S3: {e}"
        print(error_msg)
        result["ffr_delete_errors"].append(str(e))
    
    return result

def delete_user_pdf_from_s3(username):
    """
    Delete PDF reports associated with a username from S3
    
    :param username: Username whose PDF reports should be deleted
    :return: Dictionary with success/failure status
    """
    from flask import current_app
    
    result = {
        "pdf_deleted": False,
    }
    
    s3_client = get_s3_client()
    s3_bucket = os.environ.get('S3_BUCKET', current_app.config.get('S3_BUCKET'))
    base_prefix = os.environ.get('S3_FFR_PDF_UPLOAD', current_app.config.get('S3_FFR_PDF_UPLOAD'))
    
    print(f"Attempting to delete PDF reports for user: {username}")
    
    try:
        # Try multiple possible prefixes to account for different folder structures
        prefixes_to_try = [
            base_prefix + f"{username}_report_",
            base_prefix + "/" + f"{username}_report_",
            base_prefix + f"/{username}_report_"
        ]
        
        files_deleted = 0
        
        for prefix in prefixes_to_try:
            print(f"Searching with prefix: {prefix}")
            
            response = s3_client.list_objects_v2(
                Bucket=s3_bucket,
                Prefix=prefix
            )
            
            if 'Contents' in response:
                for obj in response['Contents']:
                    s3_client.delete_object(
                        Bucket=s3_bucket,
                        Key=obj['Key']
                    )
                    print(f"Deleted PDF: {obj['Key']}")
                    files_deleted += 1
        
        # Also try listing all objects in the folder and filter by username
        full_folder_response = s3_client.list_objects_v2(
            Bucket=s3_bucket,
            Prefix=base_prefix
        )
        
        if 'Contents' in full_folder_response:
            for obj in full_folder_response['Contents']:
                if username.lower() in obj['Key'].lower() and obj['Key'].lower().endswith('.pdf'):
                    s3_client.delete_object(
                        Bucket=s3_bucket,
                        Key=obj['Key']
                    )
                    print(f"Deleted PDF using pattern matching: {obj['Key']}")
                    files_deleted += 1
        
        if files_deleted > 0:
            result["pdf_deleted"] = True
            print(f"Successfully deleted {files_deleted} PDF file(s) for user: {username}")
        else:
            print(f"No PDF files found for user: {username}")
            
    except ClientError as e:
        print(f"Error deleting PDF: {str(e)}")
    
    return result

@signup_routes.route('/')
def home():
    return "Welcome"

@signup_routes.route('/signup', methods=['POST'])
def signup():
    username = request.form.get('username')
    first_name = request.form.get('firstName')
    last_name = request.form.get('lastName')
    gender = request.form.get('gender')
    email = request.form.get('email')
    password = request.form.get('password')
    profile_picture = request.files.get('profile_picture')
    
    # Check if username or email already exists
    if mongo.db.users.find_one({'$or': [{'username': username}, {'email': email}]}):
        return jsonify({"error": "Username or email already exists"}), 400
    
    try:
        profile_picture_url = None
        if profile_picture and profile_picture.filename:
            # Reset file pointer to the beginning (in case it was previously read)
            profile_picture.seek(0)
            
            # Upload to S3
            profile_picture_url = upload_file_to_s3(profile_picture, username)
            if not profile_picture_url:
                return jsonify({"error": "Failed to upload profile picture"}), 500
            
        user = {
            'username': username,
            'first_name': first_name,
            'last_name': last_name,
            'gender':gender,
            'email': email,
            'password': generate_password_hash(password),  
            'profile_picture': profile_picture_url,
            'subscription': 'regular'
        }
        
        mongo.db.users.insert_one(user)
        return jsonify({"message": "User registered successfully"}), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@signup_routes.route('/login', methods=['POST']) 
def login():
    username = request.form.get('username')
    password = request.form.get('password')
    
    user = mongo.db.users.find_one({'username': username})
    
    if user and check_password_hash(user['password'], password):
        access_token = create_access_token(
            identity=str(user['username']),
            additional_claims={
                "first_name":user['first_name'],
                "email":user['email']
            }
        )
        return jsonify({
            "message": "Login successful",
            "access_token": access_token,
            "user": {
                "username": user['username'],
                "email": user['email'],
                "first_name": user['first_name'],
                "last_name": user['last_name'],
                "profile_picture": user.get('profile_picture'), 
                "gender": user.get('gender', ''),  
                "subscription": user.get('subscription', 'regular')  
            }
        }), 200
    
    return jsonify({"error": "Invalid username or password"}), 401

@signup_routes.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    jti = get_jwt()["jti"]  # Get JWT ID
    jwt_blocklist.add(jti)  # Add token to blocklist
    
    return jsonify({"message": "Successfully logged out"}), 200

# Register JWT blocklist loader
def register_jwt_callbacks(jwt):
    @jwt.token_in_blocklist_loader
    def check_if_token_in_blocklist(jwt_header, jwt_payload):
        return jwt_payload["jti"] in jwt_blocklist
    
@signup_routes.route('/users/<username>', methods=['DELETE'])
@jwt_required()
def delete_user(username):
    # Check if the requesting user is the same as the one to be deleted
    current_user = get_jwt_identity()
    
    # Only allow users to delete their own account or implement admin check
    if current_user != username:
        return jsonify({"error": "Unauthorized to delete this user"}), 403
    
    # Find the user
    user = mongo.db.users.find_one({'username': username})
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # Get the profile picture URL from the user document
    profile_picture = user.get('profile_picture')
    
    # Print user's profile picture URL for debugging
    print(f"User profile picture to delete: {profile_picture}")
    
    # Delete all images associated with the user from S3
    delete_results = delete_user_images_from_s3(username)
    
    # Log any errors but continue with user deletion
    if delete_results.get("ffr_delete_errors"):
        print(f"Errors deleting FFR images for {username}: {delete_results['ffr_delete_errors']}")
    
    # Delete user from database
    result = mongo.db.users.delete_one({'username': username})

    # Delete PDF reports associated with the user from S3
    pdf_delete_results = delete_user_pdf_from_s3(username)
    
    # Add PDF deletion results to the overall results
    delete_results.update(pdf_delete_results)
    
    if result.deleted_count > 0:
        jti = get_jwt()["jti"]
        jwt_blocklist.add(jti)
        return jsonify({
            "message": "User successfully deleted",
            "image_deletion_results": delete_results
        }), 200
    else:
        return jsonify({"error": "Failed to delete user"}), 500
    
# @signup_routes.route('/request-password-reset', methods=['POST'])
# def request_password_reset():
#     """
#     Request a password reset by providing the email associated with the account.
#     This generates a reset token and returns it to the frontend to send the email.
#     """
#     email = request.form.get('email')
    
#     # Find user by email
#     user = mongo.db.users.find_one({'email': email})
#     if not user:
#         # Don't reveal whether a user exists or not for security
#         return jsonify({"message": "If your email is registered, you will receive a password reset link"}), 200
    
#     # Generate a unique token
#     reset_token = secrets.token_urlsafe(32)
#     expiration = datetime.datetime.utcnow() + datetime.timedelta(hours=1)  # Token expires in 1 hour
    
#     # Store the token and its expiration directly in the user document
#     mongo.db.users.update_one(
#         {'email': email},
#         {'$set': {
#             'reset_token': reset_token,
#             'reset_token_expires': expiration
#         }}
#     )
    
#     # Return token and user info to the frontend for email sending
#     return jsonify({
#         "status": "success",
#         "token": reset_token,
#         "email": email,
#         "firstName": user.get('first_name', ''),
#         "message": "Reset token generated successfully"
#     }), 200

# @signup_routes.route('/reset-password', methods=['POST'])
# def reset_password():
#     """
#     Reset a user's password using the token received in email
#     """
#     token = request.form.get('token')
#     new_password = request.form.get('password')
    
#     # Validate input
#     if not token or not new_password:
#         return jsonify({"error": "Token and new password are required"}), 400
    
#     # Find user with this token and check if it's not expired
#     user = mongo.db.users.find_one({
#         'reset_token': token,
#         'reset_token_expires': {'$gt': datetime.datetime.utcnow()}  # Check if token is not expired
#     })
    
#     if not user:
#         return jsonify({"error": "Invalid or expired token"}), 400
    
#     # Update user's password and remove the reset token fields
#     result = mongo.db.users.update_one(
#         {'_id': user['_id']},
#         {
#             '$set': {'password': generate_password_hash(new_password)},
#             '$unset': {'reset_token': "", 'reset_token_expires': ""}
#         }
#     )
    
#     if result.modified_count > 0:
#         return jsonify({"message": "Password updated successfully"}), 200
#     else:
#         return jsonify({"error": "Failed to update password"}), 500