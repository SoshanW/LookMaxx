from bson import ObjectId

def serial_post(post):
    return {
        'id': str(post['_id']),
        'title': post['title'],
        'content': post['content'],
        'author': post['author'],
        'created_at': post['created_at'],
    }

def serial_comment(comment):
    return {
        'id': str(comment['_id']),
        'content': comment['content'],
        'author': comment['author'],
        'post_id': str(comment['post_id']),
        'created_at': comment['created_at'],
    }