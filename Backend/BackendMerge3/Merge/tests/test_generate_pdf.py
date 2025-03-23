import os
from pathlib import Path
import pytest
from ML.report_generation_V2.generate_pdf import generate_pdf

# Dummy result class to simulate document results.
class DummyResult:
    def __init__(self, page_content, metadata):
        self.page_content = page_content
        self.metadata = metadata

@pytest.fixture
def dummy_prop_results():
    return [
        DummyResult("Proposition content 1", {"chunk_id": 1}),
        DummyResult("Proposition content 2", {"chunk_id": 2})
    ]

@pytest.fixture
def dummy_larger_results():
    return [
        DummyResult("Larger context content 1", {"chunk_id": 1}),
        DummyResult("Larger context content 2", {"chunk_id": 2})
    ]

def test_generate_pdf_creates_file(tmp_path, dummy_prop_results, dummy_larger_results):
    output_file = tmp_path / "test_report.pdf"
    images = []  # No images for this test

    # Invoke the PDF generation.
    generate_pdf(dummy_prop_results, dummy_larger_results, str(output_file), images)

    # Verify the PDF was created and has content.
    assert output_file.exists()
    assert output_file.stat().st_size > 0
