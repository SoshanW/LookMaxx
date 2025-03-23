import sys
import os
import pytest
import mongomock
from unittest.mock import patch, MagicMock

# Append the project's root directory to the sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

@pytest.fixture
def app():
    """Create and configure a Flask app for testing."""
    from run import create_unified_app
    app = create_unified_app()
    app.config.update({
        "TESTING": True,
        "MONGO_URI": "mongodb://localhost:27017/test_db",
    })
    yield app

@pytest.fixture
def client(app):
    """A test client for the app."""
    return app.test_client()

# Mock MongoDB
@pytest.fixture(autouse=True)
def mock_mongo():
    with patch('flask_pymongo.PyMongo') as mock_pymongo:
        # Create a mock mongo client with mongomock
        mongo_mock = MagicMock()
        mongo_mock.db = mongomock.MongoClient().db
        
        # Add some methods and attributes needed for the app
        mongo_mock.db.command = MagicMock(return_value=True)
        mongo_mock.db.users = mongo_mock.db.users
        mongo_mock.db.posts = mongo_mock.db.posts
        mongo_mock.db.comments = mongo_mock.db.comments
        
        # Return the mock
        yield mongo_mock

# Mock AWS S3
@pytest.fixture(autouse=True)
def mock_s3():
    with patch('boto3.client') as mock_boto:
        s3_mock = MagicMock()
        mock_boto.return_value = s3_mock
        yield s3_mock

# Mock environment variables
@pytest.fixture(autouse=True)
def mock_env_vars(monkeypatch):
    env_vars = {
        'SECRET_KEY': 'test_secret_key',
        'MONGO_URI': 'mongodb://localhost:27017/test_db',
        'JWT_SECRET_KEY': 'test_jwt_secret',
        'AWS_ACCESS_KEY': 'test_aws_key',
        'AWS_SECRET_ACCESS_KEY': 'test_aws_secret',
        'AWS_REGION': 'test-region-1',
        'S3_BUCKET': 'test-bucket',
        'ANTHROPIC_API_KEY': 'test_anthropic_key',
        'GOOGLE_CLOUD_PROJECT': 'test-project',
        'S3_PROFILE_PICTURES_PREFIX': 'profile-pictures/',
        'S3_FFR_PICTURES_UPLOAD': 'ffr-pic-upload/',
        'S3_FFR_PICTURES_GENERATED': 'ffr-pic-output/',
        'S3_FFR_PDF_UPLOAD': 'ffr-pdf-upload/',
    }
    
    for key, value in env_vars.items():
        monkeypatch.setenv(key, value)