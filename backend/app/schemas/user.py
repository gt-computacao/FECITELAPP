from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: str
    active: bool = True

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    active: Optional[bool] = None

class UserResponse(UserBase):
    id: int
    email_verified_at: Optional[datetime]
    remember_token: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]

    class Config:
        from_attributes = True

class UserWithRelations(UserResponse):
    evaluator: Optional[dict] = None

class UserListResponse(BaseModel):
    status: bool
    message: str
    data: List[UserWithRelations] = []

class UserDetailResponse(BaseModel):
    status: bool
    message: str
    data: UserWithRelations 