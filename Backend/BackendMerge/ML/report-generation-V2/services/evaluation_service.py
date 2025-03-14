from models import GradePropositions
from langchain_core.prompts import ChatPromptTemplate

class EvaluationService:
    def __init__(self, llm):
        self.llm = llm
        self.structured_llm = llm.with_structured_output(GradePropositions)
        self.setup_evaluation()
    
    def setup_evaluation(self):
        evaluation_template = """
        Please evaluate the following proposition based on the criteria below:
        - **Accuracy**: Rate from 1-10 based on how well the proposition reflects the original text.
        - **Clarity**: Rate from 1-10 based on how easy it is to understand the proposition without additional context.
        - **Completeness**: Rate from 1-10 based on whether the proposition includes necessary details (e.g., dates, qualifiers).
        - **Conciseness**: Rate from 1-10 based on whether the proposition is concise without losing important information.

        Example:
        Docs: In 1969, Neil Armstrong became the first person to walk on the Moon during the Apollo 11 mission.

        Propositons_1: Neil Armstrong was an astronaut.
        Evaluation_1: "accuracy": 10, "clarity": 10, "completeness": 10, "conciseness": 10

        Propositons_2: Neil Armstrong walked on the Moon in 1969.
        Evaluation_3: "accuracy": 10, "clarity": 10, "completeness": 10, "conciseness": 10

        Propositons_3: Neil Armstrong was the first person to walk on the Moon.
        Evaluation_3: "accuracy": 10, "clarity": 10, "completeness": 10, "conciseness": 10

        Propositons_4: Neil Armstrong walked on the Moon during the Apollo 11 mission.
        Evaluation_4: "accuracy": 10, "clarity": 10, "completeness": 10, "conciseness": 10

        Propositons_5: The Apollo 11 mission occurred in 1969.
        Evaluation_5: "accuracy": 10, "clarity": 10, "completeness": 10, "conciseness": 10

        Format:
        Proposition: "{proposition}"
        Original Text: "{original_text}"
        """
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", evaluation_template),
            ("human", "{proposition}, {original_text}"),
        ])
        self.evaluator = self.prompt | self.structured_llm
        
        self.thresholds = {
            "accuracy": 7,
            "clarity": 7,
            "completeness": 7,
            "conciseness": 7
        }
    
    def evaluate_proposition(self, proposition, original_text):
        response = self.evaluator.invoke({
            "proposition": proposition,
            "original_text": original_text
        })
        return {
            "accuracy": response.accuracy,
            "clarity": response.clarity,
            "completeness": response.completeness,
            "conciseness": response.conciseness
        }
    
    def passes_quality_check(self, scores):
        return all(scores[category] >= threshold
                  for category, threshold in self.thresholds.items())