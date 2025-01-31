import mediapipe
import cv2
import matplotlib.pyplot as plt
import os

def calculate_face_ratio(landmarks, img_shape):
    x_coords = [int(landmark.x * img_shape[1]) for landmark in landmarks.landmark]
    y_coords = [int(landmark.y * img_shape[0]) for landmark in landmarks.landmark]
    width = max(x_coords) - min(x_coords)
    height = max(y_coords) - min(y_coords)
    ratio = width / height

    cv2.rectangle(img, (min(x_coords), min(y_coords)), 
                    (max(x_coords), max(y_coords)), (0, 0, 255), 2)
    cv2.putText(img, f'Ratio: {ratio:.2f}', (min(x_coords), min(y_coords)-10),
                cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 255), 2)
    
    return ratio

def calculate_facial_thirds(landmarks, img_shape):
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
    
    print(f"Forehead y: {forehead}")
    print(f"Eyebrow y: {eyebrow}")
    print(f"Nose y: {nose_bottom}")
    print(f"Chin y: {chin}")
    
    upper_third = eyebrow - forehead
    middle_third = nose_bottom - eyebrow
    lower_third = chin - nose_bottom
    
    upper_ratio = upper_third / face_height
    middle_ratio = middle_third / face_height
    lower_ratio = lower_third / face_height
    
    cv2.line(img, (mid_x, forehead), (mid_x, chin), (255, 0, 0), 2)
    
    line_color = (0, 255, 0)
    text_offset = 50
    
    cv2.line(img, (mid_x - 20, forehead), (mid_x + 20, forehead), line_color, 2)
    cv2.line(img, (mid_x - 20, eyebrow), (mid_x + 20, eyebrow), line_color, 2)
    cv2.putText(img, f'Upper: {upper_ratio:.2f}', (face_right + text_offset, (forehead + eyebrow)//2), 
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, line_color, 2)
    
    cv2.line(img, (mid_x - 20, nose_bottom), (mid_x + 20, nose_bottom), line_color, 2)
    cv2.putText(img, f'Middle: {middle_ratio:.2f}', (face_right + text_offset, (eyebrow + nose_bottom)//2),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, line_color, 2)
    
    cv2.line(img, (mid_x - 20, chin), (mid_x + 20, chin), line_color, 2)
    cv2.putText(img, f'Lower: {lower_ratio:.2f}', (face_right + text_offset, (nose_bottom + chin)//2),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, line_color, 2)
    
    return upper_ratio, middle_ratio, lower_ratio

# Print current working directory and check if file exists
print("Current working directory:", os.getcwd())
print("Looking for image file:", os.path.abspath('dumbImage.jpg'))
print("File exists:", os.path.exists('dumbImage.jpg'))

# Load image with error checking
img_base = cv2.imread('./assets/naflan.jpg')
if img_base is None:
    raise Exception("Error: Could not load image 'dumbImage.jpg'. Please check if the file exists and the path is correct.")

# Convert BGR to RGB for MediaPipe
img = cv2.cvtColor(img_base, cv2.COLOR_BGR2RGB)

# Initialize face mesh
mp_face_mesh = mediapipe.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(static_image_mode=True, min_detection_confidence=0.5)

# Process the image
results = face_mesh.process(img)

# Check if any face was detected
if results.multi_face_landmarks is None:
    print("No face detected in the image")
    plt.figure(figsize=(15, 15))
    plt.imshow(img)
    plt.title('Original Image - No Face Detected')
    plt.show()
    exit()

# Get landmarks
landmarks = results.multi_face_landmarks[0]

# Draw landmarks
for landmark in landmarks.landmark:
    relative_x = int(landmark.x * img.shape[1])
    relative_y = int(landmark.y * img.shape[0])
    cv2.circle(img, (relative_x, relative_y), 5, (255, 0, 0), -1)

# Calculate and display face ratio and thirds
if results.multi_face_landmarks:
    ratio = calculate_face_ratio(landmarks, img.shape)
    upper, middle, lower = calculate_facial_thirds(landmarks, img.shape)
    print(f'Face width-to-height ratio: {ratio:.2f}')
    print(f'Facial thirds ratios - Upper: {upper:.2f}, Middle: {middle:.2f}, Lower: {lower:.2f}')

# Display image with landmarks
fig = plt.figure(figsize=(15, 15))
plt.imshow(img)
plt.title('Facial Landmarks')
plt.show()

# Create a fresh copy for tessellation
img_tessellation = img_base.copy()
img_tessellation = cv2.cvtColor(img_tessellation, cv2.COLOR_BGR2RGB)

# Draw tessellation
for source_idx, target_idx in mp_face_mesh.FACEMESH_TESSELATION:
    source = landmarks.landmark[source_idx]
    target = landmarks.landmark[target_idx]

    relative_source = (int(source.x * img_tessellation.shape[1]), 
                        int(source.y * img_tessellation.shape[0]))
    relative_target = (int(target.x * img_tessellation.shape[1]), 
                        int(target.y * img_tessellation.shape[0]))

    cv2.line(img_tessellation, relative_source, relative_target, (0, 255, 0), 1)

# Display tessellated image
fig = plt.figure(figsize=(15, 15))
plt.imshow(img_tessellation)
plt.title('Face Mesh Tessellation')
plt.show()