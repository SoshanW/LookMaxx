"""
Main configuration file for the LookMaxx application.
This serves as the single source of truth for all application settings.
"""
import os
from datetime import timedelta

# Flask configuration
SECRET_KEY = '96b41565d0018c9e66ff14bf5a9c81b265bde323'
DEBUG = True

# MongoDB configuration
MONGO_URI = "mongodb+srv://robertshemeshi:FC34K9IcO7uw6DES@cluster0.mp7jz.mongodb.net/authdb?retryWrites=true&w=majority&appName=Cluster0"

# JWT configuration
JWT_SECRET_KEY = SECRET_KEY  # Use the same secret key for JWT
JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=5)

# AWS Configuration
AWS_ACCESS_KEY = "AKIAZOZQFRVTVCA4OGLL"
AWS_SECRET_ACCESS_KEY = "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"
AWS_REGION = "ap-south-1"
S3_BUCKET = "looksci-user-data"

# S3 folder structure
S3_PROFILE_PICTURES_PREFIX = "profile-pictures/"
S3_FFR_PICTURES_UPLOAD = "ffr-pic-upload/"
S3_FFR_PICTURES_GENERATED = "ffr-pic-output/"
