import mediapipe
import cv2
import matplotlib.pyplot as plt

# Load and check image
img_base = cv2.imread('1.jpg')
if img_base is None:
    raise Exception("Error: Image not found or could not be read")
    
# Convert BGR to RGB (MediaPipe expects RGB format)
img = cv2.cvtColor(img_base, cv2.COLOR_BGR2RGB)

# Initialize face mesh
mp_face_mesh = mediapipe.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(static_image_mode=True, min_detection_confidence=0.5)

# Process the image
results = face_mesh.process(img)

# Check if any face was detected
if results.multi_face_landmarks is None:
    print("No face detected in the image")
    # Display the original image for debugging
    plt.imshow(cv2.cvtColor(img_base, cv2.COLOR_BGR2RGB))
    plt.title('Original Image - No Face Detected')
    plt.show()
    exit()

# Get landmarks
landmarks = results.multi_face_landmarks[0]

# Draw landmarks on image
for landmark in landmarks.landmark:
    relative_x = int(landmark.x * img.shape[1])
    relative_y = int(landmark.y * img.shape[0])
    cv2.circle(img, (relative_x, relative_y), 2, (0, 0, 255), -1)

# Display result
plt.figure(figsize=(10, 10))
plt.imshow(img)
plt.title('Face Landmarks')
plt.show()