from flask import request, jsonify
from flask_jwt_extended import jwt_required, create_access_token
from datetime import datetime
from . import mongo, app, limiter
from .model import serial_post, serial_comment
from bson import ObjectId
from bson.errors import InvalidId
import logging

logger = logging.getLogger(__name__)

@app.route('/')
@limiter.limit("10 per minute")  # Example of using the rate limiter
def home():
    logger.info("Home endpoint accessed")
    return jsonify({"message":"Welcome to the API"}), 200


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
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    skip = (page - 1) * per_page
    try:
        posts = mongo.db.posts.find().skip(skip).limit(per_page)
        total = mongo.db.posts.count_documents({})
        
        return jsonify({
            'posts': [serial_post(post) for post in posts],
            'total': total,
            'page': page,
            'pages': (total + per_page - 1) // per_page
        }), 200
    except Exception as e:
        app.logger.error(f'Error fetching posts: {str(e)}')
        return jsonify({'error': 'Database error'}), 500


@app.route('/posts', methods=['POST'])
@jwt_required()
def create_post():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    title = data.get('title')
    content = data.get('content')
    if not title or not content:
        return jsonify({"error": "Title and content are required"}), 400

    author = request.jwt_identity()
    post = {
        'title': title,
        'content': content,
        'author': author,
        'created_at': datetime.utcnow(),
    }
    try:
        post_id = mongo.db.posts.insert_one(post).inserted_id
        return jsonify(serial_post(mongo.db.posts.find_one({'_id': post_id}))), 201
    except Exception as e:
        app.logger.error(f'Error while creating post: {str(e)}')
        return jsonify({'error':'Databse error'}), 500


@app.route('/posts/<post_id>/comments', methods=['GET'])
def get_comments(post_id):
    try:
        comments = mongo.db.comments.find({'post_id': ObjectId(post_id)})
        return jsonify([serial_comment(comment) for comment in comments]), 200
    except InvalidId:
        return jsonify({'error': 'Invalid post ID'}), 400
    except Exception as e:
        app.logger.error(f'Error getting comments: {str(e)}')
        return jsonify({'error':'Internal server error'}), 500


    


@app.route('/posts/<post_id>/comments', methods=['POST'])
@jwt_required()
def create_comment(post_id):
    try:
        post = mongo.db.posts.find_one({'_id': ObjectId(post_id)})
    except Exception as e:
            return jsonify({'error': 'Post not found'}), 404
    
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    content = data.get('content')
    if not content:
        return jsonify({"error": "Content is required"}), 400
    
    author = request.jwt_identity()
    comment = {
        'content': content,
        'author': author,
        'post_id': ObjectId(post_id),
        'created_at': datetime.utcnow(),
    }
    comment_id = mongo.db.comments.insert_one(comment).inserted_id
    return jsonify(serial_comment(mongo.db.comments.find_one({'_id': comment_id}))), 201
