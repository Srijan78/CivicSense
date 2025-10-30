"""
Database Schemas for Civic-Sense

Each Pydantic model represents a MongoDB collection.
Collection name = lowercase of class name (User -> "user", Report -> "report").
"""

from pydantic import BaseModel, Field, EmailStr
from typing import Optional, Literal, List

class User(BaseModel):
    name: str = Field(..., description="Full name")
    email: EmailStr = Field(..., description="Email address")
    role: Literal['user', 'municipal'] = Field('user', description="Role of the account")
    password_hash: str = Field(..., description="Hashed password")
    is_active: bool = Field(True, description="Whether user is active")

class Location(BaseModel):
    lat: Optional[float] = Field(None)
    lng: Optional[float] = Field(None)
    address: Optional[str] = Field('', description="Nearest address or landmark")

class Report(BaseModel):
    user_email: Optional[str] = Field('anonymous@civic-sense.local')
    name: Optional[str] = Field('Citizen')
    description: str
    category: Optional[str] = Field('Other')
    location: Optional[Location] = Field(default_factory=Location)
    imageUrl: Optional[str] = Field('')
    status: Optional[str] = Field('Submitted')
    timestamp: Optional[int] = Field(default_factory=lambda: int(datetime.now().timestamp() * 1000))
    pointsAwarded: Optional[int] = Field(0)
