from flask import Blueprint, request, jsonify, current_app
from extensions import mongo
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
import boto3
import os
from botocore.exceptions import ClientError
from werkzeug.utils import secure_filename
import json
import io
import sys
import subprocess
import importlib.util
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))
import importlib.machinery
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, get_jwt

ffr_bp = Blueprint('ffr', __name__)

def get_s3_client():
    """Get S3 client with configuration from app config"""
    return boto3.client(
        's3',
        aws_access_key_id=current_app.config['AWS_ACCESS_KEY'],
        aws_secret_access_key=current_app.config['AWS_SECRET_ACCESS_KEY'],
        region_name=current_app.config['AWS_REGION']
    )

def upload_file_to_s3(file, username):
    """
    Upload a file to the S3 bucket
    
    :param file: File to upload
    :param username: Username to create filename with
    :return: S3 URL of the uploaded file
    """
    # Create a filename based on username
    filename = f"{username}_ffr.jpg"
    s3_path = current_app.config['S3_FFR_PICTURES_UPLOAD'] + filename
    s3_client = get_s3_client()
    
    try:
        # Upload the file to S3
        s3_client.upload_fileobj(
            file,
            current_app.config['S3_BUCKET'],
            s3_path,
            ExtraArgs={
                'ContentType': file.content_type
            }
        )
        
        # Generate the URL for the uploaded file
        s3_url = f"s3://{current_app.config['S3_BUCKET']}/{s3_path}"
        return s3_url
    
    except ClientError as e:
        print(f"Error uploading to S3: {e}")
        return None
    
def upload_image_to_s3(img_array, filename, username, content_type='image/png'):
    """
    Upload an image numpy array to S3
    
    :param img_array: Image as numpy array
    :param filename: Name of the file
    :param username: Username for folder structure
    :param content_type: Content type of the image
    :return: S3 URL of the uploaded file
    """
    # Format full path with username folder
    s3_path = f"{current_app.config.S3_FFR_PICTURES_GENERATED}{username}/{filename}_ffr.png"
    s3_client = get_s3_client()
    
    try:
        # Convert numpy array to bytes
        is_success, buffer = cv2.imencode(".png", img_array)
        if not is_success:
            return None
            
        # Convert to BytesIO object
        io_buf = io.BytesIO(buffer)
        
        # Upload to S3
        s3_client.upload_fileobj(
            io_buf,
            current_app.config.S3_BUCKET,
            s3_path,
            ExtraArgs={
                'ContentType': content_type
            }
        )
        
        # Generate the URL for the uploaded file
        s3_url = f"s3://{current_app.config.S3_BUCKET}/{s3_path}"
        return s3_url
    
    except ClientError as e:
        print(f"Error uploading to S3: {e}")
        return None

def save_plot_to_s3(fig, filename, username):
    """
    Save a matplotlib figure to S3
    
    :param fig: Matplotlib figure
    :param filename: Name of the file
    :param username: Username for folder structure
    :return: S3 URL of the uploaded file
    """

    s3_path = f"{current_app.config.S3_FFR_PICTURES_GENERATED}{username}/{filename}_ffr.png"
    s3_client = get_s3_client()
    
    try:
        # Save figure to BytesIO object
        buf = io.BytesIO()
        fig.savefig(buf, format='png', bbox_inches='tight')
        buf.seek(0)
        
        # Upload to S3
        s3_client.upload_fileobj(
            buf,
            current_app.config.S3_BUCKET,
            s3_path,
            ExtraArgs={
                'ContentType': 'image/png'
            }
        )
        
        # Generate the URL for the uploaded file
        s3_url = f"s3://{current_app.config.S3_BUCKET}/{s3_path}"
        return s3_url
    
    except ClientError as e:
        print(f"Error uploading to S3: {e}")
        return None
    finally:
        plt.close(fig)

