from langchain_core.prompts import ChatPromptTemplate, FewShotChatMessagePromptTemplate
from models import GeneratePropositions
from langchain_core.documents import Document

class PropositionService:
    def __init__(self, llm, examples):
        self.llm = llm
        self.structured_llm = llm.with_structured_output(GeneratePropositions)
        self.setup_prompts(examples)
    
    def setup_prompts(self, examples):
        example_prompt = ChatPromptTemplate.from_messages([
            ("human", "{document}"),
            ("ai", "{propositions}"),
        ])
        
        few_shot_prompt = FewShotChatMessagePromptTemplate(
            example_prompt=example_prompt,
            examples=examples
        )
        
        system_message = """Please break down the following text into simple, self-contained propositions. Ensure that each proposition meets the following criteria:

        1. Express a Single Fact: Each proposition should state one specific fact or claim.
        2. Be Understandable Without Context: The proposition should be self-contained, meaning it can be understood without needing additional context.
        3. Use Full Names, Not Pronouns: Avoid pronouns or ambiguous references; use full entity names.
        4. Include Relevant Dates/Qualifiers: If applicable, include necessary dates, times, and qualifiers to make the fact precise.
        5. Contain One Subject-Predicate Relationship: Focus on a single subject and its corresponding action or attribute, without conjunctions or multiple clauses."""
        
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", system_message),
            few_shot_prompt,
            ("human", "{document}"),
        ])
        
        self.proposition_generator = self.prompt | self.structured_llm
    
    def generate_propositions(self, doc_splits):
        propositions = []
        for i, doc in enumerate(doc_splits):
            response = self.proposition_generator.invoke({"document": doc.page_content})
            for proposition in response.propositions:
                propositions.append(Document(
                    page_content=proposition,
                    metadata={
                        # "Title": doc.metadata["Title"],
                        # "Source": doc.metadata["Source"],
                        "chunk_id": i+1
                    }
                ))
        return propositions