# 🚀 www.rexp.top 部署总结

## 📌 部署目标

将 WarehouseAI 项目部署到阿里云ECS，通过域名 **www.rexp.top:8001** 访问。

---

## 🎯 快速开始（3步部署）

### 在你的本地电脑完成：

1. **生成JWT密钥**
   ```bash
   openssl rand -hex 32
   ```
   记录生成的密钥，稍后配置.env时使用。

2. **确保最新代码已推送**
   ```bash
   git push origin claude/ecs-server-connection-011CURG2McoynLMudoNvuE6e
   ```

### 在ECS服务器上完成：

3. **运行一键部署**
   ```bash
   # SSH连接到ECS
   ssh root@你的ECS公网IP

   # 克隆项目
   cd ~
   git clone https://github.com/rexdliu/Product_Warehouse.git
   cd Product_Warehouse

   # 配置环境变量
   cp .env.production.example .env
   nano .env  # 修改SECRET_KEY，粘贴步骤1生成的密钥

   # 运行部署脚本
   bash deploy.sh
   ```

**完成！** 访问 http://www.rexp.top:8001

---

## 📋 详细文档索引

| 文档 | 用途 | 适用场景 |
|------|------|----------|
| **PRE_DEPLOY_CHECKLIST.md** | 部署前完整检查清单 | 首次部署，确保万无一失 |
| **verify_config.sh** | 自动化配置验证脚本 | 快速检查环境是否就绪 |
| **DEPLOY_README.md** | 快速部署指南（5-10分钟） | 熟悉部署流程后使用 |
| **QUICK_DEPLOY.md** | 详细部署步骤说明 | 遇到问题时查阅 |
| **ECS_DEPLOYMENT.md** | 生产级完整部署方案 | 后续优化（Nginx+SSL+安全） |
| **TESTING_GUIDE.md** | 功能测试指南 | 验证所有功能正常工作 |

---

## 🔧 你的配置信息

### 服务器信息
- **域名**: www.rexp.top
- **访问地址**: http://www.rexp.top:8001
- **服务端口**: 8001

### 数据库信息
- **类型**: 阿里云RDS MySQL
- **地址**: rm-zf80cj27ot21b1f2exo.mysql.kualalumpur.rds.aliyuncs.com
- **数据库名**: test_data
- **用户名**: rex
- **地域**: 吉隆坡 (Kuala Lumpur)

### 环境配置
- **前端**: React + TypeScript + Vite
- **后端**: FastAPI + Python
- **架构**: 单一服务（FastAPI同时serve前端和API）
- **进程管理**: screen

---

## ⚙️ 关键配置文件

### .env 配置（生产环境）

基于 `.env.production.example` 创建，必须修改的内容：

```bash
# 数据库（已配置好，无需修改）
DATABASE_URL=mysql+pymysql://rex:Liuyerong729!@rm-zf80cj27ot21b1f2exo.mysql.kualalumpur.rds.aliyuncs.com/test_data

# JWT密钥（⚠️ 必须替换）
SECRET_KEY=[粘贴你生成的32字节随机密钥]

# CORS（已配置好www.rexp.top）
BACKEND_CORS_ORIGINS=["http://www.rexp.top","http://www.rexp.top:8001","https://www.rexp.top",...]

# 环境（已配置）
ENVIRONMENT=production
DEBUG=False
```

**⚠️ 重要提醒**：
1. **SECRET_KEY** 必须使用 `openssl rand -hex 32` 生成
2. 不要使用示例中的默认值！
3. 生产环境必须保证SECRET_KEY的安全性

---

## ✅ 部署前检查

### 方法1：自动检查（推荐）

```bash
# 在ECS上运行
cd ~/Product_Warehouse
bash verify_config.sh
```

这个脚本会自动检查：
- ✓ 系统环境（内存、CPU）
- ✓ 必要软件（Git、Python、Node.js、npm、screen）
- ✓ 网络配置（公网IP、端口、域名解析）
- ✓ 项目文件（所有必需文件是否存在）
- ✓ 环境变量（.env配置是否正确）
- ✓ 数据库连接（RDS是否可访问）

### 方法2：手动检查

参考 **PRE_DEPLOY_CHECKLIST.md**，逐项检查：

**最重要的5项**：
1. [ ] ECS安全组已开放8001端口
2. [ ] 域名www.rexp.top已解析到ECS公网IP
3. [ ] RDS白名单包含ECS的IP地址
4. [ ] .env文件已配置（SECRET_KEY已替换）
5. [ ] Python 3.8+、Node.js 18+、Git已安装

---

## 🚀 部署流程

### 步骤1：准备工作（一次性）

```bash
# 1.1 连接到ECS
ssh root@你的ECS公网IP

# 1.2 安装必要软件
sudo apt update
sudo apt install -y git python3 python3-pip python3-venv nodejs npm screen

# 验证安装
git --version
python3 --version
node --version
npm --version
```

### 步骤2：克隆项目

```bash
cd ~
git clone https://github.com/rexdliu/Product_Warehouse.git
cd Product_Warehouse
```

### 步骤3：配置环境

