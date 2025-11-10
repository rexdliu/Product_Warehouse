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

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional


class Settings(BaseSettings):
    """应用配置类"""

    # 数据库配置
    DATABASE_URL: str = "mysql+pymysql://rex:Liuyerong729!@rm-gs54780452unf94747o.mysql.singapore.rds.aliyuncs.com:3306/product_warehouse"

    # JWT配置
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10

    # CORS配置（本地开发默认包含 5173 与 8003）
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8003",
        "http://127.0.0.1:8003",
    ]

    # AI服务配置
    OPENAI_API_KEY: Optional[str] = None
    RAG_ENABLED: bool = False

    @property
    def SQLALCHEMY_DATABASE_URL(self) -> str:
        """返回数据库URL"""
        return self.DATABASE_URL

    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=".env",
        extra="ignore"  # 忽略.env文件中的额外变量
    )


# 创建全局配置实例
settings = Settings()