def upload_local_image_to_s3(local_path, filename, username):
    """
    Upload a local image file to S3
    
    :param local_path: Path to local image file
    :param filename: Base filename for S3
    :param username: Username for folder structure
    :return: S3 URL of the uploaded file
    """
    s3_path = f"{current_app.config.S3_FFR_PICTURES_GENERATED}{username}/{filename}_ffr.png"
    s3_client = get_s3_client()
    
    try:
        with open(local_path, 'rb') as file_data:
            s3_client.upload_fileobj(
                file_data,
                current_app.config.S3_BUCKET,
                s3_path,
                ExtraArgs={
                    'ContentType': 'image/png'
                }
            )
            
        # Generate the URL for the uploaded file
        s3_url = f"s3://{current_app.config.S3_BUCKET}/{s3_path}"
        return s3_url
    
    except ClientError as e:
        print(f"Error uploading to S3: {e}")
        return None
    except FileNotFoundError:
        print(f"Local file not found: {local_path}")
        return None

def run_report_generation(username):
    """Run report generation as a separate process"""
    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        parent_dir = os.path.dirname(current_dir)
        grandparent_dir = os.path.dirname(parent_dir)
        report_gen_path = os.path.join(grandparent_dir, 'report-generation-V2')

        original_path = sys.path.copy()
        sys.path.insert(0, report_gen_path)
        
        main_module_path = os.path.join(report_gen_path, 'main.py')
        spec = importlib.util.spec_from_file_location('report_gen_main', main_module_path)
        report_gen_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(report_gen_module)
            
        # Call the generate_report function
        report_gen_module.main(username)
        
        print(f"Report generation process started for user: {username}")
        
    except Exception as e:
        print(f"Error starting report generation: {str(e)}")  

    finally:
        sys.path = original_path      


# Define the path for the graphs directory inside the assets folder
graphs_dir = os.path.join('assets', 'facial_ratio_graphs')
reports_dir = os.path.join('reports')

# Create directories if they don't exist
for directory in [graphs_dir, reports_dir]:
    if not os.path.exists(directory):
        os.makedirs(directory)

#route to accept the picture
@ffr_bp.route('/analyze-face', methods=['POST'])
@jwt_required
def analyze_face():
    # Check if image file is in request
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    username= get_jwt_identity()
    
    file = request.files['image']
    
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

    file_content = file.read()

    FFR_url = upload_file_to_s3(file, username)
    if not FFR_url:
        return jsonify({"error": "Failed to upload input image"}), 500
    
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

    #Dictionary to store s3 URLS of all the visualization files
    s3_files ={
        'visualizations' : {}
    }

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

    tessellation_url = upload_image_to_s3(img_tessellation, 'face_mesh_tessellation', username)
    s3_files['visualizations']['tessellations'] = tessellation_url

    for filename in os.listdir(graphs_dir):
        if filename.endswith('.png') and filename != 'face_mesh_tessellation.png' and filename != 'no_face_detected.png':
            local_path = os.path.join(graphs_dir, filename)
            # Get the base filename without extension
            base_name = os.path.splitext(filename)[0]
            # Upload to S3
            s3_url = upload_local_image_to_s3(local_path, base_name, username)
            if s3_url:
                s3_files['visualizations'][base_name] = s3_url

    print("All images saved to S3.")

    comparison_results = generate_comparison_report(results_dict, username, gender)

    # Save FFR results to MongoDB
    try:    
        ffr_data = {
                'FFR_pic' : FFR_url,
                'facial_metrics': results_dict,
                'comparison_data': comparison_results['comparison_data'],
                'Graphs_and_Images' : s3_files['visualizations']
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
        
        run_report_generation(username)

        # Return success response with results
        return jsonify({
                'message': 'Analysis completed successfully',
                'results': results_dict,
                'files': {
                    'metrics': 'reports/facial_metrics.json',
                    'comparison_report': 'reports/comparison_report.json',
                    'visualizations': s3_files['visualizations']
                }
            }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
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