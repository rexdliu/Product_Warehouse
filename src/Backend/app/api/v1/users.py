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
