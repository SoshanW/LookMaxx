from datetime import datetime

def create_user(username):
    return{
        'username': username,
        'created_on': datetime.utcnow(),
        'posts': [],
        'comments':[],
        'liked_posts':[]
    }

def create_post(title, content, author_id):
    return{
        'title': title,
        'content': content,
        'author_id': author_id,
        'created_on': datetime.utcnow(),
        'comments': [],
        'likes': []
    }

def create_comment(content, author_id, post_id):
    return{
        'content': content,
        'author_id':author_id,
        'post_id': post_id,
        'created_on':datetime.utcnow()
    }

def serial_user(user):
    return{
        'id': str(user['_id']),
        'username': user['username'],
        'created_on': user['created_on'],
        'post_count': len(user.get('posts',[])),
        'comment_count': user.get('comments',[]),
        'liked_posts':  [str(post_id) for post_id in user.get('liked_posts', [])]
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
        'id': str(post['_id']),
        'title': post['title'],
        'content': post['content'],
        'created_on': post['created_on'],
        'comments': post.get('comments', []),
        'likes_count': len(post.get('likes', [])),
        'liked_by': [str(user_id) for user_id in post.get('likes', [])]
    }


def serial_comment(comment):
    return {
        'id': str(comment['_id']),
        'content': comment['content'],
        'author_id': str(comment['author_id']),
        'post_id': str(comment['post_id']),
        'created_on': comment['created_on'],
    }
    