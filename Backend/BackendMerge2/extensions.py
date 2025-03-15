from flask_pymongo import PyMongo
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Create the limiter as a global instance that can be imported in routes
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"  # Use in-memory storage, change as needed
)

def init_limiter(app):
    """
    Initialize the rate limiter with the Flask app.
    
    This function should be called after creating the Flask app 
    but before registering any routes.
    
    Args:
        app (Flask): The Flask application instance
    """
    limiter.init_app(app)
    return limiter

# Initialize extensions without binding to an app
mongo = PyMongo()
jwt = JWTManager()

# JWT token blocklist
jwt_blocklist = set()