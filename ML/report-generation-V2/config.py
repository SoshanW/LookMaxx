import os
from dotenv import load_dotenv

class Config:
    def __init__(self):
        load_dotenv()
        self.setup_environment()

    def setup_environment(self):
        if not os.getenv('ANTHROPIC_API_KEY'):
            os.environ["ANTHROPIC_API_KEY"] = input("Please enter your Anthropic API Key: ")

        self.project_id = os.getenv('GOOGLE_CLOUD_PROJECT')
        if not self.project_id:
            raise ValueError("Please set GOOGLE_CLOUD_PROJECT in your .env file")