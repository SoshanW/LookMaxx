from langchain.text_splitter import RecursiveCharacterTextSplitter

class TextSplitterService:
    def __init__(self, chunk_size=200, chunk_overlap=50):
        self.text_splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap
        )
    
    def split_documents(self, docs_list):
        doc_splits = self.text_splitter.split_documents(docs_list)
        for i, doc in enumerate(doc_splits):
            doc.metadata['chunk_id'] = i+1
        return doc_splits