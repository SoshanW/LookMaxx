import pytest
from ML.report_generation_V2.services.text_splitter_service import TextSplitterService
from langchain_core.documents import Document  # Assuming this is available

def test_split_documents():
    service = TextSplitterService(chunk_size=50, chunk_overlap=10)
    # Create a dummy document.
    doc = Document(page_content="a " * 100, metadata={"Title": "Test"})
    docs_list = [doc]
    
    splitted_docs = service.split_documents(docs_list)
    # Each split document should contain a 'chunk_id' in its metadata.
    assert isinstance(splitted_docs, list)
    for d in splitted_docs:
        assert "chunk_id" in d.metadata
