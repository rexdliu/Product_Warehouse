"""
用户数据模型

该模块定义了用户相关的 SQLAlchemy 数据模型。
主要包含：
1. User - 用户模型，包含基本信息和认证相关字段
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    """
    用户模型

    用于存储用户的基本信息、认证信息和设置。
    角色: staff=员工(只读), manager=仓库管理员(管理订单库存), admin=系统管理员(完全访问)
    """

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String)
    full_name = Column(String)  # 全名
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="staff")  # staff, manager, admin, tester
    avatar_url = Column(String)  # 用户头像URL
    language = Column(String, default="zh-CN")  # 用户界面语言
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

