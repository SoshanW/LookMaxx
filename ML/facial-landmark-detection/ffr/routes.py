from flask import Blueprint,request, jsonify, current_app
from . import mongo
from .fda import (
    calculate_face_ratio,
    calculate_facial_thirds,
    calculate_eye_ratios,
    calculate_nasal_index,
    calculate_lip_ratio,
    save_image
)
from .comparison_report import generate_comparison_report
import numpy as np
import cv2
import mediapipe
import matplotlib.pyplot as plt
import os
import json
import base64

ffr_bp = Blueprint('ffr', __name__)

# Define the path for the graphs directory inside the assets folder
graphs_dir = os.path.join('assets', 'facial_ratio_graphs')
reports_dir = os.path.join('reports')

# Create directories if they don't exist
for directory in [graphs_dir, reports_dir]:
    if not os.path.exists(directory):
        os.makedirs(directory)

#route to accept the picture
@ffr_bp.route('/analyze-face', methods=['POST'])
def analyze_face():
    # Check if image file is in request
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    if 'username' not in request.form:
        return jsonify({'error': 'Username not provided'}), 400
    
    file = request.files['image']
    username = request.form['username']
    try:
        user = mongo.db.users.find_one({'username': username})
        if user:
            # Extract gender from user document
            gender = "unknown"
            if 'gender' in user:
                gender = user['gender']            
    except Exception as e:
        return jsonify({
            "error": f"Error retrieving gender: {str(e)}"
        }), 500

    #read the file once
    file_content = file.read()

    #image storing and conversion of image to base64 string
    encoded_image = base64.b64encode(file_content).decode('utf-8')
    
    # Read image file into numpy array
    file_bytes = np.frombuffer(file_content, np.uint8)
    img_base = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

    if img_base is None:
        raise Exception("Error: Invalid image file")

    # Initialize face mesh
    mp_face_mesh = mediapipe.solutions.face_mesh
    face_mesh = mp_face_mesh.FaceMesh(static_image_mode=True, min_detection_confidence=0.5)

    # Convert BGR to RGB for MediaPipe
    img_rgb = cv2.cvtColor(img_base, cv2.COLOR_BGR2RGB)

    # Process the image
    results = face_mesh.process(img_rgb)

    # Check if any face was detected
    if results.multi_face_landmarks is None:
        print("No face detected in the image")
        plt.figure(figsize=(15, 15))
        plt.imshow(cv2.cvtColor(img_base, cv2.COLOR_BGR2RGB))
        plt.title('Original Image - No Face Detected')
        plt.axis('off')
        plt.savefig(os.path.join(graphs_dir, 'no_face_detected.png'), bbox_inches='tight')
        plt.close()
        exit()

    # Get landmarks
    landmarks = results.multi_face_landmarks[0]

    # Calculate and display measurements
    if results.multi_face_landmarks:
        # Calculate face ratio
        ratio = calculate_face_ratio(landmarks, img_rgb.shape,img_base)
        print(f'Face width-to-height ratio: {ratio:.2f}')
        
        # Calculate facial thirds
        upper, middle, lower = calculate_facial_thirds(landmarks, img_rgb.shape, img_base)
        print(f'Facial thirds ratios - Upper: {upper:.2f}, Middle: {middle:.2f}, Lower: {lower:.2f}')
        
        # Calculate eye ratios
        left_eye_ratio, interpupillary_ratio = calculate_eye_ratios(landmarks, img_rgb.shape, img_base)
        print(f'Left eye width ratio: {left_eye_ratio:.3f}')
        print(f'Interpupillary to total width ratio: {interpupillary_ratio:.3f}')

        #Calulcate nasal index
        nasal_index = calculate_nasal_index(landmarks, img_rgb.shape, img_base)
        print(f'Nasal Index: {nasal_index:.3f}')

        # Calculate lip ratio
        lip_ratio = calculate_lip_ratio(landmarks, img_rgb.shape, img_base)
        print(f'Lip Ratio (Upper to Lower): {lip_ratio:.3f}')

        # Create a dictionary to store the results
        results_dict = {
            "face_ratio": round(ratio, 2),
            "upper_ratio": round(upper, 2),
            "middle_ratio": round(middle, 2),
            "lower_ratio": round(lower, 2),
            "left_eye_ratio": round(left_eye_ratio, 2),
            "interpupillary_ratio": round(interpupillary_ratio, 2),
            "nasal_index": round(nasal_index, 2),
            "lip_ratio": round(lip_ratio, 2)
        }

        # Save the results to a JSON file
        with open('./reports/facial_metrics.json', 'w') as json_file:
            json.dump(results_dict, json_file, indent=4)
        print("Results saved to 'facial_metrics.json'.")

    # Create tessellation image
    img_tessellation = cv2.cvtColor(img_base.copy(), cv2.COLOR_BGR2RGB)

    # Draw tessellation
    for source_idx, target_idx in mp_face_mesh.FACEMESH_TESSELATION:
        source = landmarks.landmark[source_idx]
        target = landmarks.landmark[target_idx]

        relative_source = (int(source.x * img_tessellation.shape[1]), 
                        int(source.y * img_tessellation.shape[0]))
        relative_target = (int(target.x * img_tessellation.shape[1]), 
                        int(target.y * img_tessellation.shape[0]))

        cv2.line(img_tessellation, relative_source, relative_target, (0, 255, 0), 1)

    # Save tessellation image
    save_image(img_tessellation, 'face_mesh_tessellation.png')

    print("All images saved in the 'assets/graphs' directory.")

    comparison_results = generate_comparison_report(results_dict, username, gender)

    # Save FFR results to MongoDB
    ffr_data = {
            'FFR_pic' : encoded_image,
            'facial_metrics': results_dict,
            'comparison_data': comparison_results['comparison_data']
        }
        
    # Update user document with FFR results
    update_result = mongo.db.users.update_one(
            {'username': username},
            {
                '$push': {
                    'ffr_results': ffr_data
                }
            }
        )
    
    if not update_result.modified_count:
        return jsonify({'error': 'Failed to save FFR results to database'}), 500

    # Return success response with results
    return jsonify({
            'message': 'Analysis completed successfully',
            'results': results_dict,
            'files': {
                'metrics': 'reports/facial_metrics.json',
                'comparison_report': 'reports/comparison_report.json',
                'visualizations': [
                    'facial_ratio_graphs/face_ratio.png',
                    'facial_ratio_graphs/facial_thirds.png',
                    'facial_ratio_graphs/eye_measurements.png',
                    'facial_ratio_graphs/nasal_index.png',
                    'facial_ratio_graphs/lip_ratio.png',
                    'facial_ratio_graphs/face_mesh_tessellation.png'
                ]
            }
        }), 200    
    
# If you need to retrieve FFR results later
@ffr_bp.route('/get-ffr-results/<username>', methods=['GET'])
def get_ffr_results(username):
    try:
        user = mongo.db.users.find_one({'username': username})
        if user and 'ffr_results' in user:
            return jsonify({
                "ffr_results": user['ffr_results']
            }), 200
        else:
            return jsonify({
                "message": "No FFR results found for this user"
            }), 404
            
    except Exception as e:
        return jsonify({
            "error": f"Error retrieving FFR results: {str(e)}"
        }), 500