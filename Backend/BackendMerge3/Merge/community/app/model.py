from datetime import datetime
from bson import ObjectId
def create_user(username):
    return{
        'username': username,
        'created_on': datetime.utcnow(),
        'posts': [],
        'comments':[],
        'liked_posts':[]
    }

def create_post(title, content, author_id):
    if not isinstance(author_id, ObjectId):
        try:
            author_id = ObjectId(author_id)
        except:
            raise ValueError("Invalid author ID format")
    return{
        'title': title,
        'content': content,
        'author_id': author_id,
        'created_on': datetime.utcnow(),
        'comments': [],
        'likes': []
    }

def create_comment(content, author_id, post_id):
    if not isinstance(author_id, ObjectId):
        try:
            author_id = ObjectId(author_id)
        except:
            raise ValueError("Invalid author ID format")
            
    if not isinstance(post_id, ObjectId):
        try:
            post_id = ObjectId(post_id)
        except:
            raise ValueError("Invalid post ID format")
        
    return{
        "_id": ObjectId(), 
        'content': content,
        'author_id':author_id,
        'post_id': post_id,
        'created_on':datetime.utcnow()
    }

def serial_user(user):
     return {
        "_id": str(user.get("_id", "")),
        "username": user.get("username", ""),
        "email": user.get("email", ""),
        "created_on": user.get("created_on", datetime.utcnow()).isoformat(),
        "posts_count": len(user.get("posts", [])),
        "comments_count": len(user.get("comments", []))
    }

def serial_post(post):
    from bson import ObjectId
    comments = []
    for comment_id in post.get('comments', []):
        if isinstance(comment_id, ObjectId):
            comments.append(str(comment_id))
        else:
            comments.append(str(comment_id))
    return {
        "_id": str(post.get("_id", "")),
        "title": post.get("title", ""),
        "content": post.get("content", ""),
        "author_id": str(post.get("author_id", "")),
        "created_on": post.get("created_on", datetime.utcnow()).isoformat(),
        "likes": [str(like) for like in post.get("likes", [])],
        "comments": [serial_comment(comment) for comment in post.get("comments", [])]
    }


def serial_comment(comment):
    return {
        "_id": str(comment.get("_id", "")),
        "content": comment.get("content", ""),
        "author_id": str(comment.get("author_id", "")),
        "post_id": str(comment.get("post_id", "")),
        "created_on": comment.get("created_on", datetime.utcnow()).isoformat()
    }
    