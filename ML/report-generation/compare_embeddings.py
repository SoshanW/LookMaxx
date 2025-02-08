from langchain.document_loaders import DirectoryLoader

# Global Variables
DATA_PATH = "data"

def load_documents():
    loader = DirectoryLoader(DATA_PATH, glob="*.md")
    documents = loader.load()
    return documents