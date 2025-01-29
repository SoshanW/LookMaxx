import mediapipe;
import cv2;
import matplotlib.pyplot as plt;
# from mpl_toolkits.mplot3d import Axes3D;

img_base = cv2.imread('dumbImage.jpg')
img = img_base.copy()

mp_face_mesh = mediapipe.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(static_image_mode = True)

results = face_mesh.process(img)
landmarks = results.multi_face_landmarks[0]

xs = []; ys = []; zs = []

for landmark in landmarks.landmark:
    x = landmark.x
    y = landmark.y
    z = landmark.z

    # xs.append(x)
    # ys.append(y)
    # zs.append(z) 

    realtive_x = int(x*img.shape[1])
    realtive_y = int(y*img.shape[0])

    cv2.circle(img, (realtive_x, realtive_y), 5, (0, 0, 255), -1)

fig = plt.figure(figsize=(15, 15))
plt.inshow(img[:,:,::-1])
plt.show()
# fig = plt.figure()
# ax = Axes3D(fig)

# projection = ax.scatter(xs, ys, zs, color = 'green')

# plt.show()

img = img_base.copy()

for source_idx, target_idx in mp_face_mesh.FACEMESH_TESSELATION: 
    source = landmarks.landmark[source_idx]
    target = landmarks.landmark[target_idx]

    relative_source = (int(source.ximg.shape[1]), int(source.yimg.shape[0]))
    relative_target = (int(target.ximg.shape[1]), int(target.yimg.shape[0]))

    cv2.line(img, relative_source, relative_target, (0, 255, 0), 2)

fig = plt.figure(figsize=(15, 15)) 
plt.imshow(img[:,:,::-1])
plt.show()