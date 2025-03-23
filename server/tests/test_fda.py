import os
import numpy as np
import cv2
import matplotlib.pyplot as plt
import tempfile
import pytest

# Import the functions to test
from ML.facial_landmark_detection.ffr.fda import (
    calculate_face_ratio,
    calculate_facial_thirds,
    calculate_eye_ratios,
    calculate_nasal_index,
    calculate_lip_ratio,
    save_image
)

# Create dummy classes to simulate mediapipe landmarks
class DummyLandmark:
    def __init__(self, x, y):
        self.x = x
        self.y = y

class DummyLandmarks:
    def __init__(self, landmarks):
        self.landmark = landmarks

# A helper fixture to patch out save_image (so it doesn’t actually write files)
@pytest.fixture(autouse=True)
def patch_save_image(monkeypatch):
    def dummy_save_image(image, filename):
        # Instead of saving, we simply return the filename.
        return filename
    monkeypatch.setattr("ML.facial_landmark_detection.ffr.fda.save_image", dummy_save_image)

# Test for calculate_face_ratio
def test_calculate_face_ratio():
    # Create dummy landmarks: simulate a face with width=100 and height=200
    # For simplicity, use 5 dummy points that give a clear min and max.
    dummy_points = [
        DummyLandmark(0.0, 0.0),
        DummyLandmark(0.5, 0.5),
        DummyLandmark(1.0, 0.0),
        DummyLandmark(0.0, 1.0),
        DummyLandmark(1.0, 1.0)
    ]
    landmarks = DummyLandmarks(dummy_points)
    # Assume image shape (height, width, channels)
    img_shape = (200, 100, 3)
    # Create a dummy base image (black image)
    img_base = np.zeros((200, 100, 3), dtype=np.uint8)
    
    # Expected width = 100 - 0 = 100, height = 200 - 0 = 200 so ratio=0.5
    ratio = calculate_face_ratio(landmarks, img_shape, img_base)
    assert abs(ratio - 0.5) < 1e-6

# Test for calculate_facial_thirds
def test_calculate_facial_thirds():
    # Create dummy landmarks with at least 100 points.
    # For simplicity, assign x=50 for all and y = 0, 1, 2, ..., 99.
    dummy_points = [DummyLandmark(0.5, i / 100) for i in range(100)]
    landmarks = DummyLandmarks(dummy_points)
    img_shape = (100, 100, 3)
    img_base = np.zeros((100, 100, 3), dtype=np.uint8)
    
    # In our dummy:
    # y_coords = [0, 1, ..., 99]
    # forehead = min(y_coords[10:20]) = 0.10 * 100 = 10
    # eyebrow = y_coords[70] = 70
    # nose_bottom = y_coords[94] = 94
    # chin = max(y_coords) = 99
    # face_height = 99 - 0 = 99
    # Expected upper_ratio = (70-10)/99, middle_ratio = (94-70)/99, lower_ratio = (99-94)/99
    upper_ratio, middle_ratio, lower_ratio = calculate_facial_thirds(landmarks, img_shape, img_base)
    assert abs(upper_ratio - ((70-10)/99)) < 1e-6
    assert abs(middle_ratio - ((94-70)/99)) < 1e-6
    assert abs(lower_ratio - ((99-94)/99)) < 1e-6

# Test for calculate_eye_ratios
def test_calculate_eye_ratios():
    # Create a list with at least 400 dummy landmarks and set specific indices:
    dummy_points = [DummyLandmark(0.0, 0.0) for _ in range(400)]
    # Set specific values for the indices used:
    # Left eye: index 33 and 133
    dummy_points[33] = DummyLandmark(0.1, 0.1)    # (10, 10) when scaled by width=100
    dummy_points[133] = DummyLandmark(0.2, 0.1)   # (20, 10)
    # Right eye: indices 362 and 263
    dummy_points[362] = DummyLandmark(0.25, 0.1)  # (25, 10)
    dummy_points[263] = DummyLandmark(0.3, 0.1)   # (30, 10)
    
    landmarks = DummyLandmarks(dummy_points)
    img_shape = (100, 100, 3)
    img_base = np.zeros((100, 100, 3), dtype=np.uint8)
    
    left_eye_ratio, interpupillary_ratio = calculate_eye_ratios(landmarks, img_shape, img_base)
    # left_eye_width = 20-10 = 10, total_eye_span = 30-10 = 20, interpupillary = 25-20 = 5
    assert abs(left_eye_ratio - 0.5) < 1e-6
    assert abs(interpupillary_ratio - 0.25) < 1e-6

# Test for calculate_nasal_index
def test_calculate_nasal_index():
    dummy_points = [DummyLandmark(0.0, 0.0) for _ in range(400)]
    # Set for nasal width: landmarks[129] and [358]
    dummy_points[129] = DummyLandmark(0.1, 0.1)   # (10,10)
    dummy_points[358] = DummyLandmark(0.3, 0.1)   # (30,10) => width = 20
    # For nasal height: landmarks[168] and [2]
    dummy_points[168] = DummyLandmark(0.2, 0.0)   # (20,0)
    dummy_points[2] = DummyLandmark(0.2, 0.2)       # (20,20) => height = 20
    landmarks = DummyLandmarks(dummy_points)
    img_shape = (100, 100, 3)
    img_base = np.zeros((100, 100, 3), dtype=np.uint8)
    
    nasal_index = calculate_nasal_index(landmarks, img_shape, img_base)
    # Expected nasal_index = 20/20 = 1.0
    assert abs(nasal_index - 1.0) < 1e-6

# Test for calculate_lip_ratio
def test_calculate_lip_ratio():
    dummy_points = [DummyLandmark(0.0, 0.0) for _ in range(20)]
    # Set landmarks for upper lip: indices 0 and 13
    dummy_points[0] = DummyLandmark(0.1, 0.1)   # (10,10)
    dummy_points[13] = DummyLandmark(0.1, 0.2)  # (10,20) => upper lip height = 10
    # Set landmarks for lower lip: indices 14 and 17
    dummy_points[14] = DummyLandmark(0.1, 0.2)  # (10,20)
    dummy_points[17] = DummyLandmark(0.1, 0.3)  # (10,30) => lower lip height = 10
    landmarks = DummyLandmarks(dummy_points)
    img_shape = (100, 100, 3)
    img_base = np.zeros((100, 100, 3), dtype=np.uint8)
    
    lip_ratio = calculate_lip_ratio(landmarks, img_shape, img_base)
    # Expected lip_ratio = 10/10 = 1.0
    assert abs(lip_ratio - 1.0) < 1e-6
