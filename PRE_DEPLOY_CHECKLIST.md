# 🚀 ECS部署前检查清单

部署到 **www.rexp.top** 前的完整检查清单。

---

## ⚙️ 第一部分：ECS服务器准备

### 1.1 ECS基础配置

- [ ] **ECS已创建**
  - 配置：2核4GB内存或更高
  - 操作系统：Ubuntu 20.04/22.04 或 CentOS 7/8
  - 地域：建议选择靠近数据库的区域（你的RDS在吉隆坡）

- [ ] **可以SSH连接到ECS**
  ```bash
  ssh root@你的ECS公网IP
  ```

- [ ] **记录ECS公网IP**
  - 公网IP: _________________

### 1.2 安全组配置

在阿里云控制台 → ECS → 网络与安全 → 安全组，检查以下端口已开放：

- [ ] **端口 22 (SSH)** - 入方向规则
  ```
  优先级: 1
  策略: 允许
  协议: TCP
  端口: 22/22
  授权对象: 你的本地IP或0.0.0.0/0（临时）
  ```

- [ ] **端口 8001 (FastAPI服务)** - 入方向规则
  ```
  优先级: 1
  策略: 允许
  协议: TCP
  端口: 8001/8001
  授权对象: 0.0.0.0/0
  描述: WarehouseAI Backend
  ```

- [ ] **端口 80 (HTTP)** - 入方向规则（可选，为以后Nginx做准备）
  ```
  优先级: 1
  策略: 允许
  协议: TCP
  端口: 80/80
  授权对象: 0.0.0.0/0
  ```

---

## 🌐 第二部分：域名配置

### 2.1 DNS解析设置

在你的域名管理后台（阿里云、腾讯云等）：

- [ ] **添加A记录 (www)**
  ```
  类型: A
  主机记录: www
  记录值: [你的ECS公网IP]
  TTL: 600
  ```

- [ ] **添加A记录 (@根域名)** （可选）
  ```
  类型: A
  主机记录: @
  记录值: [你的ECS公网IP]
  TTL: 600
  ```

### 2.2 DNS生效验证

等待5-10分钟后测试：

- [ ] **Ping测试**
  ```bash
  ping www.rexp.top
  # 应该返回你的ECS公网IP
  ```

- [ ] **DNS查询**
  ```bash
  nslookup www.rexp.top
  # 或
  dig www.rexp.top
  ```

---

## 🗄️ 第三部分：数据库配置

### 3.1 RDS白名单设置

在阿里云控制台 → RDS → 数据安全性 → 白名单设置：

- [ ] **添加ECS公网IP到白名单**
  - 白名单分组名称: default 或新建
  - 白名单地址: [你的ECS公网IP]
  - 或者添加ECS的内网IP（如果RDS和ECS在同一VPC）

### 3.2 数据库信息确认

- [ ] **RDS地址**: `rm-zf80cj27ot21b1f2exo.mysql.kualalumpur.rds.aliyuncs.com`
- [ ] **数据库名**: `test_data`
- [ ] **用户名**: `rex`
- [ ] **密码**: `Liuyerong729!`
- [ ] **端口**: `3306`（默认）

### 3.3 数据库连接测试（本地）

从你的本地电脑测试连接（如果有MySQL客户端）：

```bash
mysql -h rm-zf80cj27ot21b1f2exo.mysql.kualalumpur.rds.aliyuncs.com \
  -u rex -p test_data
# 输入密码: Liuyerong729!
```

- [ ] **连接成功** - 可以看到MySQL提示符

---

## 📦 第四部分：代码仓库准备

### 4.1 本地代码检查

在本地项目目录检查：

- [ ] **最新代码已提交到Git**
  ```bash
  git status
  # 应该显示 "nothing to commit, working tree clean"
  ```

- [ ] **已推送到远程仓库**
  ```bash
  git push origin claude/ecs-server-connection-011CURG2McoynLMudoNvuE6e
  ```

### 4.2 关键文件检查

确认以下文件存在并已提交：

