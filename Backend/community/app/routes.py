from flask import request, jsonify
from flask_jwt_extended import jwt_required, create_access_token, get_jwt_identity
from datetime import datetime
from . import mongo, app, limiter
from app.model import create_comment, create_post, create_user, serial_post, serial_comment, serial_user
from bson import ObjectId
from bson.errors import InvalidId
import logging

logger = logging.getLogger(__name__)

@app.route('/')
@limiter.limit("10 per minute")
def home():
    logger.info("Home endpoint accessed")
    return jsonify({"message":"Welcome to the API"}), 200

@app.route('/register', methods=['POST'])
@limiter.limit("5 per minute")
def register():
    username = request.json.get('username')
    if not username:
        return jsonify({'error': 'Username is required'}), 400

    existing_user = mongo.db.users.find_one({'username': username})
    if existing_user:
        return jsonify({'error': 'Username already taken'}), 400
    
    try:
        user = create_user(username)
        user_id = mongo.db.users.insert_one(user).inserted_id
        access_token = create_access_token(identity=str(user_id))
        return jsonify({
            'message': 'User created successfully',
            'access_token': access_token
        }), 201
    except Exception as e:
        logger.error(f"Error creating user: {str(e)}")
        return jsonify({"error": "Database error"}), 500
    

@app.route('/login', methods=['POST'])
def login():
    username = request.json.get('username')
    if not username: 
        return jsonify({"error":"Missing Username"}), 400
    
    user = mongo.db.users.find_one({'username':username})
    if not user: 
        return jsonify({'error':'user not found'}), 400
    
    access_token = create_access_token(identity=str(user['_id']))
    return jsonify(access_token=access_token), 200


@app.route('/posts', methods=['GET'])
def get_posts():
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    skip = (page - 1) * per_page

    try:
        posts_cursor = mongo.db.posts.find().sort('created_on', -1).skip(skip).limit(per_page)
        total = mongo.db.posts.count_documents({})
        serialized_post = []

        for post in posts_cursor:
            author = mongo.db.users.find_one({'_id': post['author_id']})
            post_data = serial_post(post)
            post_data['author'] = {'username': author['username'] if author else 'Unknown'}
            
            serialized_post.append(post_data)

        return jsonify({
            'posts': serialized_post,
            'total': total,
            'page': page,
            'pages': (total + per_page - 1) // per_page
        }), 200
    
    except Exception as e:
        app.logger.error(f'Error fetching posts: {str(e)}')
        return jsonify({'error':f'Databse error: {str(e)}'}), 500

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
    
    try:
        user_id = ObjectId(get_jwt_identity())
        post = create_post(title,content, user_id)
        post_id = mongo.db.posts.insert_one(post).inserted_id
        mongo.db.users.update_one(
            {'_id': user_id},
            {'$push': {'posts': post_id}}
        )

        return jsonify(serial_post(mongo.db.posts.find_one({'_id': post_id}))), 201
    
    except Exception as e:
        logger.error(f'Error while creating post: {str(e)}')
        return jsonify({'error':f'Databse error: {str(e)}'}), 500
print('Imported create_post function:', create_post)


@app.route('/posts/<post_id>/comments', methods=['GET'])
def get_comments(post_id):
    try:
        post_object_id = ObjectId(post_id)
        
        post = mongo.db.posts.find_one({'_id': post_object_id})
        
        if not post:
            return jsonify({'error': 'Post not found'}), 404
        
        comments = post.get('comments', [])
        serialized_comments = []
        for comment in comments:
            try:
                
                logger.info(f"Processing comment: {comment}")
                
                
                required_fields = ['_id', 'content', 'author_id', 'post_id', 'created_on']
                missing_fields = [field for field in required_fields if field not in comment]
                if missing_fields:
                    logger.error(f"Comment missing required fields: {missing_fields}")
                    continue
                
                author = mongo.db.users.find_one({'_id': comment['author_id']})
                logger.info(f"Found author: {author}")
                
                comment_data = serial_comment(comment)
                comment_data['author'] = {
                    'username': author['username'] if author else 'Unknown'
                }
                serialized_comments.append(comment_data)
            except Exception as e:
                # Log the specific error for each comment
                logger.error(f"Error processing individual comment: {str(e)}")
                logger.error(f"Problematic comment data: {comment}")
                continue

        return jsonify({
            'post_id': str(post_object_id),
            'total_comments': len(serialized_comments),
            'comments': serialized_comments
        }), 200

    except Exception as e:
        app.logger.error(f'Error getting comments: {str(e)}')
        return jsonify({'error':f'Internal server error: {str(e)}'}), 500
    

@app.route('/posts/<post_id>/comments', methods=['POST'])
@jwt_required()
def create_comment(post_id):
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        content = data.get('content')
        if not content:
            return jsonify({"error": "Content is required"}), 400
            
        user_id = ObjectId(get_jwt_identity())
        post_object_id = ObjectId(post_id)
        post = mongo.db.posts.find_one({'_id': post_object_id})
        
        if not post:
            return jsonify({"error": "Post not found"}), 404
        
        comment = create_comment(content, user_id, post_object_id)

        mongo.db.posts.update_one(
                {'_id': post_object_id},
                {'$push': {'comments': comment}}
            )
            
        mongo.db.users.update_one(
                {'_id': user_id},
                {'$push': {'comments': comment['_id']}}
            )
            
        return jsonify(serial_comment(comment)), 201
    
    except InvalidId:
        return jsonify({'error': 'Invalid post ID'}), 400
    except Exception as e:
        logger.error(f'Error creating comment: {str(e)}')
        return jsonify({'error': 'Database error'}), 500

@app.route('/users/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        user_id = ObjectId(get_jwt_identity())
        user = mongo.db.users.find_one({'_id': user_id})
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        posts = list(mongo.db.posts.find(
            {'author_id': user_id}
        ).sort('created_on', -1).limit(5))
        
        recent_comments = []
        comment_ids = user.get('comments', [])

        for comment_id in comment_ids[-5:]: 
            try:
                post_with_comment = mongo.db.posts.find_one(
                    {'comments._id': comment_id},
                    {'title': 1, 'comments.$': 1} 
                )
                
                if post_with_comment and post_with_comment.get('comments'):
                    comment = post_with_comment['comments'][0] 
                    comment_data = serial_comment(comment)
                    comment_data['post_title'] = post_with_comment['title']
                    recent_comments.append(comment_data)
            except Exception as e:
                logger.error(f"Error processing comment {comment_id}: {str(e)}")
                continue

        recent_comments.sort(
            key=lambda x: x['created_on'],
            reverse=True
        )
        
        return jsonify({
            'user': serial_user(user),
            'recent_posts': [serial_post(post) for post in posts],
            'recent_comments': recent_comments[:5]
        }), 200   
    
    except Exception as e:
        logger.error(f'Error fetching user profile: {str(e)}')
        return jsonify({'error':f'Database error: {str(e)}'}), 500

    
    
    