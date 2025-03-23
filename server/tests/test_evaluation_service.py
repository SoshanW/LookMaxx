import pytest
from ML.report_generation_V2.services.evaluation_service import EvaluationService
from ML.report_generation_V2.models import GradePropositions
from ML.report_generation_V2.models import GeneratePropositions

# Dummy LLM that simulates structured output.
class DummyLLM:
    def with_structured_output(self, schema):
        self.schema = schema
        return self

    def __call__(self, input_data):
        # Simulate a response with fixed dummy evaluation scores.
        class DummyResponse:
            accuracy = 8
            clarity = 8
            completeness = 8
            conciseness = 8
        return DummyResponse()

@pytest.fixture
def eval_service():
    dummy_llm = DummyLLM()
    return EvaluationService(dummy_llm)

def test_evaluate_proposition(eval_service):
    proposition = "Dummy proposition"
    original_text = "Dummy original text"
    scores = eval_service.evaluate_proposition(proposition, original_text)
    # Check that the dummy response is correctly returned.
    assert scores["accuracy"] == 8
    assert scores["clarity"] == 8
    assert scores["completeness"] == 8
    assert scores["conciseness"] == 8

def test_passes_quality_check(eval_service):
    scores = {"accuracy": 8, "clarity": 8, "completeness": 8, "conciseness": 8}
    assert eval_service.passes_quality_check(scores) is True

    scores["clarity"] = 6
    assert eval_service.passes_quality_check(scores) is False