- [ ] `deploy.sh` - 自动部署脚本
- [ ] `.env.production.example` - 生产环境配置模板
- [ ] `QUICK_DEPLOY.md` - 部署指南
- [ ] `requirements.txt` - Python依赖
- [ ] `package.json` - Node.js依赖
- [ ] `src/Backend/app/main.py` - 后端主文件（已修改支持静态文件）
- [ ] `src/services/api.ts` - 前端API服务（使用相对路径）

---

## 🔐 第五部分：环境变量配置

### 5.1 生成JWT密钥

在本地或ECS上运行：

```bash
openssl rand -hex 32
```

- [ ] **已生成SECRET_KEY**: _________________________________

### 5.2 准备.env文件内容

复制以下内容，填入上面生成的SECRET_KEY：

```bash
# ============ 数据库配置 ============
DATABASE_URL=mysql+pymysql://rex:Liuyerong729!@rm-zf80cj27ot21b1f2exo.mysql.kualalumpur.rds.aliyuncs.com/test_data

# ============ JWT安全密钥 ============
SECRET_KEY=[粘贴上面生成的密钥]
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# ============ CORS配置 ============
BACKEND_CORS_ORIGINS=["http://www.rexp.top","http://www.rexp.top:8001","https://www.rexp.top","https://www.rexp.top:8001","http://rexp.top","http://rexp.top:8001"]

# ============ 环境标识 ============
ENVIRONMENT=production
DEBUG=False
```

- [ ] **已准备好完整的.env配置**

---

## 💻 第六部分：ECS服务器软件环境

连接到ECS后，检查以下软件：

### 6.1 系统更新

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

- [ ] **系统已更新**

### 6.2 Git安装

```bash
git --version
```

如果没有安装：
```bash
# Ubuntu
sudo apt install -y git

# CentOS
sudo yum install -y git
```

- [ ] **Git已安装**: 版本 __________

### 6.3 Python 3.8+安装

```bash
python3 --version
```

如果没有安装或版本过低：
```bash
# Ubuntu
sudo apt install -y python3 python3-pip python3-venv

# CentOS
sudo yum install -y python3 python3-pip
```

- [ ] **Python已安装**: 版本 __________

### 6.4 Node.js 18+安装

```bash
node --version
npm --version
```

如果没有安装：
```bash
# Ubuntu
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# CentOS
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

- [ ] **Node.js已安装**: 版本 __________
- [ ] **npm已安装**: 版本 __________

### 6.5 Screen安装

```bash
screen -v
```

如果没有安装：
```bash
# Ubuntu
sudo apt install -y screen

# CentOS
sudo yum install -y screen
```

- [ ] **Screen已安装**

---

## 🎯 第七部分：部署执行检查清单

### 7.1 克隆代码

```bash
cd ~
git clone https://github.com/rexdliu/Product_Warehouse.git
cd Product_Warehouse
```

- [ ] **代码已克隆**

### 7.2 配置环境变量

```bash
# 使用生产环境模板
cp .env.production.example .env

# 编辑.env文件
nano .env
# 或
vi .env
```

**必须修改的内容**：
1. 替换 `SECRET_KEY=...` 为你生成的密钥
2. 确认 `DATABASE_URL` 正确
3. 确认 `BACKEND_CORS_ORIGINS` 包含你的域名

- [ ] **.env文件已配置**

### 7.3 运行部署脚本

```bash
bash deploy.sh
```

脚本会自动完成：
1. 检查环境
2. 安装Python依赖
3. 安装前端依赖
4. 构建前端
5. 测试数据库连接
6. 启动服务

- [ ] **部署脚本执行成功**

---

## ✅ 第八部分：部署后验证

### 8.1 服务状态检查

```bash
# 查看screen会话
screen -ls
# 应该看到 "warehouse" 会话

