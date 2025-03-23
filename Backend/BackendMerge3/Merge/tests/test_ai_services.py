import pytest
from ML.report_generation_V2.services.ai_service import AISerivce

# A dummy LLM class to simulate the language model.
class DummyLLM:
    def with_structured_output(self, schema):
        return self

# Dummy aiplatform.init function.
def dummy_init(project):
    pass

@pytest.fixture(autouse=True)
def patch_aiplatform(monkeypatch):
    import ML.report_generation_V2.services.ai_service as ai_service
    monkeypatch.setattr(ai_service, "aiplatform", type("dummy", (), {"init": dummy_init}))
    
    # Replace VertexAIEmbeddings and ChatAnthropic with dummy functions.
    class DummyEmbedding:
        pass
    class DummyLLMProvider:
        def __init__(self, **kwargs):
            pass

    monkeypatch.setattr(ai_service, "VertexAIEmbeddings", lambda model, project: DummyEmbedding())
    monkeypatch.setattr(ai_service, "ChatAnthropic", lambda model: DummyLLM())

def test_ai_service_initialization():
    service = AISerivce("dummy_project")
    # Ensure that the service has been initialized and required attributes are set.
    assert hasattr(service, "embedding_model")
    assert hasattr(service, "llm")