```bash
# 3.1 复制配置模板
cp .env.production.example .env

# 3.2 生成JWT密钥（如果还没生成）
openssl rand -hex 32

# 3.3 编辑配置文件
nano .env

# 在.env中找到这一行：
# SECRET_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
# 替换为你刚才生成的密钥

# 按 Ctrl+X，然后 Y，然后 Enter 保存
```

### 步骤4：运行验证（可选但推荐）

```bash
bash verify_config.sh
```

查看验证结果，确保所有必需检查通过。

### 步骤5：执行部署

```bash
bash deploy.sh
```

部署脚本会自动完成：
1. 检查环境
2. 创建Python虚拟环境
3. 安装后端依赖（requirements.txt）
4. 安装前端依赖（npm install）
5. 构建前端（npm run build）
6. 测试数据库连接
7. 在screen中启动服务

**等待3-5分钟**，看到成功提示后继续。

### 步骤6：验证部署

```bash
# 6.1 检查服务状态
screen -ls
# 应该看到 "warehouse" 会话

# 6.2 本地健康检查
curl http://localhost:8001/health
# 应该返回: {"status":"healthy"}

# 6.3 查看服务日志（可选）
screen -r warehouse
# 按 Ctrl+A 然后 D 退出
```

### 步骤7：浏览器测试

在你的本地电脑浏览器打开：
```
http://www.rexp.top:8001
```

应该能看到登录页面，包含：
- Login标签页
- Register标签页

---

## 🧪 功能测试

### 1. 注册新用户

- 点击 Register 标签
- 填写信息：
  - Username: test_user
  - Email: test@rexp.top
  - Phone: 13800138000
  - Password: Test123456
  - Confirm Password: Test123456
- 点击 Register
- 应该自动登录并跳转到主页

### 2. 测试登录

- 登出后重新登录
- 使用刚才注册的账号
- 确认能成功登录

### 3. 测试设置保存

- 进入 Settings 页面
- 修改 Theme（主题）
- 修改 Notifications（通知设置）
- 点击 "Save Settings"
- 应该看到 "✅ 设置已成功保存到数据库"
- **刷新页面（F5）**
- 确认设置仍然保持

### 4. 数据库验证（可选）

在ECS上连接数据库：
```bash
mysql -h rm-zf80cj27ot21b1f2exo.mysql.kualalumpur.rds.aliyuncs.com \
  -u rex -p test_data

# 输入密码: Liuyerong729!

# 查看用户
SELECT * FROM users;

# 查看设置
SELECT username, theme, notifications FROM users WHERE username='test_user';
```

详细测试指南见 **TESTING_GUIDE.md**

---

## 📊 技术架构

### 当前部署架构（简化版）

```
用户浏览器
    ↓
http://www.rexp.top:8001
    ↓
FastAPI (Uvicorn)
Port 8001
    ├── 前端静态文件 (dist/)
    │   ├── / → index.html
    │   ├── /assets/* → 静态资源
    │   └── /* → index.html (SPA路由)
    │
    └── 后端API
        ├── /api/v1/auth/* → 认证
        ├── /api/v1/users/* → 用户管理
        ├── /api/v1/products/* → 产品
        └── /health → 健康检查
    ↓
阿里云RDS MySQL
(吉隆坡)
```

### 特点
- ✅ 单一服务，部署简单
- ✅ FastAPI同时serve前端和API
- ✅ 前端使用相对路径，自动适配域名
- ✅ JWT认证，token存储在localStorage
- ✅ 数据持久化到RDS
- ⚠️ 需要在URL中加端口号（:8001）

---

## 🔧 服务管理

### 查看服务

```bash
# 查看screen会话
screen -ls

# 连接到服务（查看日志）
screen -r warehouse

# 分离screen（不关闭服务）
按 Ctrl+A，然后按 D
```

### 停止服务

```bash
screen -X -S warehouse quit
```

### 重启服务

```bash
# 停止服务
screen -X -S warehouse quit

# 重新部署
cd ~/Product_Warehouse
bash deploy.sh
```

### 更新代码

```bash
# 停止服务
screen -X -S warehouse quit

# 拉取最新代码
cd ~/Product_Warehouse
git pull origin main

# 重新部署
bash deploy.sh
```

---

## ⚠️ 常见问题

### Q1: 无法访问 www.rexp.top:8001

**A: 检查清单**
1. ECS安全组是否开放8001端口？
   - 登录阿里云控制台
   - ECS → 网络与安全 → 安全组
   - 添加入方向规则：TCP 8001/8001，授权对象 0.0.0.0/0
2. 域名DNS是否生效？
   ```bash
   ping www.rexp.top
   # 应该返回你的ECS公网IP
   ```
3. 服务是否运行？
   ```bash
   screen -r warehouse
   ```
4. 本地测试是否正常？
   ```bash
   curl http://localhost:8001/health
   ```

### Q2: 数据库连接失败

**A: 检查清单**
1. RDS白名单是否包含ECS的IP？
   ```bash
   # 获取ECS公网IP
   curl ifconfig.me

   # 在RDS控制台添加到白名单
   ```
