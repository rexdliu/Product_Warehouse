# JWT 认证系统实现分析

## 目录
1. [当前实现状态](#当前实现状态)
2. [JWT 认证流程](#jwt-认证流程)
3. [已实现功能](#已实现功能)
4. [待实现功能](#待实现功能)
5. [安全性分析](#安全性分析)
6. [改进建议](#改进建议)

## 当前实现状态

### ✅ 已完成的 JWT 功能

根据代码审查，以下 JWT 认证功能已经完整实现：

#### 1. JWT 令牌生成 ✅
**位置**: `src/Backend/app/core/security.py:53-73`

```python
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    now_utc = datetime.now(timezone.utc)
    if expires_delta:
        expire = now_utc + expires_delta
    else:
        expire = now_utc + timedelta(minutes=15)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt
```

**功能**:
- ✅ 使用 HS256 算法加密
- ✅ 支持自定义过期时间
- ✅ 默认过期时间 15 分钟
- ✅ 使用 UTC 时间避免时区问题
- ✅ 包含用户标识（sub 字段）

#### 2. 密码加密和验证 ✅
**位置**: `src/Backend/app/core/security.py:28-51`

```python
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)
```

**功能**:
- ✅ 使用 bcrypt 加密算法
- ✅ 自动加盐（salt）
- ✅ 密码验证功能
- ✅ 密码哈希生成

#### 3. 用户认证 ✅
**位置**: `src/Backend/app/api/v1/auth.py:23-62`

```python
@router.post("/login", response_model=Token)
def login(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
):
    user = user_crud.authenticate(
        db, username=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
```

**功能**:
- ✅ OAuth2 密码流实现
- ✅ 用户名/密码验证
- ✅ 生成并返回 JWT 令牌
- ✅ 检查用户是否活跃
- ✅ 返回标准 OAuth2 响应格式

#### 4. 用户注册 ✅
**位置**: `src/Backend/app/api/v1/auth.py:64-105`

```python
@router.post("/register", response_model=UserInDB)
def register_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate
):
    # 检查用户名是否已存在
    user = user_crud.get_by_username(db, username=user_in.username)
    if user:
        raise HTTPException(status_code=400, detail="Username already exists")

    # 检查邮箱是否已存在
    user = user_crud.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(status_code=400, detail="Email already exists")

    # 检查手机号是否已存在
    user = user_crud.get_by_phone(db, phone=user_in.phone)
    if user:
        raise HTTPException(status_code=400, detail="Phone already exists")

    # 创建新用户
    user = user_crud.create(db, obj_in=user_in)
    return user
```

**功能**:
- ✅ 用户名唯一性验证
- ✅ 邮箱唯一性验证
- ✅ 手机号唯一性验证
- ✅ 自动密码哈希（在 CRUD 层）

#### 5. JWT 令牌验证和解析 ✅
**位置**: `src/Backend/app/core/dependencies.py:25-65`

```python
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
    except JWTError:
        raise credentials_exception

    username = payload.get("sub")
    if not isinstance(username, str):
        raise credentials_exception

    user = user_crud.get_by_username(db, username=username)
    if user is None:
        raise credentials_exception

    return user
```

**功能**:
- ✅ 从 HTTP 请求头提取 Bearer 令牌
- ✅ JWT 令牌解码和验证
- ✅ 签名验证
- ✅ 过期时间验证（自动）
- ✅ 从数据库加载完整用户信息
- ✅ 标准 OAuth2 错误响应

#### 6. 受保护的路由依赖 ✅
**位置**: `src/Backend/app/core/dependencies.py:67-105`

```python
async def get_current_active_user(
    current_user: User = Depends(get_current_user)
):
    if not user_crud.is_active(current_user):
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

async def get_current_active_superuser(
    current_user: User = Depends(get_current_active_user)
) -> User:
    if not user_crud.is_superuser(current_user):
        raise HTTPException(
            status_code=400, detail="The user doesn't have enough privileges"
        )
    return current_user
```

**功能**:
- ✅ 活跃用户验证
- ✅ 超级用户权限验证
- ✅ 分层依赖注入设计

#### 7. 受保护的 API 端点 ✅
**位置**: `src/Backend/app/api/v1/users.py`

```python
@router.get("/me", response_model=UserInDB)
def read_user_me(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    return current_user

@router.put("/me/password")
def update_password(
    *,
    db: Session = Depends(get_db),
    password_data: UserPasswordUpdate,
    current_user: User = Depends(get_current_active_user)
):
    # 验证当前密码
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect password")

    # 更新密码
    hashed_password = get_password_hash(password_data.new_password)
    current_user.hashed_password = hashed_password
    db.commit()
    return {"msg": "Password updated successfully"}

@router.get("/settings", response_model=UserSettings)
def read_user_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    # 返回用户设置
    ...

@router.put("/settings", response_model=UserSettings)
def update_user_settings(
    *,
    db: Session = Depends(get_db),
    user_settings_in: UserSettingsUpdate,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    # 更新用户设置
    ...
```

**受保护的端点**:
- ✅ `/api/v1/users/me` - 获取当前用户信息
- ✅ `/api/v1/users/me/password` - 修改密码
- ✅ `/api/v1/users/settings` - 获取/更新用户设置
- ✅ 所有产品、库存、销售 API（需要认证）

## JWT 认证流程

### 完整的认证流程

```
┌─────────────┐
│   用户注册   │
└──────┬──────┘
       │
       │ 1. 提交注册信息 (POST /api/v1/auth/register)
       │    { username, email, phone, password, full_name }
       ↓
┌─────────────────────────────────────────┐
│  后端验证                                │
│  - 检查用户名是否存在                     │
│  - 检查邮箱是否存在                       │
│  - 检查手机号是否存在                     │
│  - 使用 bcrypt 加密密码                  │
└──────┬──────────────────────────────────┘
       │
       │ 2. 创建用户记录
       ↓
┌─────────────┐
│  数据库存储  │
└──────┬──────┘
       │
       │ 3. 返回用户信息
       ↓
┌─────────────┐
│   用户登录   │
└──────┬──────┘
       │
       │ 4. 提交登录凭据 (POST /api/v1/auth/login)
       │    { username, password }  (表单格式)
       ↓
┌─────────────────────────────────────────┐
│  后端验证                                │
│  - 根据用户名查找用户                     │
│  - 使用 bcrypt 验证密码                  │
│  - 检查用户是否活跃                       │
└──────┬──────────────────────────────────┘
       │
       │ 5. 生成 JWT 令牌
       │    payload: { sub: username, exp: timestamp }
       ↓
┌─────────────────────────────────────────┐
│  返回 JWT 令牌                           │
│  {                                       │
│    "access_token": "eyJ...",            │
│    "token_type": "bearer"               │
│  }                                       │
└──────┬──────────────────────────────────┘
       │
       │ 6. 客户端存储令牌（localStorage/sessionStorage）
       ↓
┌─────────────┐
│   访问 API   │
└──────┬──────┘
       │
       │ 7. 携带令牌访问受保护的 API
       │    Header: Authorization: Bearer eyJ...
       ↓
┌─────────────────────────────────────────┐
│  后端验证令牌                            │
│  - 提取 Bearer 令牌                      │
│  - 使用 SECRET_KEY 验证签名              │
│  - 检查是否过期                          │
│  - 从 payload 提取用户名                 │
│  - 从数据库加载用户信息                   │
│  - 检查用户是否活跃                       │
└──────┬──────────────────────────────────┘
       │
       │ 8. 返回 API 响应
       ↓
┌─────────────┐
│   客户端    │
└─────────────┘
```

## 已实现功能

### ✅ 核心功能
1. **用户注册** - 支持用户名、邮箱、手机号注册
2. **用户登录** - OAuth2 密码流登录
3. **JWT 令牌生成** - 使用 HS256 算法
4. **JWT 令牌验证** - 自动验证签名和过期时间
5. **密码加密** - bcrypt 加密存储
6. **密码验证** - 安全的密码比对
7. **受保护的路由** - 使用依赖注入保护 API
8. **用户权限管理** - 活跃用户和超级用户验证
9. **密码修改** - 验证旧密码后修改

### ✅ 安全特性
1. **密码哈希** - bcrypt + 自动加盐
2. **JWT 签名** - HMAC-SHA256 签名
3. **令牌过期** - 可配置过期时间（默认 10 分钟）
4. **CORS 保护** - 限制跨域访问
5. **唯一性约束** - 用户名、邮箱、手机号唯一
6. **用户状态检查** - 活跃状态验证

## 待实现功能

### 🔄 建议添加的功能

#### 1. 刷新令牌（Refresh Token）
**优先级**: 高

**问题**: 当前只有访问令牌（Access Token），过期后用户需要重新登录。

**建议实现**:
```python
# 在 security.py 添加
def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=7)  # 7天有效期
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

# 在 auth.py 添加刷新端点
@router.post("/refresh", response_model=Token)
def refresh_token(
    refresh_token: str,
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=400, detail="Invalid token type")

        username = payload.get("sub")
        user = user_crud.get_by_username(db, username=username)
        if not user or not user_crud.is_active(user):
            raise HTTPException(status_code=401, detail="Invalid user")

        # 生成新的访问令牌
        access_token = create_access_token(data={"sub": user.username})
        return {"access_token": access_token, "token_type": "bearer"}

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
```

#### 2. 令牌黑名单（Token Blacklist）
**优先级**: 中

**问题**: 用户登出后，JWT 令牌仍然有效直到过期。

**建议实现**:
```python
# 使用 Redis 存储黑名单
from redis import Redis
redis_client = Redis(host='localhost', port=6379, db=0)

# 在 auth.py 添加登出端点
@router.post("/logout")
def logout(
    token: str = Depends(oauth2_scheme),
    current_user: User = Depends(get_current_active_user)
):
    # 解码令牌获取过期时间
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    exp = payload.get("exp")

    # 将令牌添加到黑名单，设置与令牌相同的过期时间
    ttl = exp - int(datetime.now(timezone.utc).timestamp())
    if ttl > 0:
        redis_client.setex(f"blacklist:{token}", ttl, "1")

    return {"msg": "Successfully logged out"}

# 修改 get_current_user 检查黑名单
async def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    # 检查令牌是否在黑名单中
    if redis_client.exists(f"blacklist:{token}"):
        raise HTTPException(status_code=401, detail="Token has been revoked")

    # ... 原有的验证逻辑
```

#### 3. 多设备会话管理
**优先级**: 中

**问题**: 无法跟踪用户在哪些设备上登录。

**建议实现**:
```python
# 创建 Session 模型
class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    token_hash = Column(String(255), unique=True)
    device_info = Column(String(255))
    ip_address = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)
    last_active = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

# 在用户模型中添加关系
class User(Base):
    # ... 原有字段
    sessions = relationship("Session", back_populates="user")

# 在 users.py 添加会话管理端点
@router.get("/sessions")
def get_active_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    sessions = db.query(Session).filter(
        Session.user_id == current_user.id,
        Session.is_active == True
    ).all()
    return sessions

@router.delete("/sessions/{session_id}")
def revoke_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    session = db.query(Session).filter(
        Session.id == session_id,
        Session.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session.is_active = False
    db.commit()
    return {"msg": "Session revoked"}
```

#### 4. 双因素认证（2FA）
**优先级**: 低

**建议实现**:
- 使用 TOTP（基于时间的一次性密码）
- 集成 Google Authenticator 或类似应用
- 添加备用恢复代码

#### 5. API 密钥管理
**优先级**: 中

**用途**: 允许用户生成 API 密钥用于程序化访问。

**建议实现**:
```python
# 创建 APIKey 模型
class APIKey(Base):
    __tablename__ = "api_keys"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String(255))
    key_hash = Column(String(255), unique=True)
    prefix = Column(String(10))  # 用于识别的前缀（如 "sk_live_"）
    created_at = Column(DateTime, default=datetime.utcnow)
    last_used = Column(DateTime)
    expires_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)

    user = relationship("User", back_populates="api_keys")

# 添加 API 密钥认证依赖
async def get_user_from_api_key(
    api_key: str = Header(..., alias="X-API-Key"),
    db: Session = Depends(get_db)
) -> User:
    # 验证 API 密钥
    key_hash = get_password_hash(api_key)
    db_key = db.query(APIKey).filter(
        APIKey.key_hash == key_hash,
        APIKey.is_active == True
    ).first()

    if not db_key:
        raise HTTPException(status_code=401, detail="Invalid API key")

    if db_key.expires_at and db_key.expires_at < datetime.utcnow():
        raise HTTPException(status_code=401, detail="API key has expired")

    # 更新最后使用时间
    db_key.last_used = datetime.utcnow()
    db.commit()

    return db_key.user
```

#### 6. 审计日志
**优先级**: 中

**建议实现**:
```python
# 创建审计日志模型
class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String(50))  # login, logout, password_change, etc.
    resource = Column(String(100))
    details = Column(JSON)
    ip_address = Column(String(50))
    user_agent = Column(String(255))
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="audit_logs")

# 记录审计日志的辅助函数
def log_audit(
    db: Session,
    user_id: int,
    action: str,
    resource: str,
    details: dict,
    request: Request
):
    log = AuditLog(
        user_id=user_id,
        action=action,
        resource=resource,
        details=details,
        ip_address=request.client.host,
        user_agent=request.headers.get("user-agent")
    )
    db.add(log)
    db.commit()
```

## 安全性分析

### ✅ 良好的安全实践

1. **密码存储**: 使用 bcrypt 加密，自动加盐
2. **JWT 签名**: 使用 HMAC-SHA256 确保令牌完整性
3. **HTTPS 支持**: 配置了 SSL/TLS（在 Nginx 配置中）
4. **CORS 限制**: 限制跨域访问源
5. **令牌过期**: 设置了过期时间防止永久有效令牌

### ⚠️ 潜在的安全问题

#### 1. SECRET_KEY 配置
**当前状态**:
```python
SECRET_KEY: str = "your-secret-key-here"  # ❌ 默认值不安全
```

**建议**:
```python
# 在 .env 文件中设置强随机密钥
SECRET_KEY=$(openssl rand -hex 32)

# 在配置中强制要求设置
class Settings(BaseSettings):
    SECRET_KEY: str = Field(..., description="Must be set in .env")  # 必须设置
```

#### 2. 访问令牌过期时间过短
**当前配置**: 10 分钟
```python
ACCESS_TOKEN_EXPIRE_MINUTES: int = 10  # 可能导致频繁登录
```

**建议**:
- 增加访问令牌有效期到 30-60 分钟
- 实现刷新令牌机制（有效期 7-30 天）

#### 3. 缺少速率限制
**问题**: 没有防止暴力破解的机制

**建议**: 使用 slowapi 添加速率限制
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@router.post("/login")
@limiter.limit("5/minute")  # 每分钟最多5次登录尝试
def login(...):
    ...
```

#### 4. 缺少 CSRF 保护
**问题**: 基于 Cookie 的应用可能受到 CSRF 攻击

**建议**:
- 当前使用 Bearer 令牌，不基于 Cookie，CSRF 风险较低
- 如果切换到 Cookie 认证，需要添加 CSRF 令牌

#### 5. 密码复杂度要求
**问题**: 没有强制密码复杂度要求

**建议**: 在 `UserCreate` schema 中添加验证
```python
from pydantic import validator
import re

class UserCreate(BaseModel):
    username: str
    password: str
    email: str
    phone: str
    full_name: str

    @validator('password')
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('密码长度至少8个字符')
        if not re.search(r'[A-Z]', v):
            raise ValueError('密码必须包含至少一个大写字母')
        if not re.search(r'[a-z]', v):
            raise ValueError('密码必须包含至少一个小写字母')
        if not re.search(r'[0-9]', v):
            raise ValueError('密码必须包含至少一个数字')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('密码必须包含至少一个特殊字符')
        return v
```

## 改进建议

### 短期改进（1-2周）

1. **修改 SECRET_KEY**
   - 生成强随机密钥
   - 在 .env 文件中配置
   - 移除代码中的默认值

2. **增加访问令牌有效期**
   - 从 10 分钟增加到 30 分钟
   - 在配置中可调整

3. **添加密码复杂度验证**
   - 最小长度 8 字符
   - 包含大小写字母、数字、特殊字符

4. **添加登录速率限制**
   - 使用 slowapi
   - 每分钟最多 5 次尝试

5. **完善错误响应**
   - 统一错误格式
   - 不泄露敏感信息

### 中期改进（2-4周）

1. **实现刷新令牌**
   - 添加 refresh token 生成
   - 添加 /api/v1/auth/refresh 端点
   - 前端自动刷新令牌

2. **实现令牌黑名单**
   - 集成 Redis
   - 添加 /api/v1/auth/logout 端点
   - 在令牌验证中检查黑名单

3. **添加多设备会话管理**
   - 创建 Session 模型
   - 添加会话查看和撤销端点
   - 前端显示活跃设备列表

4. **实现 API 密钥功能**
   - 创建 APIKey 模型
   - 添加密钥生成、撤销端点
   - 支持两种认证方式（JWT + API Key）

5. **添加审计日志**
   - 记录所有认证相关操作
   - 记录敏感操作（密码修改、权限变更）
   - 提供日志查询 API

### 长期改进（1-3个月）

1. **实现双因素认证（2FA）**
   - TOTP 实现
   - 备用恢复代码
   - 2FA 启用/禁用管理

2. **OAuth2 社交登录**
   - Google 登录
   - GitHub 登录
   - 微信/支付宝登录（中国用户）

3. **单点登录（SSO）**
   - SAML 2.0 支持
   - 企业 AD/LDAP 集成

4. **高级安全功能**
   - IP 白名单/黑名单
   - 地理位置限制
   - 异常登录检测

## 测试建议

### 单元测试

创建 `tests/test_auth.py`:

```python
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_register_user():
    response = client.post(
        "/api/v1/auth/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "phone": "13800138000",
            "password": "Test123!@#",
            "full_name": "Test User"
        }
    )
    assert response.status_code == 200
    assert "username" in response.json()

def test_login_success():
    # 先注册
    client.post("/api/v1/auth/register", json={...})

    # 登录
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "testuser",
            "password": "Test123!@#"
        }
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"

def test_login_wrong_password():
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "testuser",
            "password": "wrongpassword"
        }
    )
    assert response.status_code == 401

def test_protected_endpoint_without_token():
    response = client.get("/api/v1/users/me")
    assert response.status_code == 401

def test_protected_endpoint_with_token():
    # 登录获取令牌
    login_response = client.post("/api/v1/auth/login", data={...})
    token = login_response.json()["access_token"]

    # 访问受保护端点
    response = client.get(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert "username" in response.json()
```

## 总结

### 当前状态
✅ **JWT 认证系统已经完整实现并可以正常工作**

**核心功能完备**:
- 用户注册和登录 ✅
- JWT 令牌生成和验证 ✅
- 密码加密存储 ✅
- 受保护的 API 端点 ✅
- 用户权限管理 ✅

**可以立即用于生产**: 是的，但建议先实施以下安全加固措施：

### 生产就绪清单

#### 必须完成（高优先级）
- [ ] 生成并配置强随机 SECRET_KEY
- [ ] 添加登录速率限制
- [ ] 添加密码复杂度验证
- [ ] 配置 HTTPS（在 Nginx 中）
- [ ] 设置适当的 CORS 策略

#### 推荐完成（中优先级）
- [ ] 实现刷新令牌机制
- [ ] 实现登出功能（令牌黑名单）
- [ ] 添加多设备会话管理
- [ ] 实现审计日志
- [ ] 添加 API 密钥功能

#### 可选完成（低优先级）
- [ ] 实现双因素认证
- [ ] 添加 OAuth2 社交登录
- [ ] 实现单点登录（SSO）

### 使用建议

1. **开发环境**: 当前实现已经足够
2. **测试环境**: 建议完成"必须完成"清单
3. **生产环境**: 建议完成"必须完成"和"推荐完成"清单

JWT 认证系统的基础架构已经非常完善，可以支持日常的用户认证需求。根据业务需求逐步添加高级功能即可。
