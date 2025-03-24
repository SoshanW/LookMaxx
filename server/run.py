from flask import Flask
from Signup.app.routes import signup_routes, register_jwt_callbacks
from ML.facial_landmark_detection.ffr.routes import ffr_bp
from community.app.routes import community_routes
from paymentBe.app.routes import payment_routes
from casting.app.routes import casting_route
import os
import sys
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import datetime
from extensions import mongo, jwt, init_limiter
import logging
import urllib.parse
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
    
logger = logging.getLogger(__name__)


def create_unified_app():
    app = Flask(__name__)
    limiter = init_limiter(app)
    
    # First load base configuration from file
    app.config.from_pyfile('configuration.py')
    
    # Debug logging for configuration
    logger.info("Loading environment variables...")
    logger.info(f"MONGO_URI from env: {os.environ.get('MONGO_URI')}")
    logger.info(f"MONGO_URI from config: {app.config.get('MONGO_URI')}")
    logger.info(f"S3_PROFILE_PICTURES_PREFIX from env: {os.environ.get('S3_PROFILE_PICTURES_PREFIX')}")
    logger.info(f"S3_PROFILE_PICTURES_PREFIX from config: {app.config.get('S3_PROFILE_PICTURES_PREFIX')}")
    
    # Then override with environment variables if they exist
    app.config.update(
        SECRET_KEY=os.environ.get('SECRET_KEY', app.config.get('SECRET_KEY')),
        MONGO_URI=os.environ.get('MONGO_URI', app.config.get('MONGO_URI')),
        DEBUG=os.environ.get('DEBUG', app.config.get('DEBUG', 'False')),
        
        # AWS Configuration
        AWS_ACCESS_KEY=os.environ.get('AWS_ACCESS_KEY', app.config.get('AWS_ACCESS_KEY')),
        AWS_SECRET_ACCESS_KEY=os.environ.get('AWS_SECRET_ACCESS_KEY', app.config.get('AWS_SECRET_ACCESS_KEY')),
        AWS_REGION=os.environ.get('AWS_REGION', app.config.get('AWS_REGION')),
        S3_BUCKET=os.environ.get('S3_BUCKET', app.config.get('S3_BUCKET')),
        
        # S3 folder structure
        S3_PROFILE_PICTURES_PREFIX=os.environ.get('S3_PROFILE_PICTURES_PREFIX', app.config.get('S3_PROFILE_PICTURES_PREFIX')),
        S3_FFR_PICTURES_UPLOAD=os.environ.get('S3_FFR_PICTURES_UPLOAD', app.config.get('S3_FFR_PICTURES_UPLOAD')),
        S3_FFR_PICTURES_GENERATED=os.environ.get('S3_FFR_PICTURES_GENERATED', app.config.get('S3_FFR_PICTURES_GENERATED')),
        S3_FFR_PDF_UPLOAD=os.environ.get('S3_FFR_PDF_UPLOAD', app.config.get('S3_FFR_PDF_UPLOAD')),
        
        # LangChain/Anthropic settings
        LANGSMITH_TRACING=os.environ.get('LANGSMITH_TRACING', app.config.get('LANGSMITH_TRACING', 'false')),
        LANGSMITH_ENDPOINT=os.environ.get('LANGSMITH_ENDPOINT', app.config.get('LANGSMITH_ENDPOINT', '')),
        LANGSMITH_API_KEY=os.environ.get('LANGSMITH_API_KEY', app.config.get('LANGSMITH_API_KEY', '')),
        LANGSMITH_PROJECT=os.environ.get('LANGSMITH_PROJECT', app.config.get('LANGSMITH_PROJECT', '')),
        ANTHROPIC_API_KEY=os.environ.get('ANTHROPIC_API_KEY', app.config.get('ANTHROPIC_API_KEY', '')),
        GOOGLE_CLOUD_PROJECT=os.environ.get('GOOGLE_CLOUD_PROJECT', app.config.get('GOOGLE_CLOUD_PROJECT', '')),
        GOOGLE_APPLICATION_CREDENTIALS=os.environ.get('GOOGLE_APPLICATION_CREDENTIALS', app.config.get('GOOGLE_APPLICATION_CREDENTIALS', ''))
    )
    
    # Verify MongoDB URI is set
    if not app.config.get('MONGO_URI'):
        logger.error("MONGO_URI is not set in either environment variables or configuration file")
        raise ValueError("MONGO_URI must be set in environment variables or configuration file")
    
    # Handle JWT configuration specially, since timedelta can't be directly set from a string
    jwt_hours = int(os.environ.get('JWT_HOURS', 5))
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(hours=jwt_hours)
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', app.config['SECRET_KEY'])

    # CORS configuration
    cors_origin = os.environ.get('CORS_ORIGIN', 'http://localhost:5173')
    CORS(app, 
        resources={r"/*": {"origins": cors_origin}}, 
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        expose_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    
    # JWT Configuration
    jwt.init_app(app)
    register_jwt_callbacks(jwt)
    
    # MongoDB Connection
    try:
        logger.info("Initializing MongoDB connection...")
        mongo.init_app(app)
        mongo.db.command('ping')
        logger.info("Successfully connected to MongoDB!")
    except Exception as e:
        logger.error(f"Error connecting to MongoDB: {e}")
        raise e
    
    try:
        mongo.db.users.create_index([('posts.created_on', -1)])
        mongo.db.users.create_index([('posts.id', 1)])
        mongo.db.users.create_index([('comments.id', 1)])
        logger.info("MongoDB indexes created successfully")
    except Exception as e:
        logger.error(f"Failed to create MongoDB indexes: {str(e)}")

    # Register blueprints
    app.register_blueprint(signup_routes, url_prefix='/auth')
    app.register_blueprint(ffr_bp, url_prefix='/ffr')
    app.register_blueprint(community_routes, url_prefix='/community')
    app.register_blueprint(payment_routes, url_prefix='/payments')
    app.register_blueprint(casting_route, url_prefix='/casting')

    return app


def application(environ, start_response):
    app = create_unified_app()
    return app(environ, start_response)

if __name__ == '__main__':
    app = create_unified_app()
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'True').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)