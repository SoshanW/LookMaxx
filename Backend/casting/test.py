import jwt
import datetime

# Use the secret key you would typically use in your app config
secret_key = 'JWT_SECRET'

# Manually use an existing user ID (replace with an actual ObjectId from your MongoDB)
user_id = '67a1d78a82dba6312d1f7417'  # Example ObjectId as a string

# Set the expiration for the token (optional)
expiration = datetime.datetime.utcnow() + datetime.timedelta(hours=1)

# Create JWT payload
payload = {
    'identity': user_id,
    'exp': expiration
}

# Create the JWT token
token = jwt.encode(payload, secret_key, algorithm='HS256')

print("JWT Token:", token)
