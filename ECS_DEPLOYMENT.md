# ECS 服务器部署指南

## 目录
1. [部署架构](#部署架构)
2. [环境要求](#环境要求)
3. [部署步骤](#部署步骤)
4. [配置说明](#配置说明)
5. [安全配置](#安全配置)
6. [监控和维护](#监控和维护)
7. [故障排除](#故障排除)

## 部署架构

### 推荐架构（单服务器方案）
```
Internet
    ↓
[ECS 服务器]
    ├─ Nginx (端口 80/443)
    │   ├─ 静态文件服务 (前端)
    │   └─ 反向代理 /api → 后端
    ├─ FastAPI 后端 (端口 8001)
    └─ MySQL 数据库连接
        └─ 阿里云 RDS (外部)
```

### 高可用架构（多服务器方案）
```
Internet
    ↓
[负载均衡器 SLB]
    ↓
[前端服务器集群]         [后端服务器集群]
    ├─ ECS-Web-01            ├─ ECS-API-01
    ├─ ECS-Web-02            ├─ ECS-API-02
    └─ ECS-Web-03            └─ ECS-API-03
                                   ↓
                            [阿里云 RDS MySQL]
```

## 环境要求

### 服务器配置建议
- **最小配置**：2核CPU，4GB内存，40GB存储
- **推荐配置**：4核CPU，8GB内存，100GB存储
- **操作系统**：Ubuntu 22.04 LTS 或 CentOS 8+
- **网络**：公网IP，开放端口 80, 443, 22

### 软件依赖
- Python 3.10+
- Node.js 18+
- Nginx 1.18+
- Git
- 虚拟环境工具（venv）

## 部署步骤

### 步骤 1: 准备 ECS 服务器

```bash
# 1. 连接到 ECS 服务器
ssh root@your-ecs-ip

# 2. 更新系统
sudo apt update && sudo apt upgrade -y  # Ubuntu
# 或
sudo yum update -y  # CentOS

# 3. 安装基础软件
sudo apt install -y git nginx python3 python3-pip python3-venv nodejs npm  # Ubuntu
# 或
sudo yum install -y git nginx python3 python3-pip nodejs npm  # CentOS

# 4. 创建应用用户（安全最佳实践）
sudo useradd -m -s /bin/bash warehouse
sudo usermod -aG sudo warehouse  # Ubuntu
# 或
sudo usermod -aG wheel warehouse  # CentOS

# 5. 切换到应用用户
sudo su - warehouse
```

### 步骤 2: 部署应用代码

```bash
# 1. 克隆项目代码
cd ~
git clone https://github.com/your-org/Product_Warehouse.git
cd Product_Warehouse

# 2. 检出部署分支
git checkout main  # 或您的生产分支

# 3. 设置环境变量
cp .env.example .env
nano .env  # 编辑配置文件
```

### 步骤 3: 配置环境变量

编辑 `.env` 文件：

```bash
# 数据库配置（使用您的 RDS 连接信息）
DATABASE_URL=mysql+pymysql://rex:Liuyerong729!@rm-gs54780452unf94747o.mysql.singapore.rds.aliyuncs.com:3306/product_warehouse

# JWT 安全配置
SECRET_KEY=生成一个强随机密钥  # 使用 openssl rand -hex 32 生成
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS 配置（生产环境）
BACKEND_CORS_ORIGINS=["https://your-domain.com","https://www.your-domain.com"]

# 环境标识
ENVIRONMENT=production
DEBUG=False

# AI 服务配置（可选）
OPENAI_API_KEY=your-openai-api-key
RAG_ENABLED=true
```

**重要**: 生成安全的 SECRET_KEY：
```bash
openssl rand -hex 32
```

### 步骤 4: 安装 Python 后端依赖

```bash
# 1. 创建虚拟环境
python3 -m venv .venv

# 2. 激活虚拟环境
source .venv/bin/activate

# 3. 安装依赖
pip install --upgrade pip
pip install -r requirements.txt  # 需要创建 requirements.txt

# 如果没有 requirements.txt，手动安装：
pip install fastapi uvicorn sqlalchemy pymysql python-jose passlib bcrypt python-multipart pydantic-settings
```

### 步骤 5: 构建前端应用

```bash
# 1. 安装前端依赖
npm install

# 2. 构建生产版本
npm run build

# 生成的静态文件将位于 dist/ 目录
```

### 步骤 6: 配置 Nginx

创建 Nginx 配置文件：

```bash
sudo nano /etc/nginx/sites-available/warehouse-ai
```

添加以下配置：

```nginx
# HTTP 服务器配置（重定向到 HTTPS）
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # 重定向所有 HTTP 请求到 HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS 服务器配置
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL 证书配置（使用 Let's Encrypt）
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 日志配置
    access_log /var/log/nginx/warehouse-ai-access.log;
    error_log /var/log/nginx/warehouse-ai-error.log;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;

    # 前端静态文件
    location / {
        root /home/warehouse/Product_Warehouse/dist;
        index index.html;
        try_files $uri $uri/ /index.html;

        # 静态资源缓存
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API 后端代理
    location /api/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # 超时配置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 健康检查端点
    location /health {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host $host;
        access_log off;
    }

    # 安全头部
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

启用配置：

```bash
# 创建符号链接
sudo ln -s /etc/nginx/sites-available/warehouse-ai /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 步骤 7: 配置 SSL 证书（使用 Let's Encrypt）

```bash
# 1. 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y  # Ubuntu
# 或
sudo yum install certbot python3-certbot-nginx -y  # CentOS

# 2. 获取 SSL 证书
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 3. 设置自动续期
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### 步骤 8: 配置 Systemd 服务

创建 systemd 服务文件以管理后端应用：

```bash
sudo nano /etc/systemd/system/warehouse-api.service
```

添加以下内容：

```ini
[Unit]
Description=WarehouseAI FastAPI Backend
After=network.target

[Service]
Type=simple
User=warehouse
Group=warehouse
WorkingDirectory=/home/warehouse/Product_Warehouse
Environment="PATH=/home/warehouse/Product_Warehouse/.venv/bin"
Environment="PYTHONPATH=/home/warehouse/Product_Warehouse/src/Backend"
ExecStart=/home/warehouse/Product_Warehouse/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8001 --workers 4

# 重启策略
Restart=always
RestartSec=10

# 日志
StandardOutput=append:/var/log/warehouse-api/access.log
StandardError=append:/var/log/warehouse-api/error.log

[Install]
WantedBy=multi-user.target
```

创建日志目录：

```bash
sudo mkdir -p /var/log/warehouse-api
sudo chown warehouse:warehouse /var/log/warehouse-api
```

启动服务：

```bash
# 重载 systemd
sudo systemctl daemon-reload

# 启动服务
sudo systemctl start warehouse-api

# 设置开机自启
sudo systemctl enable warehouse-api

# 查看状态
sudo systemctl status warehouse-api
```

### 步骤 9: 配置防火墙

```bash
# Ubuntu (UFW)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# CentOS (FirewallD)
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## 配置说明

### 数据库迁移

```bash
# 如果使用 Alembic 进行数据库迁移
cd /home/warehouse/Product_Warehouse
source .venv/bin/activate
cd src/Backend

# 初始化 Alembic（首次）
alembic init alembic

# 创建迁移脚本
alembic revision --autogenerate -m "Initial migration"

# 执行迁移
alembic upgrade head
```

### 环境变量管理

推荐使用环境变量管理工具或 `.env` 文件，避免硬编码敏感信息。

### 日志配置

- **Nginx 日志**: `/var/log/nginx/warehouse-ai-*.log`
- **后端日志**: `/var/log/warehouse-api/*.log`
- **系统日志**: `journalctl -u warehouse-api`

## 安全配置

### 1. 数据库安全

- ✅ 已使用阿里云 RDS，无需在 ECS 上运行数据库
- ✅ 确保 RDS 白名单只允许 ECS 服务器 IP 访问
- ✅ 使用强密码
- ✅ 定期备份数据库

### 2. 应用安全

```bash
# 设置正确的文件权限
cd /home/warehouse/Product_Warehouse
chmod 750 .
chmod 640 .env
chown -R warehouse:warehouse .

# 限制敏感文件访问
chmod 600 .env
```

### 3. SSH 安全

```bash
# 编辑 SSH 配置
sudo nano /etc/ssh/sshd_config

# 推荐设置：
# PermitRootLogin no
# PasswordAuthentication no  # 使用 SSH 密钥
# Port 2222  # 修改默认端口

# 重启 SSH 服务
sudo systemctl restart sshd
```

### 4. 定期更新

```bash
# 设置自动安全更新（Ubuntu）
sudo apt install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

## 监控和维护

### 1. 服务监控

```bash
# 查看后端服务状态
sudo systemctl status warehouse-api

# 查看实时日志
sudo journalctl -u warehouse-api -f

# 查看 Nginx 日志
sudo tail -f /var/log/nginx/warehouse-ai-access.log
```

### 2. 性能监控

安装监控工具：

```bash
# 安装 htop（进程监控）
sudo apt install htop -y

# 安装 netdata（系统监控）
bash <(curl -Ss https://my-netdata.io/kickstart.sh)
```

### 3. 数据库监控

通过阿里云控制台监控 RDS 性能指标。

### 4. 应用更新

```bash
# 更新应用代码
cd /home/warehouse/Product_Warehouse
git pull origin main

# 重新构建前端
npm install
npm run build

# 重启后端服务
sudo systemctl restart warehouse-api
```

## 故障排除

### 常见问题

#### 1. 后端服务无法启动

```bash
# 查看详细日志
sudo journalctl -u warehouse-api -n 100 --no-pager

# 检查端口占用
sudo lsof -i :8001

# 检查 Python 依赖
source .venv/bin/activate
pip list
```

#### 2. 数据库连接失败

```bash
# 测试数据库连接
python3 << EOF
from sqlalchemy import create_engine
engine = create_engine("你的DATABASE_URL")
try:
    conn = engine.connect()
    print("✅ 数据库连接成功")
    conn.close()
except Exception as e:
    print(f"❌ 数据库连接失败: {e}")
EOF
```

#### 3. Nginx 502 Bad Gateway

```bash
# 检查后端服务是否运行
sudo systemctl status warehouse-api

# 检查端口监听
sudo netstat -tlnp | grep 8001

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/warehouse-ai-error.log
```

#### 4. 前端静态文件无法访问

```bash
# 检查文件权限
ls -la /home/warehouse/Product_Warehouse/dist

# 确保 Nginx 用户可以访问
sudo chmod -R 755 /home/warehouse/Product_Warehouse/dist
```

### 应急恢复

```bash
# 快速回滚到上一个版本
cd /home/warehouse/Product_Warehouse
git log --oneline -n 5  # 查看提交历史
git checkout <previous-commit-hash>
npm run build
sudo systemctl restart warehouse-api
```

## 性能优化建议

### 1. 后端优化

- 使用多个 worker 进程（在 systemd 配置中）
- 启用数据库连接池（已在 database.py 中配置）
- 使用 Redis 缓存热点数据

### 2. 前端优化

- ✅ 已启用 Gzip 压缩
- ✅ 已配置静态资源缓存
- 使用 CDN 加速静态资源

### 3. 数据库优化

- 添加适当的索引
- 定期分析查询性能
- 使用读写分离（如需要）

## 备份策略

### 1. 数据库备份

使用阿里云 RDS 自动备份功能（推荐），或手动备份：

```bash
# 创建备份脚本
nano ~/backup-db.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/warehouse/backups"
mkdir -p $BACKUP_DIR

# 导出数据库
mysqldump -h rm-gs54780452unf94747o.mysql.singapore.rds.aliyuncs.com \
    -u rex -p'Liuyerong729!' product_warehouse \
    > $BACKUP_DIR/warehouse_$DATE.sql

# 压缩备份
gzip $BACKUP_DIR/warehouse_$DATE.sql

# 删除7天前的备份
find $BACKUP_DIR -name "warehouse_*.sql.gz" -mtime +7 -delete

echo "✅ 备份完成: warehouse_$DATE.sql.gz"
```

```bash
chmod +x ~/backup-db.sh

# 设置定时任务（每天凌晨2点）
crontab -e
# 添加：0 2 * * * /home/warehouse/backup-db.sh
```

### 2. 代码备份

使用 Git 版本控制，定期推送到远程仓库。

### 3. 配置备份

```bash
# 备份重要配置文件
cp .env ~/.env.backup
cp /etc/nginx/sites-available/warehouse-ai ~/nginx.conf.backup
```

## 总结

按照以上步骤，您可以将 WarehouseAI 项目成功部署到阿里云 ECS 服务器。关键要点：

1. ✅ 使用 Nginx 作为反向代理和静态文件服务器
2. ✅ 使用 Systemd 管理后端服务
3. ✅ 配置 SSL 证书确保 HTTPS 安全
4. ✅ 连接到阿里云 RDS MySQL 数据库
5. ✅ 实施安全最佳实践
6. ✅ 设置监控和日志系统
7. ✅ 定期备份数据和配置

如有问题，请参考故障排除部分或联系技术支持。
