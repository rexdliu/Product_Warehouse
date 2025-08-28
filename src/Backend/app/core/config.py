"""
应用核心配置模块

该模块定义了应用的核心配置设置，使用 Pydantic 的 BaseSettings 来管理环境变量。
主要功能：
1. 管理数据库连接配置
2. 管理 JWT 认证配置
3. 管理 CORS 配置
4. 管理 AI 服务配置
5. 通过环境变量覆盖默认配置
"""

from pydantic_settings import BaseSettings
from typing import List, Optional


class Settings(BaseSettings):
    """应用配置类"""
    
    # 数据库配置
    DATABASE_URL: str = "sqlite:///./warehouse.db"
    
    # JWT配置
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS配置
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:5173"]
    
    # AI服务配置
    OPENAI_API_KEY: Optional[str] = None
    RAG_ENABLED: bool = False
    
    class Config:
        case_sensitive = True
        env_file = ".env"


# 创建全局配置实例
settings = Settings()