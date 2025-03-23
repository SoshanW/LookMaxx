# tests/test_generate_pdf.py

import os
import pytest
from fpdf import FPDF
from ML.report_generation_V2.generate_pdf import generate_pdf

# Define a dummy class that mimics the expected attributes.
class DummyResult:
    def __init__(self, page_content, metadata):
        self.page_content = page_content
        self.metadata = metadata

def test_generate_pdf_creates_file(tmp_path):
    # Create dummy facial metrics as a list of dictionaries (this remains unchanged)
    dummy_facial_metrics = [
        {"Metric": "face_ratio", "Value": 0.8},
        {"Metric": "upper_ratio", "Value": 0.3}
    ]
    # Create dummy proposition and larger results using DummyResult objects.
    dummy_prop_results = [
        DummyResult("Prop result 1", {"chunk_id": 1}),
        DummyResult("Prop result 2", {"chunk_id": 2})
    ]
    dummy_larger_results = [
        DummyResult("Larger result 1", {"chunk_id": 1}),
        DummyResult("Larger result 2", {"chunk_id": 2})
    ]
    
    # Use a temporary file path for the PDF output
    output_file = tmp_path / "test_report.pdf"
    
    # No images for this test
    images = []
    
    # Call generate_pdf with the dummy data.
    generate_pdf(dummy_facial_metrics, dummy_prop_results, dummy_larger_results, str(output_file), images)
    
    # Assert that the file was created and is not empty
    assert output_file.exists()
    assert output_file.stat().st_size > 0
