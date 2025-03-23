import os
import json
import pytest
from ML.facial_landmark_detection.ffr import comparison_report

# Patch upload_to_s3 to avoid external calls
def dummy_upload_to_s3(local_file, s3_file):
    # Return success and dummy S3 settings
    return True, "dummy_bucket", "dummy_region"

@pytest.fixture(autouse=True)
def patch_upload(monkeypatch):
    monkeypatch.setattr(comparison_report, "upload_to_s3", dummy_upload_to_s3)
    # Also patch plt.savefig to avoid creating a file during tests
    monkeypatch.setattr(comparison_report.plt, "savefig", lambda path: None)

# To avoid writing files to disk, you could also patch open. Here we let it write and then remove the file.
@pytest.fixture(autouse=True)
def cleanup_report_file():
    report_path = "./reports/comparison_report.json"
    yield
    if os.path.exists(report_path):
        os.remove(report_path)

def test_generate_comparison_report():
    # Prepare dummy facial metrics (calculated ratios)
    facial_metrics = {
        "face_ratio": 1.0,
        "upper_ratio": 0.2,
        "middle_ratio": 0.3,
        "lower_ratio": 0.5,
        "left_eye_ratio": 0.3,
        "interpupillary_ratio": 0.35,
        "nasal_ratio": 1.2,
        "lip_ratio": 0.8
    }
    username = "testuser"
    gender = "male"  # This will select the male perfect ratios

    # Optionally set the environment variable used in the function:
    os.environ["S3_FFR_PICTURES_GENERATED"] = "ffr-pic-output/"

    # Generate the report
    result = comparison_report.generate_comparison_report(facial_metrics, username, gender)
    
    # Check that the returned dictionary has the expected keys
    assert "comparison_data" in result
    assert "visualization_path" in result
    assert "s3_visualization_path" in result
    
    # Check that the s3_visualization_path is constructed correctly.
    expected_s3_url = f"https://dummy_bucket.s3.dummy_region.amazonaws.com/ffr-pic-output/{username}_comparison_report.png"
    assert result["s3_visualization_path"] == expected_s3_url
    
    # Verify that the comparison_report.json file was written
    with open("./reports/comparison_report.json", "r") as f:
        data = json.load(f)
    # Check that the JSON data is a list and has entries with keys like 'Metric', 'Calculated', 'Perfect'
    assert isinstance(data, list)
    for entry in data:
        assert "Metric" in entry
        assert "Calculated" in entry
        assert "Perfect" in entry