from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import io
import base64

app = Flask(__name__)
CORS(app)

REFERENCE_WIDTH_MM = 132.4

@app.route('/calibrate', methods=['POST'])
def calibrate():
    