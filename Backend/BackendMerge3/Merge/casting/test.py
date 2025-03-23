import jwt
import datetime
 

secret_key = 'JWT_SECRET'
 

user_id = '67a1d78a82dba6312d1f7417' 
 

expiration = datetime.datetime.utcnow() + datetime.timedelta(hours=1)
 

payload = {
    'identity': user_id,
    'exp': expiration
}
 

token = jwt.encode(payload, secret_key, algorithm='HS256')
 
print("JWT Token:", token)