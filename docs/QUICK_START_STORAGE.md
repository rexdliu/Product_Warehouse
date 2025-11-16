# 🚀 图片存储快速开始（5分钟）

## 为什么需要对象存储？

**问题：** 存储大量用户头像和产品图片到数据库？
- ❌ 数据库会膨胀
- ❌ 性能严重下降
- ❌ 备份恢复困难
- ❌ 成本高昂

**解决方案：** 使用对象存储服务
- ✅ 数据库只存 URL（字符串）
- ✅ 图片存储到 MinIO/OSS/S3
- ✅ 可扩展、高性能、低成本

---

## 当前架构

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Frontend  │────────>│   Backend    │────────>│  Database   │
│  (React)    │         │  (FastAPI)   │         │ (MySQL/PG)  │
└─────────────┘         └──────────────┘         └─────────────┘
                               │                         │
                               │                    存储 URL
                               ▼                         │
                        ┌──────────────┐         ┌──────▼──────┐
                        │   Storage    │         │ users.      │
                        │   Backend    │         │ avatar_url  │
                        └──────────────┘         │             │
                               │                 │ products.   │
                               ▼                 │ image_url   │
                    ┌─────────────────────┐      └─────────────┘
                    │  MinIO / OSS / S3   │
                    │  存储实际图片文件     │
                    └─────────────────────┘
```

---

## 快速开始（MinIO）

### 步骤 1: 启动 MinIO

```bash
docker-compose -f docker-compose.minio.yml up -d
```

### 步骤 2: 配置环境变量

在 `.env` 文件中添加：

```env
STORAGE_TYPE=minio
```

就这么简单！其他配置都有默认值。

### 步骤 3: 安装依赖

```bash
pip install minio==7.2.0
```

### 步骤 4: 启动后端

```bash
cd src/Backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

查看日志，确认成功：
```
初始化存储后端: minio
MinIO 存储已初始化: localhost:9000/product-warehouse
```

### 步骤 5: 测试上传

访问前端，登录后上传头像，成功！

---

## 切换存储后端

只需修改 `.env` 中的一行：

```env
# 本地文件存储（开发）
STORAGE_TYPE=local

# MinIO（推荐）
STORAGE_TYPE=minio

# 阿里云 OSS
STORAGE_TYPE=oss

# AWS S3
STORAGE_TYPE=s3
```

---

## 迁移现有图片

如果之前使用本地存储，现在想迁移到 MinIO：

```bash
# 1. 演练（不实际迁移）
python scripts/migrate_images_to_minio.py --dry-run

# 2. 正式迁移
python scripts/migrate_images_to_minio.py
```

---

## 访问 MinIO 控制台

URL: http://localhost:9001

- 用户名: `minioadmin`
- 密码: `minioadmin123`

可以查看所有已上传的文件。

---

## 生产环境建议

1. **修改默认密码**
   - 编辑 `docker-compose.minio.yml`
   - 更新 `.env` 中的 `MINIO_ACCESS_KEY` 和 `MINIO_SECRET_KEY`

2. **启用 HTTPS**
   - 配置 Nginx 反向代理
   - 设置 `MINIO_SECURE=true`

3. **定期备份**
   - MinIO 数据存储在 Docker Volume
   - 定期备份到云端或异地

---

## 常见问题

**Q: MinIO 数据存在哪里？**
A: Docker Volume `product-warehouse_minio_data`

**Q: 需要重启服务吗？**
A: 修改 `.env` 后需要重启后端

**Q: 本地存储和 MinIO 可以共存吗？**
A: 不可以，同一时间只能用一种存储后端

**Q: 如何删除 MinIO 服务？**
```bash
docker-compose -f docker-compose.minio.yml down -v
```

---

## 完整文档

详细配置请查看：
- [完整存储配置指南](./STORAGE_SETUP_GUIDE.md)
- [环境变量配置示例](../.env.storage.example)

---

**🎉 完成！现在你的系统可以处理海量图片了！**
