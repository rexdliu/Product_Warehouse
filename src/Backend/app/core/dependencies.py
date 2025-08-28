"""
依赖注入模块

该模块定义了 FastAPI 的依赖项，用于处理认证和授权。
主要功能：
1. 获取当前认证用户
2. 获取当前活跃用户
3. 获取当前超级用户
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from app.core.config import settings
from app.core.database import get_db
from app.crud.user import user as user_crud
from app.schemas.user import TokenData
from app.models.user import User

# OAuth2 密码流，用于从请求中提取访问令牌
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    """
    获取当前认证用户
    
    Args:
        db: 数据库会话依赖项
        token: JWT 访问令牌
        
    Returns:
        User: 当前认证用户对象
        
    Raises:
        HTTPException: 如果令牌无效或用户不存在
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    
    user = user_crud.get_by_username(db, username=token_data.username)
    if user is None:
        raise credentials_exception
    
    return user

async def get_current_active_user(
    current_user: User = Depends(get_current_user)
):
    """
    获取当前活跃用户
    
    Args:
        current_user: 当前认证用户依赖项
        
    Returns:
        User: 当前活跃用户对象
        
    Raises:
        HTTPException: 如果用户不活跃
    """
    if not user_crud.is_active(current_user):
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

async def get_current_active_superuser(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """
    获取当前超级用户
    
    Args:
        current_user: 当前活跃用户依赖项
        
    Returns:
        User: 当前超级用户对象
        
    Raises:
        HTTPException: 如果用户不是超级用户
    """
    if not user_crud.is_superuser(current_user):
        raise HTTPException(
            status_code=400, detail="The user doesn't have enough privileges"
        )
    return current_user