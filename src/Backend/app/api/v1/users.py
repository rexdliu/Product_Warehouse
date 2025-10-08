"""
用户相关 API 路由

该模块定义了用户管理相关的 API 路由。
主要功能：
1. 获取用户列表
2. 获取当前用户信息
3. 获取和更新用户设置
"""

from typing import Any, Dict, List, Optional, cast
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.crud.user import CRUDUser, user as _user_crud
from app.schemas.user import (
    UserInDB,
    UserSettings,
    UserSettingsUpdate,
    UserPasswordUpdate,
    UserUpdate,
)
from app.core.security import verify_password, get_password_hash
# 依赖项导入
from app.api.deps import get_current_active_user
from app.models.user import User

user_crud: CRUDUser = _user_crud

# 创建路由实例
router = APIRouter()

@router.get("/", response_model=List[UserInDB])
def read_users(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
) -> Any:
    """
    获取用户列表（分页）
    
    Args:
        db: 数据库会话依赖
        skip: 跳过的记录数
        limit: 返回的记录数限制
        
    Returns:
        List[UserInDB]: 用户列表
    """
    users = user_crud.get_multi(db, skip=skip, limit=limit)
    return users

@router.get("/me", response_model=UserInDB)
def read_user_me(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    获取当前用户信息
    
    Args:
        db: 数据库会话依赖
        current_user: 当前认证用户依赖
        
    Returns:
        UserInDB: 当前用户信息
    """
    return current_user

@router.put("/me/password")
def update_password(
    *,
    db: Session = Depends(get_db),
    password_data: UserPasswordUpdate,
    current_user: User = Depends(get_current_active_user)
):
    """
    更新用户密码
    """
    stored_hash = cast(str, current_user.hashed_password)
    if not verify_password(password_data.current_password, stored_hash):
        raise HTTPException(status_code=400, detail="Incorrect password")
    hashed_password = get_password_hash(password_data.new_password)
    setattr(current_user, "hashed_password", hashed_password)
    db.add(current_user)
    db.commit()
    return {"msg": "Password updated successfully"}

@router.get("/settings", response_model=UserSettings)
def read_user_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    获取当前用户设置
    
    Args:
        db: 数据库会话依赖
        current_user: 当前认证用户依赖
        
    Returns:
        UserSettings: 当前用户设置
    """
    # 从数据库中获取用户设置
    theme_value = cast(Optional[str], current_user.theme) or "system"
    notifications_value = cast(Optional[Dict[str, Any]], current_user.notifications)
    ai_settings_value = cast(Optional[Dict[str, Any]], current_user.ai_settings)
    avatar_value = cast(Optional[str], current_user.avatar_url)

    settings = UserSettings(
        theme=theme_value,
        notifications=notifications_value,
        ai_settings=ai_settings_value,
        avatar_url=avatar_value
    )
    return settings

@router.put("/settings", response_model=UserSettings)
def update_user_settings(
    *,
    db: Session = Depends(get_db),
    user_settings_in: UserSettingsUpdate,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    更新当前用户设置
    
    Args:
        db: 数据库会话依赖
        user_settings_in: 用户设置更新数据
        current_user: 当前认证用户依赖
        
    Returns:
        UserSettings: 更新后的用户设置
    """
    # 更新用户设置到数据库
    update_data = user_settings_in.model_dump(exclude_unset=True)
    user_update = UserUpdate(**update_data)
    user = user_crud.update(db, db_obj=current_user, obj_in=user_update)

    theme_value = cast(Optional[str], user.theme) or "system"
    notifications_value = cast(Optional[Dict[str, Any]], user.notifications)
    ai_settings_value = cast(Optional[Dict[str, Any]], user.ai_settings)
    avatar_value = cast(Optional[str], user.avatar_url)

    settings = UserSettings(
        theme=theme_value,
        notifications=notifications_value,
        ai_settings=ai_settings_value,
        avatar_url=avatar_value
    )
    return settings
