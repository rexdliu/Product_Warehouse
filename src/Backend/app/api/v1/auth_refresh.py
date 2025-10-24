"""
刷新令牌实现（可选功能）

该模块提供刷新令牌（Refresh Token）功能，允许用户在访问令牌过期后
无需重新登录即可获取新的访问令牌。

使用方法：
1. 在 __init__.py 中注册路由
2. 修改登录端点同时返回 refresh_token
3. 前端在访问令牌快过期时调用刷新端点
"""

from datetime import timedelta, datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_access_token
from app.crud import user as user_crud
from app.schemas.user import Token
from pydantic import BaseModel

router = APIRouter()

class RefreshTokenRequest(BaseModel):
    """刷新令牌请求"""
    refresh_token: str

def create_refresh_token(data: dict) -> str:
    """
    创建刷新令牌

    Args:
        data: 要编码到令牌中的数据

    Returns:
        str: 刷新令牌
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=7)  # 7天有效期
    to_encode.update({
        "exp": expire,
        "type": "refresh"  # 标记为刷新令牌
    })
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

@router.post("/refresh", response_model=Token)
def refresh_access_token(
    *,
    db: Session = Depends(get_db),
    token_data: RefreshTokenRequest
):
    """
    使用刷新令牌获取新的访问令牌

    Args:
        db: 数据库会话依赖
        token_data: 包含刷新令牌的请求体

    Returns:
        Token: 包含新访问令牌的响应

    Raises:
        HTTPException: 刷新令牌无效或用户不存在时抛出 401 错误
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate refresh token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # 解码刷新令牌
        payload = jwt.decode(
            token_data.refresh_token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        # 验证令牌类型
        token_type = payload.get("type")
        if token_type != "refresh":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid token type, expected refresh token"
            )

        # 提取用户名
        username = payload.get("sub")
        if not isinstance(username, str):
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    # 从数据库获取用户
    user = user_crud.get_by_username(db, username=username)
    if user is None:
        raise credentials_exception

    # 检查用户是否活跃
    if not user_crud.is_active(user):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )

    # 生成新的访问令牌
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.post("/logout")
def logout():
    """
    用户登出

    注意：由于 JWT 是无状态的，真正的登出需要实现令牌黑名单机制。
    这里提供一个基础实现，实际使用需要配合 Redis 或数据库存储黑名单。

    建议实现：
    1. 使用 Redis 存储黑名单令牌
    2. 在 get_current_user 依赖中检查黑名单
    3. 定期清理过期的黑名单条目

    Returns:
        dict: 登出成功消息
    """
    # TODO: 实现令牌黑名单
    # 示例：
    # redis_client.setex(f"blacklist:{token}", ttl, "1")

    return {
        "msg": "Successfully logged out",
        "note": "Please remove the token from client storage"
    }
