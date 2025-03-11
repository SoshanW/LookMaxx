from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from . import mongo
from werkzeug.security import generate_password_hash, check_password_hash
import base64
from config import AWS
import boto3

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
    email = request.form.get('email')
    password = request.form.get('password')
    profile_picture = request.files.get('profile_picture')

    #image storing and conversion of image to base64 string
    encoded_image = base64.b64encode(profile_picture.read()).decode('utf-8')
    
    # Check if username or email already exists
    if mongo.db.users.find_one({'$or': [{'username': username}, {'email': email}]}):
        return jsonify({"error": "Username or email already exists"}), 400
    
    try:
        user = {
            'username': username,
            'first_name': first_name,
            'last_name': last_name,
            'email': email,
            'password': generate_password_hash(password),  
            'profile_picture' : encoded_image
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
        return jsonify({
            "message": "Login successful",
            "user": {
                "username": user['username'],
                "email": user['email'],
                "first_name": user['first_name'],
                "last_name": user['last_name']
            }
        }), 200
    
    return jsonify({"error": "Invalid username or password"}), 401

@app_routes.route('/welcome')
def welcome():
    return render_template('welcome.html')

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