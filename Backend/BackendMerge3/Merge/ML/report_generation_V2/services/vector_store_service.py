from langchain_community.vectorstores import FAISS

class VectorStoreService:
    def __init__(self, embedding_model):
        self.embedding_model = embedding_model
    
    def create_vector_store(self, documents, k=4):
        vectorstore = FAISS.from_documents(documents, self.embedding_model)
        return vectorstore.as_retriever(
            search_type="similarity",
            search_kwargs={'k': k}
        )