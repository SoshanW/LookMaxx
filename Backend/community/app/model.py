from datetime import datetime

def create_user(username):
    return{
        'username': username,
        'created_on': datetime.utcnow(),
        'posts': [],
        'comments':[]
    }

def create_post(title, content, author_id):
    return{
        'title': title,
        'content': content,
        'author_id': author_id,
        'created_on': datetime.utcnow(),
        'comments': []
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
        'created_at': user['created_at'],
        'post_count': len(user['posts']),
        'comment_count': len(user['comments'])
    }

def serial_post(post, include_user = True):
    serialized = {
        'id': str(post['_id']),
        'title': post['title'],
        'content': post['content'],
        'author': post['author'],
        'created_at': post['created_at'],
    }

    if include_user:
        from . import mongo
        author = mongo.db.users.find_one({'_id': post['author_id']})
        if author:
            serialized['author'] = {
                'id': str(author['_id']),
                'username': author['username']
            }
    return serialized

def serial_comment(comment,include_user = True):
    serialized = {
        'id': str(comment['_id']),
        'content': comment['content'],
        'author': comment['author'],
        'post_id': str(comment['post_id']),
        'created_at': comment['created_at'],
    }
    if include_user:
            from . import mongo
            author = mongo.db.users.find_one({'_id': comment['author_id']})
            if author:
                serialized['author'] = {
                    'id': str(author['_id']),
                    'username': author['username']
                }
    return serialized