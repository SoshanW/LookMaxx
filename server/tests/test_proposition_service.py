import pytest
from ML.report_generation_V2.services.proposition_service import PropositionService
from ML.report_generation_V2.models import GradePropositions
from ML.report_generation_V2.models import GeneratePropositions
from ML.report_generation_V2.services.proposition_service import Document  # Assuming Document is imported correctly

# Dummy LLM that returns a fixed proposition.
class DummyLLM:
    def with_structured_output(self, schema):
        self.schema = schema
        return self

    def __call__(self, input_data):
        # Simulate a response that includes a 'propositions' attribute.
        class DummyResponse:
            def __init__(self):
                self.propositions = ["Dummy proposition generated."]
        return DummyResponse()

@pytest.fixture
def prop_service():
    dummy_llm = DummyLLM()
    examples = []  # No examples required for dummy testing.
    return PropositionService(dummy_llm, examples)

def test_generate_propositions(prop_service):
    # Create a dummy document.
    dummy_doc = type("DummyDoc", (), {})()
    dummy_doc.page_content = "Test document content for propositions."
    dummy_doc.metadata = {}
    docs_list = [dummy_doc]
    
    propositions = prop_service.generate_propositions(docs_list)
    # Verify that at least one proposition is generated and contains the chunk_id metadata.
    assert len(propositions) > 0
    for doc in propositions:
        assert "chunk_id" in doc.metadata
