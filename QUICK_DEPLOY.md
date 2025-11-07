# ECS 快速部署指南（简化版）

本指南帮助你快速将项目部署到阿里云ECS，**不涉及SSL、SSH安全配置、Nginx等复杂设置**。
目标：通过域名访问网站，前后端都能正常工作。

## 📋 准备工作

### 1. ECS服务器要求
- **配置**：2核4GB内存或以上
- **操作系统**：Ubuntu 20.04/22.04 或 CentOS 7/8
- **公网IP**：必须有公网IP地址
- **域名**：已绑定到ECS的公网IP

### 2. 域名解析设置

在你的域名管理后台（如阿里云、腾讯云、Cloudflare等）添加A记录：

```
类型: A
主机记录: @ 或 www
记录值: 你的ECS公网IP（如：47.123.456.789）
TTL: 600
```

等待5-10分钟DNS生效。

### 3. 检查ECS安全组

在阿里云控制台配置安全组规则，开放以下端口：

| 端口 | 协议 | 用途 |
|------|------|------|
| 22 | TCP | SSH连接（临时使用） |
| 8001 | TCP | 后端服务（临时使用） |
| 80 | TCP | HTTP访问（可选，为以后Nginx做准备） |

**重要**：安全组入方向规则示例：
```
优先级: 1
策略: 允许
协议类型: TCP
端口范围: 8001/8001
授权对象: 0.0.0.0/0
描述: FastAPI服务
```

---

## 🚀 部署步骤

### 步骤 1：连接到ECS服务器

```bash
# 使用SSH连接（在你的本地电脑执行）
ssh root@你的ECS公网IP

# 或使用阿里云控制台的"远程连接"功能
```

### 步骤 2：安装基础软件

```bash
# 更新系统包
sudo apt update && sudo apt upgrade -y  # Ubuntu
# 或
sudo yum update -y  # CentOS

# 安装Git
sudo apt install -y git  # Ubuntu
# 或
sudo yum install -y git  # CentOS

# 安装Python 3.10+
sudo apt install -y python3 python3-pip python3-venv  # Ubuntu
# 或
sudo yum install -y python3 python3-pip  # CentOS

# 验证Python版本
python3 --version  # 应该是 3.8+

# 安装Node.js 18+
# Ubuntu:
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# CentOS:
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# 验证Node版本
node --version  # 应该是 v18.x 或更高
npm --version
```

### 步骤 3：克隆项目代码

```bash
# 进入home目录
cd ~

# 克隆你的项目（替换为你的仓库地址）
git clone https://github.com/rexdliu/Product_Warehouse.git

# 进入项目目录
cd Product_Warehouse

# 切换到部署分支（如果有）
git checkout main  # 或你的生产分支
```

### 步骤 4：配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
nano .env  # 或使用 vi .env
```

**重要**：修改以下内容：

```bash
# 数据库配置（使用你的RDS信息）
DATABASE_URL=mysql+pymysql://rex:Liuyerong729!@rm-zf80cj27ot21b1f2exo.mysql.kualalumpur.rds.aliyuncs.com/test_data

# JWT安全密钥（生成新的随机密钥）
SECRET_KEY=$(openssl rand -hex 32)  # 先运行这个命令生成，然后复制结果

# Token过期时间（分钟）
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS配置（允许你的域名访问）
BACKEND_CORS_ORIGINS=["http://your-domain.com","https://your-domain.com"]

# 环境标识
ENVIRONMENT=production
DEBUG=False
```

**按 Ctrl+X，然后 Y，然后 Enter 保存**

### 步骤 5：安装Python依赖

```bash
# 创建Python虚拟环境
python3 -m venv .venv

# 激活虚拟环境
source .venv/bin/activate

# 升级pip
pip install --upgrade pip

# 安装后端依赖
pip install -r requirements.txt

# 如果遇到错误，可以手动安装关键依赖
pip install fastapi uvicorn sqlalchemy pymysql python-jose passlib bcrypt python-multipart pydantic-settings
```

### 步骤 6：构建前端

```bash
# 安装前端依赖
npm install

# 构建生产版本
npm run build

# 验证dist目录已生成
ls -la dist/  # 应该看到 index.html 等文件
```

### 步骤 7：测试数据库连接

```bash
# 测试数据库连接
python3 << 'PYEOF'
from sqlalchemy import create_engine
import os

