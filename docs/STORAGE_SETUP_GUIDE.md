# 图片存储完整配置指南

## 📋 概述

本项目支持多种图片存储方案，可以根据需求选择：

| 存储方案 | 适用场景 | 优点 | 缺点 |
|---------|---------|------|------|
| **本地文件** | 开发/测试 | 零成本、零配置 | 不可扩展、无备份 |
| **MinIO** ⭐ | 生产环境 | 免费、S3兼容、易部署 | 需要运维 |
| **阿里云OSS** | 国内业务 | 快速、CDN、图片处理 | 按量收费 |
| **AWS S3** | 海外业务 | 全球覆盖、高可用 | 国内访问慢 |

---

## 🚀 快速开始：MinIO 存储

### 1️⃣ 启动 MinIO 服务

```bash
# 使用 Docker Compose 启动 MinIO
docker-compose -f docker-compose.minio.yml up -d

# 查看服务状态
docker-compose -f docker-compose.minio.yml ps

# 查看日志
docker-compose -f docker-compose.minio.yml logs -f minio
```

**访问 MinIO 控制台：**
- URL: http://localhost:9001
- 用户名: `minioadmin`
- 密码: `minioadmin123`

### 2️⃣ 配置环境变量

编辑 `.env` 文件，添加以下配置：

```env
# 存储类型：local, minio, oss
STORAGE_TYPE=minio

# MinIO 配置
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET=product-warehouse
MINIO_SECURE=false
# 可选：配置公开访问URL（如果使用反向代理）
# MINIO_PUBLIC_URL=https://cdn.yourdomain.com
```

### 3️⃣ 安装依赖

```bash
# 安装 MinIO Python SDK
pip install minio==7.2.0

# 或者安装所有依赖
pip install -r requirements.txt
```

### 4️⃣ 启动后端服务

```bash
cd src/Backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

**查看启动日志，确认存储初始化成功：**
```
初始化存储后端: minio
MinIO 存储已初始化: localhost:9000/product-warehouse
```

### 5️⃣ 测试图片上传

使用前端界面或 API 测试工具上传头像或产品图片：

**上传用户头像（需要登录）：**
```bash
curl -X POST "http://localhost:8001/api/v1/users/me/avatar" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/avatar.jpg"
```

**响应示例：**
```json
{
  "avatar_url": "http://localhost:9000/product-warehouse/avatars/avatar_1_abc12345.jpg"
}
```

---

## 🔄 迁移现有图片到 MinIO

如果你之前使用本地文件存储，现在想迁移到 MinIO：

### 1️⃣ 演练模式（查看将要迁移的文件）

```bash
python scripts/migrate_images_to_minio.py --dry-run
```

### 2️⃣ 正式迁移

```bash
python scripts/migrate_images_to_minio.py
```

### 3️⃣ 迁移后验证

1. 访问 MinIO 控制台：http://localhost:9001
2. 进入 `product-warehouse` 存储桶
3. 检查 `avatars/` 和 `products/` 文件夹
4. 验证数据库中的 URL 已更新

---

## ⚙️ 高级配置

### 使用反向代理（生产环境推荐）

如果你想通过域名访问 MinIO（而不是 `localhost:9000`），可以配置 Nginx 反向代理：

**Nginx 配置示例：**

```nginx
server {
    listen 80;
    server_name cdn.yourdomain.com;

    location / {
        proxy_pass http://localhost:9000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 增加文件上传大小限制
        client_max_body_size 10M;
    }
}
```

**更新环境变量：**

```env
MINIO_PUBLIC_URL=http://cdn.yourdomain.com
```

### 配置 HTTPS

1. **获取 SSL 证书**（Let's Encrypt）：

```bash
sudo certbot --nginx -d cdn.yourdomain.com
```

2. **更新环境变量：**

```env
MINIO_SECURE=true
MINIO_PUBLIC_URL=https://cdn.yourdomain.com
```

---

## 🎯 切换到阿里云 OSS

### 1️⃣ 安装依赖

```bash
pip install oss2
```

### 2️⃣ 配置环境变量

```env
STORAGE_TYPE=oss

# 阿里云 OSS 配置
OSS_ACCESS_KEY_ID=your_access_key_id
OSS_ACCESS_KEY_SECRET=your_access_key_secret
OSS_ENDPOINT=oss-cn-hangzhou.aliyuncs.com
OSS_BUCKET=product-warehouse
OSS_CDN_DOMAIN=https://cdn.yourdomain.com  # 可选
```

### 3️⃣ 重启服务

```bash
uvicorn app.main:app --reload
```

---

## 🔒 安全建议

### 生产环境必做：

1. **修改 MinIO 默认密码**

编辑 `docker-compose.minio.yml`：

```yaml
environment:
  MINIO_ROOT_USER: your_custom_username
  MINIO_ROOT_PASSWORD: your_strong_password_here
```

更新 `.env`：

```env
MINIO_ACCESS_KEY=your_custom_username
MINIO_SECRET_KEY=your_strong_password_here
```

2. **配置存储桶访问策略**

MinIO 控制台 → Buckets → product-warehouse → Access Policy → Custom

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {"AWS": "*"},
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::product-warehouse/avatars/*",
                   "arn:aws:s3:::product-warehouse/products/*"]
    }
  ]
}
```

