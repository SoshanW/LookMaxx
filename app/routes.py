from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from . import mongo
from werkzeug.security import generate_password_hash, check_password_hash
import boto3
import os
from botocore.exceptions import ClientError
from werkzeug.utils import secure_filename
from config import AWS
import datetime
from flask_jwt_extended import create_access_token, JWTManager,jwt_required, get_jwt_identity,get_jwt
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask_cors import CORS

app_routes = Blueprint('app_routes', __name__)
CORS(app_routes)

jwt_blocklist = set()

s3_client = boto3.client(
    's3',
    aws_access_key_id=AWS.AWS_ACCESS_KEY,
    aws_secret_access_key=AWS.AWS_SECRET_ACCESS_KEY,
    region_name=AWS.AWS_REGION
)

def upload_file_to_s3(file, username):
    """
    Upload a file to the S3 bucket
    
    :param file: File to upload
    :param username: Username to create filename with
    :return: S3 URL of the uploaded file
    """
    # Create a filename based on username
    filename = f"{username}_profile.jpg"
    s3_path = AWS.S3_PROFILE_PICTURES_PREFIX + filename
    
    try:
        # Upload the file to S3
        s3_client.upload_fileobj(
            file,
            AWS.S3_BUCKET,
            s3_path,
            ExtraArgs={
                'ContentType': file.content_type
            }
        )
        
        # Generate the URL for the uploaded file
        s3_url = f"s3://{AWS.S3_BUCKET}/{s3_path}"
        return s3_url
    
    except ClientError as e:
        print(f"Error uploading to S3: {e}")
        return None
    
def delete_user_images_from_s3(username):
    """
    Delete all images associated with a user from S3
    
    :param username: Username of the user whose files to delete
    :return: Dictionary with success/failure for each type of image
    """
    result = {
        "profile_deleted": False,
        "ffr_deleted": False,
        "ffr_delete_errors": []
    }
    
    try:
        # 1. Delete profile picture
        profile_filename = f"{username}_profile.jpg"
        profile_path = AWS.S3_PROFILE_PICTURES_PREFIX + profile_filename
        
        # Print debug info for profile path
        print(f"Attempting to delete profile picture at: {profile_path}")
        
        s3_client.delete_object(
            Bucket=AWS.S3_BUCKET,
            Key=profile_path
        )
        result["profile_deleted"] = True
        print(f"Profile picture deletion request sent")
        
        # 2. List all FFR pictures for this user
        ffr_prefix = f"{AWS.S3_FFR_PICTURES_GENERATED}{username}/"
        
        # Print debug info for FFR path
        print(f"Looking for FFR pictures with prefix: {ffr_prefix}")
        
        response = s3_client.list_objects_v2(
            Bucket=AWS.S3_BUCKET,
            Prefix=ffr_prefix
        )
        
        # If there are FFR pictures, delete them
        if 'Contents' in response:
            # Create a list of objects to delete
            objects_to_delete = [{'Key': obj['Key']} for obj in response['Contents']]
            
            print(f"Found {len(objects_to_delete)} FFR pictures to delete")
            
            # Delete all found objects in one batch request
            if objects_to_delete:
                s3_client.delete_objects(
                    Bucket=AWS.S3_BUCKET,
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

@app_routes.route('/')
def home():
    return "Welcome"

@app_routes.route('/signup', methods=['POST'])
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
            'profile_picture' : profile_picture_url
        }
        
        mongo.db.users.insert_one(user)
        return jsonify({"message": "User registered successfully"}), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app_routes.route('/login', methods=['POST']) 
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
                "last_name": user['last_name']
            }
        }), 200
    
    return jsonify({"error": "Invalid username or password"}), 401

@app_routes.route('/logout', methods=['POST'])
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
    
@app_routes.route('/users/<username>', methods=['DELETE'])
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
    
    # Delete all images associated with the user from S3
    delete_results = delete_user_images_from_s3(username)
    
    # Log any errors but continue with user deletion
    if delete_results.get("ffr_delete_errors"):
        print(f"Errors deleting FFR images for {username}: {delete_results['ffr_delete_errors']}")
    
    # Delete user from database
    result = mongo.db.users.delete_one({'username': username})
    
    if result.deleted_count > 0:
        jti = get_jwt()["jti"]
        jwt_blocklist.add(jti)        
        return jsonify({"message": "User successfully deleted"}), 200
    else:
        return jsonify({"error": "Failed to delete user"}), 500
    
# @app_routes.route('/request-password-reset', methods=['POST'])
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

# @app_routes.route('/reset-password', methods=['POST'])
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