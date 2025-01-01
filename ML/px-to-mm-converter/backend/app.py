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
    try:
        image_data = request.json['image']
        image_bytes = base64.b64decode(image_data.split(',')[1])
        image = Image.open(io.BytesIO(image_bytes))
        width_pixels = image.size[0]
        conversion_ratio = REFERENCE_WIDTH_MM / width_pixels
        return jsonify({
            'success': True,
            'conversion_ratio': conversion_ratio,
            'reference_width_mm': REFERENCE_WIDTH_MM,
            'image_width_pixels': width_pixels
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400