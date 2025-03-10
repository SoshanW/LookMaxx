from flask import request, jsonify
from flask_jwt_extended import jwt_required, create_access_token
from datetime import datetime
from . import mongo, app
from .model import serial_post, serial_comment
from bson import ObjectId


@app.route('/')
def home():
    return jsonify({"message":"Welcome to the API"}), 200

@app.route('/login', methods=['POST'])
def login():
    username = request.json.get('username', None)
    if not username: 
        return jsonify({"error":"Missing Username"}), 400
    
    access_token = create_access_token(identity=username)
    return jsonify(access_token=access_token), 200

@app.route('/posts', methods=['GET'])
def get_posts():
    posts = mongo.db.posts.find()
    return jsonify([serial_post(post) for post in posts]), 200


@app.route('/posts', methods=['POST'])
@jwt_required()
def create_post():
    data = request.json
    title = data.get('title')
    content = data.get('content')
    author = request.jwt_identity()
    post = {
        'title': title,
        'content': content,
        'author': author,
        'created_at': datetime.utcnow(),
    }
    post_id = mongo.db.posts.insert_one(post).inserted_id
    return jsonify(serial_post(mongo.db.posts.find_one({'_id': post_id}))), 201


@app.route('/posts/<post_id>/comments', methods=['GET'])
def get_comments(post_id):
    comments = mongo.db.comments.find({'post_id': ObjectId(post_id)})
    return jsonify([serial_comment(comment) for comment in comments]), 200


@app.route('/posts/<post_id>/comments', methods=['POST'])
@jwt_required()
def create_comment(post_id):
    data = request.json
    content = data.get('content')
    author = request.jwt_identity()
    comment = {
        'content': content,
        'author': author,
        'post_id': ObjectId(post_id),
        'created_at': datetime.utcnow(),
    }
    comment_id = mongo.db.comments.insert_one(comment).inserted_id
    return jsonify(serial_comment(mongo.db.comments.find_one({'_id': comment_id}))), 201