import pytest
from ML.report_generation_V2.services.vector_store_service import VectorStoreService

# Dummy vector store that provides a retriever with a fixed response.
class DummyVectorStore:
    def as_retriever(self, search_type, search_kwargs):
        class DummyRetriever:
            def invoke(self, query):
                return [{"page_content": "Dummy content", "metadata": {"chunk_id": 1}}]
        return DummyRetriever()

class DummyEmbedding:
    pass

@pytest.fixture(autouse=True)
def patch_faiss(monkeypatch):
    from ML.report_generation_V2.services.vector_store_service import FAISS
    monkeypatch.setattr(FAISS, "from_documents", lambda documents, embedding_model: DummyVectorStore())

def test_create_vector_store():
    dummy_embedding = DummyEmbedding()
    service = VectorStoreService(dummy_embedding)
    dummy_documents = [{"page_content": "Test", "metadata": {"chunk_id": 1}}]
    retriever = service.create_vector_store(dummy_documents)
    results = retriever.invoke("dummy query")
    assert isinstance(results, list)
    assert results[0]["metadata"]["chunk_id"] == 1