# 读取环境变量
db_url = "mysql+pymysql://rex:Liuyerong729!@rm-gs54780452unf94747o.mysql.singapore.rds.aliyuncs.com:3306/product_warehouse"

try:
    engine = create_engine(db_url)
    conn = engine.connect()
    print("✅ 数据库连接成功！")
    conn.close()
except Exception as e:
    print(f"❌ 数据库连接失败: {e}")
PYEOF
```

如果失败，检查：
1. RDS安全白名单是否包含ECS的IP
2. DATABASE_URL是否正确

### 步骤 8：运行后端服务（测试）

```bash
# 确保虚拟环境已激活
source .venv/bin/activate

# 设置PYTHONPATH
export PYTHONPATH=src/Backend

# 运行服务（前台测试）
uvicorn app.main:app --host 0.0.0.0 --port 8001

# 你应该看到：
# INFO:     Uvicorn running on http://0.0.0.0:8001
# INFO:     Application startup complete.
```

**不要关闭这个终端**，打开新终端测试：

```bash
# 在本地电脑测试（替换为你的ECS IP）
curl http://你的ECS公网IP:8001/health

# 应该返回：
# {"status":"healthy"}
```

如果成功，**按 Ctrl+C 停止服务**，继续下一步。

### 步骤 9：使用screen在后台运行服务

```bash
# 安装screen
sudo apt install -y screen  # Ubuntu
# 或
sudo yum install -y screen  # CentOS

# 创建一个新的screen会话
screen -S warehouse

# 在screen中激活虚拟环境
source .venv/bin/activate

# 设置环境变量
export PYTHONPATH=src/Backend

# 运行服务（正式运行）
uvicorn app.main:app --host 0.0.0.0 --port 8001 --workers 2

# 按 Ctrl+A，然后按 D 分离screen（服务继续在后台运行）
```

**screen常用命令**：
```bash
screen -ls              # 查看所有screen会话
screen -r warehouse     # 重新连接到warehouse会话
screen -X -S warehouse quit  # 关闭warehouse会话
```

### 步骤 10：测试访问

#### 测试后端API

```bash
# 在本地电脑测试
curl http://你的域名:8001/health
# 或
curl http://你的ECS公网IP:8001/health

# 应该返回：{"status":"healthy"}
```

#### 测试前端页面

在浏览器访问：
```
http://你的域名:8001
或
http://你的ECS公网IP:8001
```

你应该能看到登录页面！

---

## 📝 访问你的网站

### 方式 1：通过域名访问（推荐）
```
http://your-domain.com:8001
```

### 方式 2：通过IP访问
```
http://47.123.456.789:8001
```

**注意**：当前方案使用8001端口，URL需要加端口号。

---

## 🔧 服务管理

### 查看服务状态

```bash
# 查看screen会话
screen -ls

# 重新连接到服务
screen -r warehouse

# 查看日志（在screen会话中）
# 日志会实时显示在终端
```

### 停止服务

```bash
# 方法1：进入screen会话后按Ctrl+C
screen -r warehouse
# 然后按 Ctrl+C

# 方法2：直接关闭screen会话
screen -X -S warehouse quit
```

### 重启服务

```bash
# 停止服务
screen -X -S warehouse quit

# 重新启动
cd ~/Product_Warehouse
screen -S warehouse
source .venv/bin/activate
export PYTHONPATH=src/Backend
uvicorn app.main:app --host 0.0.0.0 --port 8001 --workers 2
# 按 Ctrl+A + D 分离
```

### 更新代码

```bash
# 停止服务
screen -X -S warehouse quit

# 进入项目目录
cd ~/Product_Warehouse

# 拉取最新代码
git pull origin main

# 激活虚拟环境
source .venv/bin/activate

# 安装新的依赖（如果有）
pip install -r requirements.txt
npm install

# 重新构建前端
npm run build

# 重启服务
screen -S warehouse
source .venv/bin/activate
export PYTHONPATH=src/Backend
uvicorn app.main:app --host 0.0.0.0 --port 8001 --workers 2
# 按 Ctrl+A + D
```

---

## ⚠️ 常见问题

### 1. 无法访问网站（连接被拒绝）

**检查清单**：
- [ ] ECS安全组是否开放8001端口
- [ ] 后端服务是否正在运行（`screen -r warehouse`查看）
- [ ] 使用 `curl http://localhost:8001/health` 在ECS上测试
- [ ] 防火墙是否阻止（Ubuntu: `sudo ufw status`）

