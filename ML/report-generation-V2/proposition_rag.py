import os
from dotenv import load_dotenv
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from langchain_community.vectorstores import FAISS
from langchain_google_vertexai import VertexAIEmbeddings
from google.cloud import aiplatform
from typing import List
from langchain_core.prompts import ChatPromptTemplate, FewShotChatMessagePromptTemplate
# from langchain_core.pydantic_v1 import BaseModel, Field
from pydantic import BaseModel, Field
from langchain.chat_models import init_chat_model
from langchain_anthropic import ChatAnthropic

load_dotenv()

if not os.getenv('ANTHROPIC_API_KEY'):
    os.environ["ANTHROPIC_API_KEY"] = input("Please enter your Anthropic API key: ")
else:
    os.environ["ANTHROPIC_API_KEY"] = os.getenv('ANTHROPIC_API_KEY')

sample_content = """Paul Graham's essay "Founder Mode," published in September 2024, challenges conventional wisdom about scaling startups, arguing that founders should maintain their unique management style rather than adopting traditional corporate practices as their companies grow.
Conventional Wisdom vs. Founder Mode
The essay argues that the traditional advice given to growing companies—hiring good people and giving them autonomy—often fails when applied to startups.
This approach, suitable for established companies, can be detrimental to startups where the founder's vision and direct involvement are crucial. "Founder Mode" is presented as an emerging paradigm that is not yet fully understood or documented, contrasting with the conventional "manager mode" often advised by business schools and professional managers.
Unique Founder Abilities
Founders possess unique insights and abilities that professional managers do not, primarily because they have a deep understanding of their company's vision and culture.
Graham suggests that founders should leverage these strengths rather than conform to traditional managerial practices. "Founder Mode" is an emerging paradigm that is not yet fully understood or documented, with Graham hoping that over time, it will become as well-understood as the traditional manager mode, allowing founders to maintain their unique approach even as their companies scale.
Challenges of Scaling Startups
As startups grow, there is a common belief that they must transition to a more structured managerial approach. However, many founders have found this transition problematic, as it often leads to a loss of the innovative and agile spirit that drove the startup's initial success.
Brian Chesky, co-founder of Airbnb, shared his experience of being advised to run the company in a traditional managerial style, which led to poor outcomes. He eventually found success by adopting a different approach, influenced by how Steve Jobs managed Apple.
Steve Jobs' Management Style
Steve Jobs' management approach at Apple served as inspiration for Brian Chesky's "Founder Mode" at Airbnb. One notable practice was Jobs' annual retreat for the 100 most important people at Apple, regardless of their position on the organizational chart
. This unconventional method allowed Jobs to maintain a startup-like environment even as Apple grew, fostering innovation and direct communication across hierarchical levels. Such practices emphasize the importance of founders staying deeply involved in their companies' operations, challenging the traditional notion of delegating responsibilities to professional managers as companies scale.
"""

def initialize_vertex_ai():
    project_id = os.getenv('GOOGLE_CLOUD_PROJECT')
    if not project_id:
        raise ValueError("Please set GOOGLE_CLOUD_PROJECT in your .env file")
    aiplatform.init(project = project_id)

embedding_model = VertexAIEmbeddings(
    model="textembedding-gecko@003",
    project=os.getenv('GOOGLE_CLOUD_PROJECT')
)

docs_list = [Document(page_content=sample_content, metadata={"Title": "Paul Graham's Founder Mode Essay", "Source": "https://www.perplexity.ai/page/paul-graham-s-founder-mode-ess-t9TCyvkqRiyMQJWsHr0fnQ"})]

text_splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
    chunk_size=200, chunk_overlap=50
)

doc_splits = text_splitter.split_documents(docs_list)

for i, doc in enumerate(doc_splits):
    doc.metadata['chunk_id'] = i+1

class GeneratePropositions(BaseModel):
    propositions: List[str] = Field(
        description = "List of propositions (factual, self-contained, and concise information)"
    )

llm = init_chat_model("claude-3-5-sonnet-latest", model_kwargs={"model_provider": "anthropic"})
structured_llm = llm.with_structured_output(GeneratePropositions)

proposition_examples = [
    {"document": 
        "In 1969, Neil Armstrong became the first person to walk on the Moon during the Apollo 11 mission.", 
     "propositions": 
        "['Neil Armstrong was an astronaut.', 'Neil Armstrong walked on the Moon in 1969.', 'Neil Armstrong was the first person to walk on the Moon.', 'Neil Armstrong walked on the Moon during the Apollo 11 mission.', 'The Apollo 11 mission occurred in 1969.']"
    },
]

example_proposition_prompt = ChatPromptTemplate.from_messages(
    [
        ("human", "{document}"),
        ("ai", "{propositions}"),
    ]
)

few_shot_prompt = FewShotChatMessagePromptTemplate(
    example_prompt = example_proposition_prompt,
    examples = proposition_examples,
)

