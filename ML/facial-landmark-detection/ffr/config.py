class Config:
    MONGO_URI = "mongodb+srv://robertshemeshi:FC34K9IcO7uw6DES@cluster0.mp7jz.mongodb.net/authdb?retryWrites=true&w=majority&appName=Cluster0"
    SECRET_KEY = '96b41565d0018c9e66ff14bf5a9c81b265bde323'

class AWS:
    AWS_ACCESS_KEY = "AKIAZOZQFRVTVCA4OGLL"
    AWS_SECRET_ACCESS_KEY = "5oj5H6RTqeScB4Kj6EatAhqM0wNtSSXJW6ZD9NUb"
    AWS_REGION = "ap-south-1"  # Add your region (default is us-east-1)
    S3_BUCKET = "looksci-user-data"
    S3_FFR_PICTURES_UPLOAD = "ffr-pic-upload/" 