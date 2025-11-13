"""
通知数据模型

该模块定义了通知相关的 SQLAlchemy 数据模型。
主要包含：
1. Notification - 通知模型，用于存储用户通知
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Notification(Base):
    """
    通知模型

    用于存储系统通知，支持7天自动过期和实时推送。
    通知类型: order=订单通知, inventory=库存通知, alert=警报通知, product=产品通知, system=系统通知
    """

    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(20), nullable=False, index=True)  # order, inventory, alert, product, system
    is_read = Column(Boolean, default=False, index=True)
    reference_id = Column(Integer, nullable=True)  # 关联实体ID（订单ID、产品ID等）
    reference_type = Column(String(50), nullable=True)  # 关联实体类型（order, product, inventory等）
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)  # 7天后过期

    # 关系
    user = relationship("User", backref="notifications")