2. DATABASE_URL是否正确？
   ```bash
   cat .env | grep DATABASE_URL
   ```
3. 测试网络连通性：
   ```bash
   telnet rm-zf80cj27ot21b1f2exo.mysql.kualalumpur.rds.aliyuncs.com 3306
   ```

### Q3: 前端页面空白

**A: 重新构建前端**
```bash
cd ~/Product_Warehouse
npm run build
ls -la dist/  # 确认有文件
screen -X -S warehouse quit
bash deploy.sh
```

### Q4: API请求CORS错误

**A: 检查CORS配置**
```bash
cat .env | grep BACKEND_CORS_ORIGINS
# 应该包含: "http://www.rexp.top"
```

修改后重启服务：
```bash
screen -X -S warehouse quit
bash deploy.sh
```

### Q5: SECRET_KEY错误

**A: 重新生成密钥**
```bash
# 生成新密钥
openssl rand -hex 32

# 编辑.env
nano .env
# 替换SECRET_KEY的值

# 重启服务
screen -X -S warehouse quit
bash deploy.sh
```

更多问题请查看 **QUICK_DEPLOY.md** 的常见问题章节。

---

## 🎯 部署成功标志

当以下所有条件满足时，部署成功：

- ✅ 能通过 http://www.rexp.top:8001 访问网站
- ✅ 能看到完整的登录页面（Login和Register标签）
- ✅ 能成功注册新用户
- ✅ 能成功登录
- ✅ 能修改设置并保存
- ✅ 刷新页面后设置保持不变
- ✅ 数据库中有对应的用户数据

---

## 📈 下一步优化（可选）

当前部署适合快速上线和功能测试。后续可以考虑：

### 短期优化（1-2周）
1. **去掉端口号** - 配置Nginx反向代理
   - 用户访问 http://www.rexp.top（无需:8001）
   - Nginx转发到 localhost:8001
2. **配置HTTPS** - 使用Let's Encrypt免费SSL证书
   - 访问 https://www.rexp.top（安全）
   - 防止中间人攻击
3. **Systemd服务** - 替代screen，更稳定
   - 开机自启动
   - 自动重启（服务崩溃时）

### 中期优化（1个月）
4. **日志管理** - 配置日志轮转
5. **监控告警** - 使用阿里云云监控
6. **定期备份** - 数据库自动备份策略

### 长期优化（2-3个月）
7. **Docker化** - 容器化部署
8. **CI/CD** - GitHub Actions自动部署
9. **负载均衡** - 多ECS实例
10. **CDN加速** - 静态资源加速

详细方案请参考 **ECS_DEPLOYMENT.md**

---

## 📞 获取帮助

### 文档资源

| 问题类型 | 参考文档 |
|---------|---------|
| 部署准备 | PRE_DEPLOY_CHECKLIST.md |
| 快速部署 | DEPLOY_README.md |
| 详细步骤 | QUICK_DEPLOY.md |
| 功能测试 | TESTING_GUIDE.md |
| 生产优化 | ECS_DEPLOYMENT.md |
| 配置示例 | .env.production.example |

### 调试命令

```bash
# 查看服务日志
screen -r warehouse

# 查看端口监听
sudo netstat -tlnp | grep 8001

# 查看进程
ps aux | grep uvicorn

# 测试健康检查
curl http://localhost:8001/health

# 查看系统日志
journalctl -xe

# 测试数据库连接
mysql -h rm-zf80cj27ot21b1f2exo.mysql.kualalumpur.rds.aliyuncs.com -u rex -p test_data
```

---

## 🎉 总结

### 你拥有的部署工具

1. **自动化脚本**
   - `deploy.sh` - 一键部署
   - `verify_config.sh` - 配置验证

2. **配置文件**
   - `.env.production.example` - 生产环境模板
   - `.env` - 实际配置（你需要创建）

3. **文档指南**
   - PRE_DEPLOY_CHECKLIST.md - 部署前检查
   - DEPLOY_README.md - 快速参考
   - QUICK_DEPLOY.md - 详细步骤
   - TESTING_GUIDE.md - 功能测试
   - ECS_DEPLOYMENT.md - 完整方案

### 部署时间估计

- **首次部署**: 15-20分钟
  - 环境准备: 5分钟
  - 克隆配置: 3分钟
  - 运行deploy.sh: 5-8分钟
  - 测试验证: 5分钟

- **更新部署**: 3-5分钟
  - git pull + bash deploy.sh

### 关键命令速查

```bash
# 部署
bash deploy.sh

# 验证
bash verify_config.sh

# 查看服务
screen -r warehouse

# 停止服务
screen -X -S warehouse quit

# 更新代码
git pull && bash deploy.sh

# 测试健康
curl http://localhost:8001/health
```

---

**祝你部署顺利！** 🚀

如有任何问题，请查看相关文档或在GitHub提issue。

**重要提醒**：
- ⚠️ 记得修改.env中的SECRET_KEY
- ⚠️ 确保RDS白名单包含ECS的IP
- ⚠️ 确保ECS安全组开放8001端口

**访问地址**: http://www.rexp.top:8001
