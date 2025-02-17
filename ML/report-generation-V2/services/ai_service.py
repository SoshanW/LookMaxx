from google.cloud import aiplatform
from langchain_google_vertexai import VertexAIEmbeddings
from langchain_anthropic import ChatAnthropic

class AISerivce:
    def __init__(self, project_id):
        self.project_id = project_id
        self.initialize_vertex_ai()
        self.setup_models()

    def initialize_vertex_ai(self):
        aiplatform.init(project=self.project_id)

    def setup_models(self):
        self.embedding_model = VertexAIEmbeddings(
            model="textembedding-gecko@003",
            project=self.project_id
        )
        self.llm = ChatAnthropic(model="claude-3-5-sonnnet-latest")