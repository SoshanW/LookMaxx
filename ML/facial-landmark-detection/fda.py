import mediapipe
import cv2
import matplotlib.pyplot as plt
import os

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

# Optional: If you want to save the results
# cv2.imwrite('facial_landmarks.jpg', cv2.cvtColor(img, cv2.COLOR_RGB2BGR))
# cv2.imwrite('face_mesh.jpg', cv2.cvtColor(img_tessellation, cv2.COLOR_RGB2BGR))