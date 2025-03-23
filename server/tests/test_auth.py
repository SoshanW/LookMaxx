import json
import pytest
from unittest.mock import patch, MagicMock

def test_home_route(client):
    """Test the home route returns a valid response."""
    response = client.get('/auth/')
    assert response.status_code == 200
    assert b"Welcome" in response.data

def test_signup_route_missing_data(client):
    """Test signup route with missing data."""
    response = client.post('/auth/signup', data={})
    assert response.status_code == 400
    data = json.loads(response.data)
    assert "error" in data

def test_login_route_missing_data(client):
    """Test login route with missing data."""
    response = client.post('/auth/login', data={})
    assert response.status_code == 401
    data = json.loads(response.data)
    assert "error" in data

@patch('Signup.app.routes.mongo.db.users.find_one')
@patch('Signup.app.routes.check_password_hash')
@patch('Signup.app.routes.create_access_token')
def test_login_success(mock_create_token, mock_check_pw, mock_find_one, client):
    """Test successful login."""
    # Setup mocks
    mock_find_one.return_value = {
        'username': 'testuser',
        'password': 'hashed_password',
        'first_name': 'Test',
        'last_name': 'User',
        'email': 'test@example.com'
    }
    mock_check_pw.return_value = True
    mock_create_token.return_value = 'test_token'
    
    # Send login request
    response = client.post('/auth/login', data={
        'username': 'testuser',
        'password': 'password123'
    })
    
    # Verify response
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['message'] == 'Login successful'
    assert data['access_token'] == 'test_token'
    assert data['user']['username'] == 'testuser'