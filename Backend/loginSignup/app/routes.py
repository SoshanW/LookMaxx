from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from . import mongo
from werkzeug.security import generate_password_hash, check_password_hash
import base64

app_routes = Blueprint('app_routes', __name__)

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