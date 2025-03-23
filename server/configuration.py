import os
from datetime import timedelta

# Flask configuration
SECRET_KEY = os.environ.get('SECRET_KEY')
DEBUG = os.environ.get('DEBUG', 'True').lower() == 'true'

# MongoDB configuration
MONGO_URI = os.environ.get('MONGO_URI')

# JWT configuration
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', SECRET_KEY)
JWT_HOURS = int(os.environ.get('JWT_HOURS', '5'))
JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=JWT_HOURS)

# AWS Configuration - NO DEFAULT VALUES FOR CREDENTIALS
AWS_ACCESS_KEY = os.environ.get('AWS_ACCESS_KEY')
AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')
AWS_REGION = os.environ.get('AWS_REGION', 'ap-south-1')
S3_BUCKET = os.environ.get('S3_BUCKET')

# S3 folder structure (non-sensitive defaults)
S3_PROFILE_PICTURES_PREFIX = os.environ.get('S3_PROFILE_PICTURES_PREFIX', 'profile-pictures/')
S3_FFR_PICTURES_UPLOAD = os.environ.get('S3_FFR_PICTURES_UPLOAD', 'ffr-pic-upload/')
S3_FFR_PICTURES_GENERATED = os.environ.get('S3_FFR_PICTURES_GENERATED', 'ffr-pic-output/')
S3_FFR_PDF_UPLOAD = os.environ.get('S3_FFR_PDF_UPLOAD', 'ffr-pdf-upload/')

# LangChain/Anthropic configuration - using environment variables only
LANGSMITH_TRACING = os.environ.get('LANGSMITH_TRACING')
LANGSMITH_ENDPOINT = os.environ.get('LANGSMITH_ENDPOINT')
LANGSMITH_API_KEY = os.environ.get('LANGSMITH_API_KEY')
LANGSMITH_PROJECT = os.environ.get('LANGSMITH_PROJECT')
ANTHROPIC_API_KEY = os.environ.get('ANTHROPIC_API_KEY')
GOOGLE_CLOUD_PROJECT = os.environ.get('GOOGLE_CLOUD_PROJECT')
GOOGLE_APPLICATION_CREDENTIALS = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')