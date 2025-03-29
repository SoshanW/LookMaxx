import os
import json
from google.oauth2 import service_account
from google.cloud import aiplatform
from langchain_google_vertexai import VertexAIEmbeddings
from langchain_anthropic import ChatAnthropic

class AISerivce:
    def __init__(self, project_id):
        self.project_id = project_id
        self.initialize_vertex_ai()
        self.setup_models()

    def initialize_vertex_ai(self):
        creds_string = os.environ.get("GOOGLE_CREDENTIALS_JSON")
        if creds_string:
            # Convert the JSON string back into a dictionary
            creds_info = json.loads(creds_string)
            # Create credentials object from the dictionary
            credentials = service_account.Credentials.from_service_account_info(creds_info)
            aiplatform.init(project=self.project_id, credentials=credentials)
        else:
            # Fallback to default initialization if the env variable isn't set
            aiplatform.init(project=self.project_id)

    def setup_models(self):
        self.embedding_model = VertexAIEmbeddings(
            model="textembedding-gecko@003",
            project=self.project_id
        )
        self.llm = ChatAnthropic(model="claude-3-5-sonnet-latest")