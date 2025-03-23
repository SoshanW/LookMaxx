import os
import sys
from dotenv import load_dotenv
from langchain_google_vertexai import VertexAIEmbeddings
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from google.cloud import aiplatform

load_dotenv()

if not os.getenv('ANTHROPIC_API_KEY'):
    os.environ["ANTHROPIC_API_KEY"] = input("Please enter your Antropic API key: ")
else:
    os.environ["ANTHROPIC_API_KEY"] = os.getenv('ANTHROPIC_API_KEY')

def initialize_vertex_ai():
    project_id = os.getenv('GOOGLE_CLOUD_PROJECT')
    if not project_id:
        raise ValueError("Please set GOOGLE_CLOUD_PROJECT in your .env file")
    aiplatform.init(project=project_id)

def replace_t_with_space(list_of_documents):
    for doc in list_of_documents:
        doc.page_content = doc.page_content.replace('\t', ' ')
    return list_of_documents

def encode_pdf(path, chunk_size=1000, chunk_overlap=200):
    try:
        loader = PyPDFLoader(path)
        documents = loader.load()

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size, chunk_overlap=chunk_overlap, length_function=len
        )
        texts = text_splitter.split_documents(documents)
        cleaned_texts = replace_t_with_space(texts)

        embeddings = VertexAIEmbeddings(
            model="text-embedding-004",
            project=os.getenv('GOOGLE_CLOUD_PROJECT')
        )

        vectorstore = FAISS.from_documents(cleaned_texts, embeddings)

        return vectorstore
    except Exception as e:
        print(f"Error in encode_pdf: {str(e)}")
        raise

def retireve_context_per_question(question, chunks_query_retriever):
    docs = chunks_query_retriever.get_relevant_documents(question)

    context = [doc.page_content for doc in docs]

    return context

def show_context(context):
    for i, c in enumerate(context):
        print(f"Context {i + 1}:")
        print(c)
        print("\n")

if __name__ == "__main__":
    path = "data/Understanding_Climate_Change.pdf"

    initialize_vertex_ai()

    chunks_vector_store = encode_pdf(path, chunk_size=1000, chunk_overlap=200)

    chunks_query_retriever = chunks_vector_store.as_retriever(search_kwargs={"k": 2})

    test_query = "what is the main cause of climate change?"
    context = retireve_context_per_question(test_query, chunks_query_retriever)
    show_context(context)