# Flutter 移动应用 - API 端点快速参考

## API 基础信息

| 项目 | 值 |
|------|-----|
| **基础 URL** | `http://api.example.com/api/v1` |
| **框架** | FastAPI (Python) |
| **认证方式** | JWT Bearer Token |
| **内容类型** | application/json |
| **字符编码** | UTF-8 |

---

## API 端点速查表

### 已存在的端点 (可立即使用)

#### 认证
```
POST   /auth/login               登录
POST   /auth/register            注册
```

#### 用户
```
GET    /users/                   获取用户列表
GET    /users/me                 获取当前用户信息
PUT    /users/me                 更新个人资料
POST   /users/me/avatar          上传头像
DELETE /users/me/avatar          删除头像
GET    /users/me/avatar/default  获取默认头像
POST   /users/me/change-password 修改密码
```

#### 产品
```
GET    /products/                获取产品列表
POST   /products/                创建产品
GET    /products/{id}            获取单个产品
PUT    /products/{id}            更新产品
DELETE /products/{id}            删除产品
GET    /products/categories      获取分类列表
```

#### 库存
```
GET    /inventory/warehouses     获取仓库列表
POST   /inventory/warehouses     创建仓库
GET    /inventory/items          获取库存列表
GET    /inventory/items/{id}     获取单个库存
PUT    /inventory/items/{id}     更新库存
```

#### 库存警报
```
POST   /alerts/check-low-stock   检查低库存
GET    /alerts/low-stock-items   获取低库存列表
```

#### AI 功能
```
POST   /ai/rag/query             RAG 查询
POST   /ai/insights              生成产品洞察
```

#### 仪表盘
```
GET    /dashboard/               完整仪表板数据
GET    /dashboard/stats          统计数据
GET    /dashboard/stock-status   库存状态
GET    /dashboard/activities     活动记录
GET    /dashboard/alerts         警报列表
GET    /dashboard/top-products   热门产品
GET    /dashboard/warehouse-utilization 仓库利用率
GET    /dashboard/order-status-distribution 订单分布
GET    /dashboard/inventory-sales-trend 库存销售趋势
GET    /dashboard/product-movement 产品动向
GET    /dashboard/category-distribution 分类分布
```

#### 销售订单
```
GET    /sales/distributors                      经销商列表
POST   /sales/distributors                      创建经销商
PUT    /sales/distributors/{distributor_id}    更新经销商
GET    /sales/orders                            订单列表
POST   /sales/orders                            创建订单
PUT    /sales/orders/{order_id}                 更新订单
```

#### 全局搜索
```
GET    /search/                  全局搜索
```

#### 通知
```
GET    /notifications/                        通知列表
GET    /notifications/unread-count             未读计数
PUT    /notifications/{notification_id}/read  标记已读
PUT    /notifications/read-all                 全部已读
DELETE /notifications/{notification_id}       删除通知
```

#### WebSocket
```
WS     /ws/notifications         实时通知推送
```

#### 仓库配置
```
GET    /warehouse/config         获取配置
PUT    /warehouse/config         更新配置
```

---

### 缺失的端点 (需要后端实现)

#### 认证 (优先级: ⭐⭐⭐⭐⭐)
```
POST   /auth/refresh             Token 刷新 (CRITICAL)
POST   /auth/logout              登出 (CRITICAL)
POST   /auth/forgot-password     忘记密码 (HIGH)
POST   /auth/reset-password      重置密码 (HIGH)
```

#### 库存操作 (优先级: ⭐⭐⭐⭐⭐)
```
POST   /inventory/stock-in       库存入库 (CRITICAL)
POST   /inventory/stock-out      库存出库 (CRITICAL)
POST   /inventory/transfer       库存转移 (CRITICAL)
GET    /inventory/history/{id}   库存历史 (HIGH)
```

#### AI 功能 (优先级: ⭐⭐⭐)
```
POST   /ai/chat                  AI 聊天 (MEDIUM)
POST   /ai/analyze-trend         趋势分析 (MEDIUM)
POST   /ai/predict-demand        需求预测 (LOW)
GET    /ai/chat-history          聊天历史 (MEDIUM)
```

#### 产品 (优先级: ⭐⭐⭐)
```
POST   /products/{id}/images     上传产品图片 (HIGH)
POST   /products/batch           批量操作 (MEDIUM)
GET    /products/search          高级搜索 (MEDIUM)
```

#### 销售 (优先级: ⭐⭐⭐)
```
POST   /sales/orders/{order_id}/shipment 创建发货单 (MEDIUM)
GET    /sales/orders/{order_id}/shipments 获取发货记录 (MEDIUM)
DELETE /sales/orders/{order_id}           删除订单 (LOW)
```

#### 移动端专用 (优先级: ⭐⭐⭐)
```
POST   /mobile/sync               增量数据同步 (HIGH)
POST   /mobile/batch              批量操作 (MEDIUM)
GET    /mobile/config             移动端配置 (MEDIUM)
```

---

## 认证流程

### 登录
```bash
POST /api/v1/auth/login
Content-Type: application/x-www-form-urlencoded

username=user@example.com&password=password
```

