import mediapipe
import cv2
import matplotlib.pyplot as plt
import os
import json  # Import the json module

def calculate_face_ratio(landmarks, img_shape):
    # Create a fresh copy of the base image
    img_ratio = cv2.cvtColor(img_base.copy(), cv2.COLOR_BGR2RGB)
    
    x_coords = [int(landmark.x * img_shape[1]) for landmark in landmarks.landmark]
    y_coords = [int(landmark.y * img_shape[0]) for landmark in landmarks.landmark]
    width = max(x_coords) - min(x_coords)
    height = max(y_coords) - min(y_coords)
    ratio = width / height

    cv2.rectangle(img_ratio, (min(x_coords), min(y_coords)), (max(x_coords), max(y_coords)), (0, 0, 255), 2)
    cv2.putText(img_ratio, f'Width/Height Ratio: {ratio:.2f}', 
                (min(x_coords), min(y_coords)-10),
                cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 2)
    
    # Display face ratio
    plt.figure(figsize=(15, 15))
    plt.imshow(img_ratio)
    plt.title('Face Width to Height Ratio')
    plt.show()
    
    return ratio

def calculate_facial_thirds(landmarks, img_shape):
    # Create a fresh copy of the base image
    img_thirds = cv2.cvtColor(img_base.copy(), cv2.COLOR_BGR2RGB)
    
    y_coords = [int(landmark.y * img_shape[0]) for landmark in landmarks.landmark]
    x_coords = [int(landmark.x * img_shape[1]) for landmark in landmarks.landmark]
    
    face_height = max(y_coords) - min(y_coords)
    face_left = min(x_coords)
    face_right = max(x_coords)
    mid_x = (face_left + face_right) // 2
    
    forehead = min(y_coords[10:20])  # Forehead region
    eyebrow = y_coords[70]  # Single eyebrow point at arch
    nose_bottom = y_coords[94]  
    chin = max(y_coords)
    
    upper_third = eyebrow - forehead
    middle_third = nose_bottom - eyebrow
    lower_third = chin - nose_bottom
    
    upper_ratio = upper_third / face_height
    middle_ratio = middle_third / face_height
    lower_ratio = lower_third / face_height
    
    # Draw vertical midline
    cv2.line(img_thirds, (mid_x, forehead), (mid_x, chin), (255, 0, 0), 2)
    
    line_color = (0, 255, 0)
    text_offset = 50
    
    # Draw horizontal lines and ratios
    cv2.line(img_thirds, (mid_x - 20, forehead), (mid_x + 20, forehead), line_color, 2)
    cv2.line(img_thirds, (mid_x - 20, eyebrow), (mid_x + 20, eyebrow), line_color, 2)
    cv2.putText(img_thirds, f'Upper: {upper_ratio:.2f}', 
                (face_right + text_offset, (forehead + eyebrow)//2),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, line_color, 2)
    
    cv2.line(img_thirds, (mid_x - 20, nose_bottom), (mid_x + 20, nose_bottom), line_color, 2)
    cv2.putText(img_thirds, f'Middle: {middle_ratio:.2f}',
                (face_right + text_offset, (eyebrow + nose_bottom)//2),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, line_color, 2)
    
    cv2.line(img_thirds, (mid_x - 20, chin), (mid_x + 20, chin), line_color, 2)
    cv2.putText(img_thirds, f'Lower: {lower_ratio:.2f}',
                (face_right + text_offset, (nose_bottom + chin)//2),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, line_color, 2)
    
    # Display facial thirds
    plt.figure(figsize=(15, 15))
    plt.imshow(img_thirds)
    plt.title('Facial Thirds Measurements')
    plt.show()
    
    return upper_ratio, middle_ratio, lower_ratio

def calculate_eye_ratios(landmarks, img_shape):
    # Create a fresh copy of the base image
    img_eyes = cv2.cvtColor(img_base.copy(), cv2.COLOR_BGR2RGB)
    
    # Get coordinates for left eye corners
    left_outer = (int(landmarks.landmark[33].x * img_shape[1]), 
                 int(landmarks.landmark[33].y * img_shape[0]))
    left_inner = (int(landmarks.landmark[133].x * img_shape[1]), 
                 int(landmarks.landmark[133].y * img_shape[0]))
    
    # Get coordinates for right eye corners
    right_inner = (int(landmarks.landmark[362].x * img_shape[1]), 
                  int(landmarks.landmark[362].y * img_shape[0]))
    right_outer = (int(landmarks.landmark[263].x * img_shape[1]), 
                  int(landmarks.landmark[263].y * img_shape[0]))
    
    # Calculate distances
    left_eye_width = ((left_outer[0] - left_inner[0])**2 + (left_outer[1] - left_inner[1])**2)**0.5
    interpupillary_dist = ((left_inner[0] - right_inner[0])**2 + (left_inner[1] - right_inner[1])**2)**0.5
    total_eye_span = ((left_outer[0] - right_outer[0])**2 + (left_outer[1] - right_outer[1])**2)**0.5
    
    # Calculate ratios
    left_eye_ratio = left_eye_width / total_eye_span
    interpupillary_ratio = interpupillary_dist / total_eye_span
    
    # Draw measurements
    line_color = (255, 0, 0)  # Red color for lines
    
    # Draw left eye width
    cv2.line(img_eyes, left_outer, left_inner, line_color, 2)
    cv2.putText(img_eyes, f'{left_eye_ratio:.3f}', 
                (left_outer[0], left_outer[1] - 10),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, line_color, 2)
    
    # Draw interpupillary distance
    cv2.line(img_eyes, left_inner, right_inner, (0,255,0) , 2)
    cv2.putText(img_eyes, f'{interpupillary_ratio:.3f}',
                (left_inner[0], left_inner[1] - 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, line_color, 2)
    
    # Draw total eye span (reference)
    cv2.line(img_eyes, left_outer, right_outer, (0, 0, 255), 1)
    
    # Display eye measurements
    plt.figure(figsize=(15, 15))
    plt.imshow(img_eyes)
    plt.title('Eye Measurements')
    plt.show()
    
    return left_eye_ratio, interpupillary_ratio

# Print current working directory and check if file exists
print("Current working directory:", os.getcwd())
print("Looking for image file:", os.path.abspath('dumbImage.jpg'))
print("File exists:", os.path.exists('dumbImage.jpg'))

# Load image with error checking
img_base = cv2.imread('./assets/naflan.jpg')
if img_base is None:
    raise Exception("Error: Could not load image 'dumbImage.jpg'. Please check if the file exists and the path is correct.")

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
    plt.show()
    exit()

# Get landmarks
landmarks = results.multi_face_landmarks[0]

# Calculate and display measurements
if results.multi_face_landmarks:
    # Calculate face ratio
    ratio = calculate_face_ratio(landmarks, img_rgb.shape)
    print(f'Face width-to-height ratio: {ratio:.2f}')
    
    # Calculate facial thirds
    upper, middle, lower = calculate_facial_thirds(landmarks, img_rgb.shape)
    print(f'Facial thirds ratios - Upper: {upper:.2f}, Middle: {middle:.2f}, Lower: {lower:.2f}')
    
    # Calculate eye ratios
    left_eye_ratio, interpupillary_ratio = calculate_eye_ratios(landmarks, img_rgb.shape)
    print(f'Left eye width ratio: {left_eye_ratio:.3f}')
    print(f'Interpupillary to total width ratio: {interpupillary_ratio:.3f}')

    # Create a dictionary to store the results
    results_dict = {
        "face_ratio": round(ratio, 2),
        "upper_ratio": round(upper, 2),
        "middle_ratio": round(middle, 2),
        "lower_ratio": round(lower, 2),
        "left_eye_ratio": round(left_eye_ratio, 2),
        "interpupillary_ratio": round(interpupillary_ratio, 2)
    }

    # Save the results to a JSON file
    with open('facial_metrics.json', 'w') as json_file:
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

# Display tessellation
plt.figure(figsize=(15, 15))
plt.imshow(img_tessellation)
plt.title('Face Mesh Tessellation')
plt.show()