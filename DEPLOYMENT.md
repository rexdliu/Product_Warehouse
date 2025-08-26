# 部署说明

## 开发环境 vs 生产环境

在开发环境中，前端和后端通常运行在不同的端口上：
- 前端 (Vite): http://localhost:8003
- 后端 (FastAPI): http://127.0.0.1:8001

这种分离便于开发和调试，但在生产环境中，我们通常希望用户通过单一入口访问应用。

## 生产环境部署方式

有两种常见的部署方式：

### 1. 静态文件部署（推荐）

在这种方式中，前端应用被构建为静态文件，并由后端服务器提供服务。

#### 部署步骤：

1. 构建前端应用：
   ```bash
   npm run build
   ```
   这将在项目根目录下生成一个 `dist` 目录，包含所有静态文件。

2. 运行后端服务：
   ```bash
   python main.py
   ```

3. 访问应用：
   打开浏览器访问 http://your-domain.com 或 http://your-server-ip:8000

#### 工作原理：

后端服务（main.py）会检查是否存在 `dist` 目录。如果存在，它会：
- 将根路径 `/` 挂载到 `dist` 目录，提供前端静态文件
- 保留 `/api/*` 路由处理后端API请求
- 为所有未匹配的路径提供 `dist/index.html`，支持前端路由

这种方式的优点：
- 单一入口，简化部署
- 更好的性能（无需处理CORS）
- 简化网络配置

### 2. 反向代理部署

在这种方式中，前端和后端分别部署，通过Nginx等反向代理服务器统一访问。

#### 部署步骤：

1. 分别部署前端和后端应用到不同服务器或端口
2. 配置Nginx等反向代理服务器：
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       # 前端静态文件
       location / {
           root /path/to/frontend/dist;
           try_files $uri $uri/ /index.html;
       }

       # 后端API代理
       location /api/ {
           proxy_pass http://localhost:8001;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

## 环境变量配置

在生产环境中，应使用环境变量配置敏感信息：

创建 `.env` 文件：
```env
# 数据库配置
DATABASE_URL=postgresql://user:password@localhost/dbname

# JWT密钥
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# 其他配置
DEBUG=False
```

## 部署检查清单

- [ ] 构建前端应用 (`npm run build`)
- [ ] 验证后端API功能
- [ ] 确认静态文件能正确提供
- [ ] 配置环境变量
- [ ] 设置适当的CORS策略（生产环境中不应使用通配符*）
- [ ] 配置HTTPS（推荐）
- [ ] 设置适当的日志记录
- [ ] 配置数据库连接池
- [ ] 设置定期备份策略