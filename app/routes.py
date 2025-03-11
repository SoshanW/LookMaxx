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


app_routes = Blueprint('app_routes', __name__)

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
    
def delete_file_from_s3(username):
    """
    Delete a user's profile picture from S3
    
    :param username: Username of the user whose file to delete
    :return: Boolean indicating success/failure
    """
    filename = f"{username}_profile.jpg"
    s3_path = AWS.S3_PROFILE_PICTURES_PREFIX + filename
    
    try:
        # Delete the file from S3
        s3_client.delete_object(
            Bucket=AWS.S3_BUCKET,
            Key=s3_path
        )
        return True
    except ClientError as e:
        print(f"Error deleting from S3: {e}")
        return False

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
    
    # Delete profile picture from S3 if it exists
    if user.get('profile_picture'):
        delete_success = delete_file_from_s3(username)
        if not delete_success:
            # You can decide whether to fail the whole operation or continue
            print(f"Warning: Failed to delete profile picture for {username}")
    
    # Delete user from database
    result = mongo.db.users.delete_one({'username': username})
    
    if result.deleted_count > 0:
        # Add user's JWT token to blocklist if they're deleting their own account
        if current_user == username:
            jti = get_jwt()["jti"]
            jwt_blocklist.add(jti)
            
        return jsonify({"message": "User successfully deleted"}), 200
    else:
        return jsonify({"error": "Failed to delete user"}), 500