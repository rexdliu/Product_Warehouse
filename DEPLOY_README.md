# 🚀 快速部署到ECS

本文档指导你将WarehouseAI快速部署到阿里云ECS服务器。

## 前提条件

- ✅ 已有阿里云ECS服务器（2核4GB或以上）
- ✅ 域名已解析到ECS公网IP
- ✅ ECS安全组已开放8001端口
- ✅ 可以SSH连接到ECS

## 方法一：自动部署（推荐）⭐

### 1. 连接到ECS服务器

```bash
ssh root@你的ECS公网IP
```

### 2. 安装必要软件（首次部署）

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y git python3 python3-pip python3-venv nodejs npm screen

# 或 CentOS/RHEL
sudo yum install -y git python3 python3-pip nodejs npm screen
```

### 3. 克隆项目

```bash
cd ~
git clone https://github.com/rexdliu/Product_Warehouse.git
cd Product_Warehouse
```

### 4. 配置环境变量

```bash
cp .env.example .env
nano .env  # 编辑配置文件
```

**必须修改的配置**：
```bash
# 数据库连接（你的RDS信息）
DATABASE_URL=mysql+pymysql://用户名:密码@RDS地址:3306/数据库名

# 安全密钥（生成新的）
SECRET_KEY=$(openssl rand -hex 32)

# CORS（你的域名）
BACKEND_CORS_ORIGINS=["http://your-domain.com"]
```

按 **Ctrl+X → Y → Enter** 保存。

### 5. 一键部署

```bash
bash deploy.sh
```

脚本会自动完成：
- ✅ 检查环境
- ✅ 安装依赖
- ✅ 构建前端
- ✅ 测试数据库连接
- ✅ 启动服务

### 6. 访问网站

打开浏览器访问：
```
http://你的域名:8001
```

**完成！** 🎉

---

## 方法二：手动部署

详细步骤请参考 **[QUICK_DEPLOY.md](./QUICK_DEPLOY.md)**

---

## 常用命令

### 查看服务状态

```bash
# 查看服务
screen -r warehouse

# 分离screen（不关闭服务）
按 Ctrl+A，然后按 D

# 查看所有screen会话
screen -ls
```

### 停止服务

```bash
screen -X -S warehouse quit
```

### 重启服务

```bash
# 停止
screen -X -S warehouse quit

# 重新部署
cd ~/Product_Warehouse
bash deploy.sh
```

### 更新代码

```bash
cd ~/Product_Warehouse
git pull origin main
bash deploy.sh
```

---

## 检查清单

### 部署前检查

- [ ] ECS服务器已创建并可以SSH连接
- [ ] 域名已解析到ECS公网IP（A记录）
- [ ] ECS安全组已开放8001端口（TCP入方向）
- [ ] RDS白名单包含ECS的IP地址
- [ ] 已准备好DATABASE_URL连接字符串

### 部署后验证

- [ ] 访问 `http://域名:8001/health` 返回 `{"status":"healthy"}`
- [ ] 访问 `http://域名:8001` 能看到登录页面
- [ ] 能够注册新用户
- [ ] 能够登录
- [ ] 能够修改设置并保存

---

## 常见问题

### 1. 无法访问网站

**检查**：
```bash
# 在ECS上测试本地访问
curl http://localhost:8001/health

# 检查服务是否运行
screen -r warehouse

# 检查端口是否监听
sudo netstat -tlnp | grep 8001
```

**如果本地访问OK但外网无法访问**：
- 检查ECS安全组是否开放8001端口
- 检查域名DNS是否生效（`ping 你的域名`）

### 2. 数据库连接失败

**检查**：
- RDS白名单是否包含ECS的IP
- DATABASE_URL是否正确
- 网络连通性：`telnet RDS地址 3306`

### 3. 前端页面空白

**解决**：
```bash
cd ~/Product_Warehouse
npm run build  # 重新构建
screen -X -S warehouse quit  # 重启服务
bash deploy.sh
```

### 4. 查看详细日志

```bash
# 连接到服务查看实时日志
screen -r warehouse

# 如果screen会话不存在
cd ~/Product_Warehouse
source .venv/bin/activate
export PYTHONPATH=src/Backend
uvicorn app.main:app --host 0.0.0.0 --port 8001 --log-level debug
```

---

## 目录结构

```
Product_Warehouse/
├── deploy.sh              # 一键部署脚本 ⭐
├── DEPLOY_README.md       # 本文档（快速指南）
├── QUICK_DEPLOY.md        # 详细部署文档
├── ECS_DEPLOYMENT.md      # 完整部署文档（Nginx+SSL）
├── .env                   # 环境变量配置
├── dist/                  # 前端构建文件
├── src/
│   ├── Backend/           # 后端代码
│   └── ...
└── ...
```

---

## 性能优化建议

当前部署方案是**最简化版本**，适合快速上线和测试。

### 下一步优化（可选）

参考 **[ECS_DEPLOYMENT.md](./ECS_DEPLOYMENT.md)** 实现：

1. **配置Nginx反向代理** - 去掉URL中的:8001端口
2. **配置SSL证书** - 使用HTTPS（Let's Encrypt免费）
3. **使用Systemd** - 替代screen，更稳定
4. **配置域名** - 直接通过域名访问，无需端口
5. **日志管理** - 集中日志和轮转
6. **监控告警** - 配置服务监控

---

## 技术架构

当前部署方案：

```
用户浏览器
    ↓
http://域名:8001
    ↓
FastAPI服务（Uvicorn）
    ├─ 前端静态文件（/dist）
    ├─ API路由（/api/v1/*）
    └─ 健康检查（/health）
    ↓
阿里云RDS MySQL
```

**特点**：
- ✅ 单个服务，简单易管理
- ✅ FastAPI同时serve前端和API
- ✅ 不需要Nginx
- ⚠️ 需要在URL中加端口号（:8001）

---

## 获取帮助

**文档**：
- [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) - 详细的手动部署步骤
- [ECS_DEPLOYMENT.md](./ECS_DEPLOYMENT.md) - 生产级完整部署方案
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - 功能测试指南

**排查问题**：
1. 查看服务日志：`screen -r warehouse`
2. 测试健康检查：`curl http://localhost:8001/health`
3. 检查进程：`ps aux | grep uvicorn`
4. 检查端口：`sudo netstat -tlnp | grep 8001`

---

## 总结

使用本指南，你可以在 **5-10分钟** 内完成部署：

1. ✅ 连接ECS
2. ✅ 克隆代码
3. ✅ 配置.env
4. ✅ 运行 `bash deploy.sh`
5. ✅ 访问网站

**祝你部署顺利！** 🚀

如有问题，请查看详细文档或在GitHub提issue。