**响应 (200 OK)**
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer"
}
```

### 使用 Token
```bash
GET /api/v1/users/me
Authorization: Bearer eyJhbGc...
```

---

## 数据模型速查

### 用户 (User)
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@example.com",
  "full_name": "管理员",
  "role": "admin",
  "is_active": true,
  "avatar_url": "/static/avatars/avatar.jpg"
}
```

### 产品 (Product)
```json
{
  "id": 1,
  "name": "柴油发动机",
  "sku": "SKU-001",
  "part_number": "PN-001",
  "price": 10000,
  "cost": 8000,
  "category_id": 1,
  "is_active": true
}
```

### 库存 (Inventory)
```json
{
  "id": 1,
  "product_id": 1,
  "warehouse_id": 1,
  "quantity": 100,
  "reserved_quantity": 10,
  "location_code": "A1-01"
}
```

### 订单 (SalesOrder)
```json
{
  "id": 1,
  "order_code": "SO20251118001",
  "distributor_id": 1,
  "product_id": 1,
  "quantity": 10,
  "status": "pending",
  "order_date": "2025-11-18T00:00:00"
}
```

---

## 权限级别

| 角色 | 权限 | API 访问 |
|------|------|---------|
| **superuser** | 所有权限 | ✓ 全部 |
| **admin** | 管理员 | ✓ 全部 (除删除) |
| **manager** | 经理 | ✓ 生产/销售管理 |
| **tester** | 测试员 | ✓ 数据维护 |
| **staff** | 员工 | ✓ 只读 |

### 权限检查端点
- `require_admin` - 仅限 Admin/Superuser
- `require_manager_or_above` - Manager/Admin/Superuser/Tester
- `require_staff_or_above` - 所有已认证用户

---

## 错误处理

### HTTP 状态码
```
200 OK                - 请求成功
201 Created           - 创建成功
400 Bad Request       - 请求参数错误
401 Unauthorized      - 未授权/Token 无效
403 Forbidden         - 权限不足
404 Not Found         - 资源不存在
500 Internal Server   - 服务器错误
```

### 错误响应格式
```json
{
  "detail": "具体错误信息"
}
```

---

## 常见集成步骤 (Flutter 中)

### 1. 登录
```dart
final response = await http.post(
  Uri.parse('$API_BASE_URL/auth/login'),
  headers: {'Content-Type': 'application/x-www-form-urlencoded'},
  body: {
    'username': email,
    'password': password,
  },
);
```

### 2. 保存 Token
```dart
SharedPreferences prefs = await SharedPreferences.getInstance();
await prefs.setString('access_token', token);
```

### 3. 使用 Token 发送请求
```dart
final response = await http.get(
  Uri.parse('$API_BASE_URL/users/me'),
  headers: {
    'Authorization': 'Bearer $token',
  },
);
```

### 4. Token 刷新 (当实现后)
```dart
final response = await http.post(
  Uri.parse('$API_BASE_URL/auth/refresh'),
  body: {'refresh_token': refreshToken},
);
```

---

## 性能建议

### 分页参数
```
GET /api/v1/products/?skip=0&limit=20
```

### 缓存策略
- **用户信息**: 缓存 5 分钟
- **产品列表**: 缓存 10 分钟
- **库存数据**: 缓存 2 分钟
- **仪表盘数据**: 实时获取
- **通知**: 使用 WebSocket，不缓存

### 压缩
建议启用 gzip 压缩大型 JSON 响应

---

## 移动端特殊考虑

### 1. 网络可靠性
- 实现重试机制
- 设置合理的超时时间（建议 30 秒）
- 缓存关键数据

### 2. 离线支持
- 使用本地数据库（SQLite）缓存数据
- 实现同步队列
- 支持乐观更新

### 3. 推送通知
- 使用 WebSocket 保持连接
- 心跳间隔：30 秒
- 自动重连机制

### 4. 文件上传
- 头像上传前压缩
- 使用分片上传大文件
- 实现进度回调

---

## 已知限制

⚠️ **待解决的问题**:
1. ❌ 缺少 Token 刷新端点
2. ❌ 库存出入库流程不标准
3. ❌ 缺少离线同步 API
4. ❌ 缺少速率限制保护
5. ❌ 缺少请求签名验证

---

## 下一步行动

### 必须完成 (第 1 周)
- [ ] 实现 Token 刷新端点
- [ ] 实现库存出入库专用端点
- [ ] 统一错误响应格式

### 应该完成 (第 2 周)
- [ ] 实现产品图片上传
- [ ] 实现登出和 Token 黑名单
- [ ] 添加缓存支持

### 可以优化 (第 3 周)
- [ ] 实现速率限制
- [ ] 离线同步支持
- [ ] GraphQL 接口

---

## 测试端点

使用 Postman 或 curl 测试：

```bash
# 登录
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=password"

# 获取用户信息
curl -X GET http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# 获取产品列表
curl -X GET "http://localhost:8000/api/v1/products/?skip=0&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 更多资源

- 完整 API 文档：`http://localhost:8000/docs`
- ReDoc 文档：`http://localhost:8000/redoc`
- OpenAPI JSON：`http://localhost:8000/openapi.json`

