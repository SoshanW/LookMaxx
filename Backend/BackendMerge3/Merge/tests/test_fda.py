import numpy as np
import cv2
import pytest
from math import isclose

# Import the functions to test
from ML.facial_landmark_detection.ffr import fda

# --- Helper classes to simulate MediaPipe landmarks ---

class DummyLandmark:
    def __init__(self, x, y):
        self.x = x
        self.y = y

class DummyLandmarks:
    def __init__(self, landmarks):
        self.landmark = landmarks

# Create a dummy base image (e.g. 100x200 with 3 channels)
@pytest.fixture
def dummy_image():
    return np.zeros((100, 200, 3), dtype=np.uint8)

# Patch out the save_image function so no file is created
@pytest.fixture(autouse=True)
def patch_save_image(monkeypatch):
    monkeypatch.setattr(fda, "save_image", lambda image, filename: None)

# Test for calculate_face_ratio
def test_calculate_face_ratio(dummy_image):
    # Set up two landmarks to simulate a face with known ratio.
    # Using image shape (height=100, width=200)
    # Landmark positions: (0.2, 0.2) and (0.8, 0.9)
    landmarks = DummyLandmarks([
        DummyLandmark(0.2, 0.2),
        DummyLandmark(0.8, 0.9)
    ])
    # Expected calculations:
    # x_coords: 0.2*200=40, 0.8*200=160  => width = 160-40 = 120
    # y_coords: 0.2*100=20, 0.9*100=90    => height = 90-20 = 70
    # Ratio = 120/70 ≈ 1.7143
    ratio = fda.calculate_face_ratio(landmarks, dummy_image.shape, dummy_image)
    assert isclose(ratio, 1.7143, rel_tol=1e-3)

# Test for calculate_facial_thirds
def test_calculate_facial_thirds(dummy_image):
    # Create 100 dummy landmarks with default x value
    # We set specific y values for indices used in calculations:
    # Indices 10-19: forehead region => y = 0.2 (0.2*100 = 20)
    # Index 70 (eyebrow): y = 0.3 (=> 30)
    # Index 94 (nose bottom): y = 0.6 (=> 60)
    # Also, ensure min y is 0 (e.g. index 0) and max y is 1.0 (=> 100) for chin.
    landmarks_list = [DummyLandmark(0.5, 0.5) for _ in range(100)]
    landmarks_list[0] = DummyLandmark(0.5, 0.0)      # min y = 0
    for i in range(10, 20):
        landmarks_list[i] = DummyLandmark(0.5, 0.2)    # forehead
    landmarks_list[70] = DummyLandmark(0.5, 0.3)         # eyebrow
    landmarks_list[94] = DummyLandmark(0.5, 0.6)         # nose bottom
    landmarks_list[-1] = DummyLandmark(0.5, 1.0)         # chin (max y)

    landmarks = DummyLandmarks(landmarks_list)
    # Expected face height = 100 - 0 = 100
    # Upper third: 30 - 20 = 10  => ratio 0.1
    # Middle third: 60 - 30 = 30 => ratio 0.3
    # Lower third: 100 - 60 = 40 => ratio 0.4
    upper, middle, lower = fda.calculate_facial_thirds(landmarks, dummy_image.shape, dummy_image)
    assert isclose(upper, 0.1, rel_tol=1e-3)
    assert isclose(middle, 0.3, rel_tol=1e-3)
    assert isclose(lower, 0.4, rel_tol=1e-3)

# Test for calculate_eye_ratios
def test_calculate_eye_ratios(dummy_image):
    # Create dummy landmarks with at least 400 points.
    landmarks_list = [DummyLandmark(0.5, 0.5) for _ in range(400)]
    # Set indices for left and right eye corners:
    # Left eye: index 33 (left_outer) and index 133 (left_inner)
    landmarks_list[33] = DummyLandmark(0.4, 0.4)    # left outer → 0.4*200 = 80
    landmarks_list[133] = DummyLandmark(0.45, 0.4)    # left inner → 0.45*200 = 90
    # Right eye: index 362 (right_inner) and index 263 (right_outer)
    landmarks_list[362] = DummyLandmark(0.55, 0.4)    # right inner → 0.55*200 = 110
    landmarks_list[263] = DummyLandmark(0.6, 0.4)     # right outer → 0.6*200 = 120

    landmarks = DummyLandmarks(landmarks_list)
    # Expected:
    # left_eye_width = 90 - 80 = 10
    # total_eye_span = 120 - 80 = 40  → left_eye_ratio = 10/40 = 0.25
    # interpupillary distance = 110 - 90 = 20 → interpupillary_ratio = 20/40 = 0.5
    left_eye_ratio, interpupillary_ratio = fda.calculate_eye_ratios(landmarks, dummy_image.shape, dummy_image)
    assert isclose(left_eye_ratio, 0.25, rel_tol=1e-3)
    assert isclose(interpupillary_ratio, 0.5, rel_tol=1e-3)

# Test for calculate_nasal_index
def test_calculate_nasal_index(dummy_image):
    # Create dummy landmarks with at least 360 elements.
    landmarks_list = [DummyLandmark(0.5, 0.5) for _ in range(400)]
    # Set required indices:
    # Index 129 (left ala): (0.3, 0.5) → (0.3*200, 0.5*100) = (60, 50)
    # Index 358 (right ala): (0.7, 0.5) → (140, 50)
    # Index 168 (nasion): (0.5, 0.3) → (100, 30)
    # Index 2 (subnasale): (0.5, 0.6) → (100, 60)
    landmarks_list[129] = DummyLandmark(0.3, 0.5)
    landmarks_list[358] = DummyLandmark(0.7, 0.5)
    landmarks_list[168] = DummyLandmark(0.5, 0.3)
    landmarks_list[2] = DummyLandmark(0.5, 0.6)
    landmarks = DummyLandmarks(landmarks_list)
    # Calculation:
    # Nasal width = 140 - 60 = 80
    # Nose height = 60 - 30 = 30
    # Nasal index = 80/30 ≈ 2.667
    nasal_index = fda.calculate_nasal_index(landmarks, dummy_image.shape, dummy_image)
    assert isclose(nasal_index, 2.667, rel_tol=1e-3)

# Test for calculate_lip_ratio
def test_calculate_lip_ratio(dummy_image):
    # Create dummy landmarks with at least 18 elements.
    landmarks_list = [DummyLandmark(0.5, 0.5) for _ in range(20)]
    # Set required indices:
    # For upper lip: index 0 and index 13.
    # For lower lip: index 14 and index 17.
    # We choose values such that:
    # upper lip: y from 0.4 to 0.5 → (0.4*100=40, 0.5*100=50) → height = 10
    # lower lip: y from 0.55 to 0.7 → (55 and 70) → height = 15
    landmarks_list[0] = DummyLandmark(0.25, 0.4)
    landmarks_list[13] = DummyLandmark(0.25, 0.5)
    landmarks_list[14] = DummyLandmark(0.25, 0.55)
    landmarks_list[17] = DummyLandmark(0.25, 0.7)
    landmarks = DummyLandmarks(landmarks_list)
    # Expected lip ratio = 10 / 15 ≈ 0.667
    lip_ratio = fda.calculate_lip_ratio(landmarks, dummy_image.shape, dummy_image)
    assert isclose(lip_ratio, 0.667, rel_tol=1e-3)
