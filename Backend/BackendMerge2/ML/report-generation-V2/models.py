from pydantic import BaseModel, Field
from typing import List

class GeneratePropositions(BaseModel):
    propositions: List[str] = Field(
        description="List of propositions (factual, self-contained, and concise information)"
    )

class GradePropositions(BaseModel):
    accuracy: int = Field(
        description="Rate from 1-10 based on how well the proposition reflects the original texts"
    )
    clarity: int = Field(
        description="Rate from 1-10 based on how easy it is to understand the proposition witout additional context."
    )
    completeness: int = Field(
        description="Rate from 1-10 based on whether the proposition includes necessary details."
    )
    conciseness: int = Field(
        description="Rate from 1-10 based on whether the proposition is concise losing important information."
    )