3. **启用 HTTPS**

生产环境务必使用 HTTPS 传输文件。

4. **限制文件大小和类型**

后端已经实现了文件类型和大小限制（2MB），根据需要调整。

---

## 📊 数据库架构

### 用户表（users）

| 字段 | 类型 | 说明 |
|------|------|------|
| `avatar_url` | String(255) | 用户头像URL，可以是本地路径或MinIO/OSS URL |

**示例：**
```sql
-- 本地存储
avatar_url = '/static/avatars/avatar_1_abc123.jpg'

-- MinIO 存储
avatar_url = 'http://localhost:9000/product-warehouse/avatars/avatar_1_abc123.jpg'

-- 阿里云 OSS
avatar_url = 'https://cdn.yourdomain.com/avatars/avatar_1_abc123.jpg'
```

### 产品表（products）

| 字段 | 类型 | 说明 |
|------|------|------|
| `image_url` | String(255) | 产品图片URL |

---

## 🛠️ 故障排查

### 问题 1: MinIO 启动失败

**检查端口占用：**
```bash
lsof -i :9000
lsof -i :9001
```

**解决方案：** 修改 `docker-compose.minio.yml` 中的端口映射

### 问题 2: 上传成功但无法访问图片

**检查存储桶策略：**
- 访问 MinIO 控制台
- 检查 bucket 是否为公开读取
- 检查防火墙规则

### 问题 3: 数据库中 URL 未更新

**手动更新 URL（测试）：**
```sql
UPDATE users SET avatar_url = 'http://localhost:9000/product-warehouse/avatars/avatar_1_abc123.jpg' WHERE id = 1;
```

### 问题 4: 迁移脚本报错

**检查 Python 路径：**
```bash
export PYTHONPATH=/home/user/Product_Warehouse/src/Backend:$PYTHONPATH
python scripts/migrate_images_to_minio.py --dry-run
```

---

## 📦 备份与恢复

### 备份 MinIO 数据

**方法 1: 使用 mc 客户端**

```bash
# 安装 mc
wget https://dl.min.io/client/mc/release/linux-amd64/mc
chmod +x mc

# 配置 MinIO
./mc alias set myminio http://localhost:9000 minioadmin minioadmin123

# 备份
./mc mirror myminio/product-warehouse /backup/minio/
```

**方法 2: Docker Volume 备份**

```bash
docker run --rm -v product-warehouse_minio_data:/data \
  -v /backup:/backup \
  alpine tar czf /backup/minio-data.tar.gz /data
```

### 恢复数据

```bash
docker run --rm -v product-warehouse_minio_data:/data \
  -v /backup:/backup \
  alpine tar xzf /backup/minio-data.tar.gz -C /
```

---

## 🎓 常见问题（FAQ）

### Q1: 本地存储和 MinIO 可以同时使用吗？

不可以。系统同一时间只能使用一种存储后端。但可以通过修改 `STORAGE_TYPE` 环境变量随时切换。

### Q2: 切换存储后端需要重启服务吗？

是的。修改 `.env` 后需要重启后端服务。

### Q3: MinIO 数据持久化在哪里？

数据存储在 Docker Volume 中：`product-warehouse_minio_data`

查看位置：
```bash
docker volume inspect product-warehouse_minio_data
```

### Q4: 如何限制单个文件大小？

在 API 中已经限制为 2MB。如需修改，编辑：
- 头像上传：`src/Backend/app/api/v1/users.py:162`
- 产品图片：类似位置

### Q5: 支持图片压缩和裁剪吗？

用户头像会自动调整为 200x200 像素。产品图片暂未处理。

需要高级图片处理可以考虑：
- 使用阿里云 OSS 的图片处理服务
- 集成 Pillow 或 ImageMagick

---

## 📚 相关资源

- [MinIO 官方文档](https://min.io/docs/minio/linux/index.html)
- [MinIO Python SDK](https://min.io/docs/minio/linux/developers/python/minio-py.html)
- [阿里云 OSS 文档](https://help.aliyun.com/product/31815.html)
- [AWS S3 文档](https://docs.aws.amazon.com/s3/)

---

## 💡 最佳实践

1. **开发环境**：使用本地存储（`STORAGE_TYPE=local`）
2. **测试/预发布**：使用 MinIO（Docker）
3. **生产环境**：
   - 小型项目：MinIO + 备份
   - 中大型项目：阿里云 OSS/AWS S3
   - 全球化项目：AWS S3 + CloudFront CDN

4. **定期备份**：至少每周备份一次 MinIO 数据
5. **监控存储空间**：设置告警，避免磁盘满
6. **CDN 加速**：生产环境建议配置 CDN

---

## 🎉 完成！

现在你的项目已经支持：
- ✅ 多种存储后端（本地/MinIO/OSS/S3）
- ✅ 用户头像上传/删除
- ✅ 产品图片上传/删除（如果已实现）
- ✅ 图片迁移工具
- ✅ 灵活的存储配置

如有问题，请查看故障排查章节或提交 Issue。
