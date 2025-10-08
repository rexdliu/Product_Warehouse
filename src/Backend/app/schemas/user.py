"""
用户 Pydantic 模型

该模块定义了与用户相关的 Pydantic 模型，用于数据验证和序列化。
主要包含：
1. UserBase - 用户基础模型
2. UserCreate - 创建用户模型
3. UserUpdate - 更新用户模型
4. UserInDB - 数据库用户模型
5. UserSettings - 用户设置模型
6. 登录和令牌相关模型
"""

from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

# 基础用户模型
class UserBase(BaseModel):
    """用户基础模型，包含所有用户共享的字段"""
    username: str
    email: str
    phone: str

# 创建用户模型
class UserCreate(UserBase):
    """创建用户模型，包含创建用户时需要的字段"""
    password: str
    notifications: Optional[Dict[str, Any]] = None
    ai_settings: Optional[Dict[str, Any]] = None
    avatar_url: Optional[str] = None
    theme: Optional[str] = None

# 更新用户模型
class UserUpdate(BaseModel):
    """更新用户模型，所有字段均为可选以支持部分更新"""
    username: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None
    notifications: Optional[Dict[str, Any]] = None
    ai_settings: Optional[Dict[str, Any]] = None
    avatar_url: Optional[str] = None
    theme: Optional[str] = None

# 数据库用户模型
class UserInDB(UserBase):
    """数据库用户模型，包含从数据库中获取的用户信息"""
    id: int
    is_active: bool
    is_superuser: bool
    created_at: datetime
    updated_at: Optional[datetime]
    notifications: Optional[Dict[str, Any]] = None
    ai_settings: Optional[Dict[str, Any]] = None
    avatar_url: Optional[str] = None
    theme: Optional[str] = None
    
    class Config:
        from_attributes = True

# 用户设置模型
class UserSettings(BaseModel):
    """用户设置模型，包含用户个性化设置"""
    theme: str = "system"
    notifications: Optional[Dict[str, Any]] = None
    ai_settings: Optional[Dict[str, Any]] = None
    avatar_url: Optional[str] = None

# 用户设置更新模型
class UserSettingsUpdate(UserSettings):
    """用户设置更新模型"""
    pass

# 用户密码更新模型
class UserPasswordUpdate(BaseModel):
    """用户密码更新模型"""
    current_password: str
    new_password: str

# 登录模型
class LoginRequest(BaseModel):
    """登录请求模型"""
    username: str
    password: str

# Token模型
class Token(BaseModel):
    """JWT 令牌模型"""
    access_token: str
    token_type: str

class TokenData(BaseModel):
    """令牌数据模型"""
    username: Optional[str] = None