system = """Please break down the following text into simple, self-contained propositions. Ensure that each proposition meets the following criteria:

    1. Express a Single Fact: Each proposition should state one specific fact or claim.
    2. Be Understandable Without Context: The proposition should be self-contained, meaning it can be understood without needing additional context.
    3. Use Full Names, Not Pronouns: Avoid pronouns or ambiguous references; use full entity names.
    4. Include Relevant Dates/Qualifiers: If applicable, include necessary dates, times, and qualifiers to make the fact precise.
    5. Contain One Subject-Predicate Relationship: Focus on a single subject and its corresponding action or attribute, without conjunctions or multiple clauses."""
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system),
        few_shot_prompt,
        ("human", "{document}"),
    ]
)

proposition_generator = prompt | structured_llm

propositions = []

for i in range(len(doc_splits)):
    response = proposition_generator.invoke({"document": doc_splits[i].page_content}) # Creating proposition
    for proposition in response.propositions:
        propositions.append(Document(page_content=proposition, metadata={"Title": "Paul Graham's Founder Mode Essay", "Source": "https://www.perplexity.ai/page/paul-graham-s-founder-mode-ess-t9TCyvkqRiyMQJWsHr0fnQ", "chunk_id": i+1}))

# Data model
class GradePropositions(BaseModel):
    """Grade a given proposition on accuracy, clarity, completeness, and conciseness"""

    accuracy: int = Field(
        description="Rate from 1-10 based on how well the proposition reflects the original text."
    )
    
    clarity: int = Field(
        description="Rate from 1-10 based on how easy it is to understand the proposition without additional context."
    )

    completeness: int = Field(
        description="Rate from 1-10 based on whether the proposition includes necessary details (e.g., dates, qualifiers)."
    )

    conciseness: int = Field(
        description="Rate from 1-10 based on whether the proposition is concise without losing important information."
    )

# LLM with function call
llm = ChatAnthropic(model="claude-3-5-sonnet-latest")
structured_llm= llm.with_structured_output(GradePropositions)

# Prompt
evaluation_prompt_template = """
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
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", evaluation_prompt_template),
        ("human", "{proposition}, {original_text}"),
    ]
)

proposition_evaluator = prompt | structured_llm

# Define evaluation categories and thresholds
evaluation_categories = ["accuracy", "clarity", "completeness", "conciseness"]
thresholds = {"accuracy": 7, "clarity": 7, "completeness": 7, "conciseness": 7}

# Function to evaluate proposition
def evaluate_proposition(proposition, original_text):
    response = proposition_evaluator.invoke({"proposition": proposition, "original_text": original_text})
    
    # Parse the response to extract scores
    scores = {"accuracy": response.accuracy, "clarity": response.clarity, "completeness": response.completeness, "conciseness": response.conciseness}  # Implement function to extract scores from the LLM response
    return scores

# Check if the proposition passes the quality check
def passes_quality_check(scores):
    for category, score in scores.items():
        if score < thresholds[category]:
            return False
    return True

evaluated_propositions = [] # Store all the propositions from the document

# Loop through generated propositions and evaluate them
for idx, proposition in enumerate(propositions):
    scores = evaluate_proposition(proposition.page_content, doc_splits[proposition.metadata['chunk_id'] - 1].page_content)
    if passes_quality_check(scores):
        # Proposition passes quality check, keep it
        evaluated_propositions.append(proposition)
    else:
        # Proposition fails, discard or flag for further review
        print(f"{idx+1}) Propostion: {proposition.page_content} \n Scores: {scores}")
        print("Fail")

# Add to vectorstore
vectorstore_propositions = FAISS.from_documents(evaluated_propositions, embedding_model)
retriever_propositions = vectorstore_propositions.as_retriever(
                search_type="similarity",
                search_kwargs={'k': 4}, # number of documents to retrieve
            )

query = "Who's management approach served as inspiartion for Brian Chesky's \"Founder Mode\" at Airbnb?"
res_proposition = retriever_propositions.invoke(query)

for i, r in enumerate(res_proposition):
    print(f"{i+1}) Content: {r.page_content} --- Chunk_id: {r.metadata['chunk_id']}")

# Add to vectorstore_larger_
vectorstore_larger = FAISS.from_documents(doc_splits, embedding_model)
retriever_larger = vectorstore_larger.as_retriever(
                search_type="similarity",
                search_kwargs={'k': 4}, # number of documents to retrieve
            )

res_larger = retriever_larger.invoke(query)

for i, r in enumerate(res_larger):
    print(f"{i+1}) Content: {r.page_content} --- Chunk_id: {r.metadata['chunk_id']}")

test_query_1 = "what is the essay \"Founder Mode\" about?"
res_proposition = retriever_propositions.invoke(test_query_1)
res_larger = retriever_larger.invoke(test_query_1)