**解决方法**：
```bash
# 检查服务是否运行
screen -ls

# 检查端口是否监听
sudo netstat -tlnp | grep 8001
# 或
sudo ss -tlnp | grep 8001

# 关闭Ubuntu防火墙（临时，用于测试）
sudo ufw disable
```

### 2. 数据库连接失败

**检查清单**：
- [ ] RDS白名单是否包含ECS的公网IP
- [ ] DATABASE_URL是否正确
- [ ] RDS实例是否正常运行

**解决方法**：
```bash
# 在RDS控制台添加白名单
# 添加你的ECS公网IP到"数据安全性 → 白名单设置"

# 测试连接
mysql -h rm-gs54780452unf94747o.mysql.singapore.rds.aliyuncs.com \
  -u rex -p product_warehouse
# 输入密码后应该能连接
```

### 3. 前端页面空白或404

**检查**：
- dist目录是否存在且有文件
- 后端main.py是否正确配置了静态文件

```bash
# 检查dist目录
ls -la dist/

# 重新构建
npm run build

# 重启服务
```

### 4. API请求失败（CORS错误）

**检查**：
- .env中的BACKEND_CORS_ORIGINS是否包含你的域名

```bash
# 编辑.env
nano .env

# 确保包含你的域名
BACKEND_CORS_ORIGINS=["http://your-domain.com","http://your-domain.com:8001"]
```

### 5. screen会话意外退出

```bash
# 查看screen日志
screen -r warehouse

# 如果没有会话，重新启动
cd ~/Product_Warehouse
screen -S warehouse
source .venv/bin/activate
export PYTHONPATH=src/Backend
uvicorn app.main:app --host 0.0.0.0 --port 8001 --workers 2
# Ctrl+A + D
```

---

## 📊 验证部署成功

### 检查清单

- [ ] **后端健康检查**：`curl http://你的域名:8001/health` 返回 `{"status":"healthy"}`
- [ ] **前端页面**：浏览器能打开 `http://你的域名:8001`
- [ ] **登录功能**：能够注册和登录
- [ ] **API调用**：登录后能看到数据
- [ ] **数据库连接**：设置保存后刷新页面仍保持

---

## 🎯 下一步优化（可选）

部署成功后，你可以考虑以下优化：

### 短期优化（推荐）
1. **配置Nginx反向代理** - 去掉URL中的端口号
2. **配置SSL证书** - 使用HTTPS（Let's Encrypt免费）
3. **使用Systemd管理服务** - 替代screen，更可靠

### 中期优化
4. **配置域名**没有端口号直接访问
5. **设置日志轮转**
6. **配置监控告警**

### 长期优化
7. **使用Docker容器化**
8. **配置负载均衡**（多台ECS）
9. **配置CDN加速**
10. **设置自动备份**

参考完整的 **ECS_DEPLOYMENT.md** 获取详细步骤。

---

## 💡 快速命令参考

```bash
# 连接ECS
ssh root@你的ECS公网IP

# 查看服务
screen -r warehouse

# 停止服务
screen -X -S warehouse quit

# 重启服务
cd ~/Product_Warehouse
screen -S warehouse
source .venv/bin/activate
export PYTHONPATH=src/Backend
uvicorn app.main:app --host 0.0.0.0 --port 8001 --workers 2
# Ctrl+A + D

# 更新代码
cd ~/Product_Warehouse
git pull
npm run build
# 然后重启服务

# 查看日志
screen -r warehouse  # 实时日志

# 测试健康
curl http://localhost:8001/health
```

---

## 📞 获取帮助

如果遇到问题：

1. **查看后端日志**：`screen -r warehouse`
2. **查看ECS系统日志**：`journalctl -xe`
3. **测试网络连接**：`curl http://localhost:8001/health`
4. **检查进程**：`ps aux | grep uvicorn`
5. **检查端口**：`sudo netstat -tlnp | grep 8001`

---

## 🎉 完成！

如果你能通过域名访问网站，恭喜你！部署成功！

现在你可以：
- ✅ 通过 `http://你的域名:8001` 访问网站
- ✅ 注册和登录
- ✅ 使用所有功能
- ✅ 数据保存到阿里云RDS

**记住**：当前是简化部署，生产环境建议参考 ECS_DEPLOYMENT.md 进行完整配置。
