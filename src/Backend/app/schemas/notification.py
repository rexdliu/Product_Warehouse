"""通知 Pydantic 模型"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class NotificationBase(BaseModel):
    """通知基础模型"""
    title: str
    message: str
    notification_type: str  # order, inventory, alert, product, system
    reference_id: Optional[int] = None
    reference_type: Optional[str] = None


class NotificationCreate(NotificationBase):
    """创建通知模型"""
    user_id: int


class NotificationUpdate(BaseModel):
    """更新通知模型"""
    is_read: Optional[bool] = None


class NotificationInDB(NotificationBase):
    """通知数据库模型"""
    id: int
    user_id: int
    is_read: bool
    created_at: datetime
    expires_at: datetime

    class Config:
        from_attributes = True


class NotificationResponse(NotificationInDB):
    """通知响应模型（与InDB相同）"""
    pass


class UnreadCountResponse(BaseModel):
    """未读通知数量响应模型"""
    unread_count: int