# 连接到服务查看日志
screen -r warehouse
# 按 Ctrl+A 然后 D 分离
```

- [ ] **warehouse服务正在运行**

### 8.2 本地健康检查（在ECS上）

```bash
curl http://localhost:8001/health
# 应该返回: {"status":"healthy"}
```

- [ ] **本地健康检查通过**

### 8.3 远程健康检查（在你的本地电脑）

```bash
curl http://www.rexp.top:8001/health
# 或
curl http://[ECS公网IP]:8001/health
```

- [ ] **远程健康检查通过**

### 8.4 浏览器测试

打开浏览器访问：
```
http://www.rexp.top:8001
```

- [ ] **能看到登录页面**
- [ ] **页面加载完整（无404错误）**
- [ ] **能打开浏览器开发者工具查看Console（无JS错误）**

### 8.5 注册功能测试

- [ ] **能看到Register标签页**
- [ ] **能成功注册新用户**
  - 用户名: test_user
  - 邮箱: test@example.com
  - 手机: 13800138000
  - 密码: Test123456
- [ ] **注册后自动登录成功**

### 8.6 登录功能测试

- [ ] **能使用刚注册的账号登录**
- [ ] **登录后跳转到主页面**

### 8.7 设置保存测试

1. 进入设置页面
2. 修改主题（Theme）
3. 修改通知设置（Notifications）
4. 点击"保存设置"按钮
5. 刷新页面（F5）

- [ ] **设置保存成功**
- [ ] **刷新后设置保持不变**
- [ ] **在数据库中能看到更新的数据**

### 8.8 数据库持久化验证（可选）

在ECS上连接数据库查看：

```bash
mysql -h rm-zf80cj27ot21b1f2exo.mysql.kualalumpur.rds.aliyuncs.com \
  -u rex -p test_data

# 在MySQL中执行：
SELECT * FROM users;
# 应该能看到刚注册的用户

SELECT username, theme, notifications FROM users WHERE username='test_user';
# 应该能看到保存的设置
```

- [ ] **数据已正确保存到数据库**

---

## 🔧 常见问题处理

### 问题1：无法访问 http://www.rexp.top:8001

**检查步骤**：
1. ECS安全组是否开放8001端口？
2. 域名DNS是否生效？ (`ping www.rexp.top`)
3. 服务是否运行？ (`screen -ls`)
4. 本地访问是否正常？ (`curl http://localhost:8001/health` 在ECS上)

### 问题2：数据库连接失败

**检查步骤**：
1. RDS白名单是否包含ECS的IP？
2. DATABASE_URL是否正确？
3. 网络连通性：`telnet rm-zf80cj27ot21b1f2exo.mysql.kualalumpur.rds.aliyuncs.com 3306`

### 问题3：前端页面空白或404

**解决方法**：
```bash
cd ~/Product_Warehouse
npm run build  # 重新构建前端
ls -la dist/   # 确认dist目录存在且有文件
screen -X -S warehouse quit  # 重启服务
bash deploy.sh
```

### 问题4：API调用失败（CORS错误）

**检查**：
- .env中的BACKEND_CORS_ORIGINS是否包含 www.rexp.top？
- 重启服务使配置生效

---

## 📝 部署成功标志

当以下所有项都完成时，部署成功：

- ✅ 可以通过 `http://www.rexp.top:8001` 访问网站
- ✅ 能够注册新用户
- ✅ 能够登录
- ✅ 能够修改设置并保存
- ✅ 刷新页面后设置保持不变
- ✅ 数据库中有用户和设置数据

---

## 🎉 下一步（可选）

部署成功后，你可以考虑：

1. **去掉端口号** - 配置Nginx反向代理（参考 ECS_DEPLOYMENT.md）
2. **配置HTTPS** - 使用Let's Encrypt免费SSL证书
3. **使用Systemd** - 替代screen，更稳定
4. **配置日志** - 集中日志管理和轮转
5. **设置监控** - 配置服务监控和告警

参考完整文档：
- [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) - 详细部署步骤
- [ECS_DEPLOYMENT.md](./ECS_DEPLOYMENT.md) - 生产级完整方案
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - 功能测试指南

---

**祝你部署顺利！** 🚀

有问题请查看日志：`screen -r warehouse`
