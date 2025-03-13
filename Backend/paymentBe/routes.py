from flask import Flask, request, jsonify
import hashlib
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, get_jwt
from pymongo import MongoClient
import json