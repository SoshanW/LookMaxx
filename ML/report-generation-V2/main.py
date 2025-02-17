from config import Config
from services.ai_service import AISerivce
from services.text_splitter_service import TextSplitterService
from services.proposition_service import PropositionService
from services.evaluation_service import EvaluationService
from services.vector_store_service import VectorStoreService
from langchain_core.documents import Document

def main():
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

    proposition_examples = [
        {"document": 
            "In 1969, Neil Armstrong became the first person to walk on the Moon during the Apollo 11 mission.", 
        "propositions": 
            "['Neil Armstrong was an astronaut.', 'Neil Armstrong walked on the Moon in 1969.', 'Neil Armstrong was the first person to walk on the Moon.', 'Neil Armstrong walked on the Moon during the Apollo 11 mission.', 'The Apollo 11 mission occurred in 1969.']"
        },
    ]
    config = Config()
    
    ai_service = AISerivce(config.project_id)
    text_splitter = TextSplitterService()
    proposition_service = PropositionService(ai_service.llm, proposition_examples)
    evaluation_service = EvaluationService(ai_service.llm)
    vector_store_service = VectorStoreService(ai_service.embedding_model)
    
    docs_list = [Document(
        page_content=sample_content,
        metadata={
            "Title": "Paul Graham's Founder Mode Essay",
            "Source": "https://www.perplexity.ai/page/paul-graham-s-founder-mode-ess-t9TCyvkqRiyMQJWsHr0fnQ"
        }
    )]
    
    doc_splits = text_splitter.split_documents(docs_list)
    
    propositions = proposition_service.generate_propositions(doc_splits)
    evaluated_propositions = []
    
    for proposition in propositions:
        scores = evaluation_service.evaluate_proposition(
            proposition.page_content,
            doc_splits[proposition.metadata['chunk_id'] - 1].page_content
        )
        
        if evaluation_service.passes_quality_check(scores):
            evaluated_propositions.append(proposition)
        else:
            print(f"Failed proposition: {proposition.page_content}\nScores: {scores}")
    
    retriever_propositions = vector_store_service.create_vector_store(evaluated_propositions)
    retriever_larger = vector_store_service.create_vector_store(doc_splits)
    
    query = "Who's management approach served as inspiration for Brian Chesky's \"Founder Mode\" at Airbnb?"
    test_query = "what is the essay \"Founder Mode\" about?"
    
    for query in [query, test_query]:
        print(f"\nQuery: {query}")
        
        prop_results = retriever_propositions.invoke(query)
        larger_results = retriever_larger.invoke(query)
        
        print("\nProposition results:")
        for i, r in enumerate(prop_results):
            print(f"{i+1}) {r.page_content} --- Chunk_id: {r.metadata['chunk_id']}")
        
        print("\nLarger context results:")
        for i, r in enumerate(larger_results):
            print(f"{i+1}) {r.page_content} --- Chunk_id: {r.metadata['chunk_id']}")

if __name__ == "__main__":
    main()