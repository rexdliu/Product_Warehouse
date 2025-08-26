# WarehouseAI - 智能仓库管理系统

<p align="center">
  <img src="src/assets/chatBot.svg" width="100" alt="WarehouseAI Logo" />
</p>

WarehouseAI 是一个现代化的仓库管理系统，集成了人工智能助手，帮助仓库经理和操作员更高效地管理库存、处理订单和获取数据洞察。

## 🌟 核心功能

### 1. 仪表板 (Dashboard)
- 实时库存指标监控
- 库存状态可视化图表
- 关键性能指标展示
- 快速操作入口

### 2. 库存管理 (Inventory Management)
- 产品信息管理
- 库存水平实时跟踪
- 库存状态分类 (正常/低库存/缺货)
- 产品搜索和筛选

### 3. AI 助手 (AI Assistant) ✨
- 智能库存查询和分析
- 需求预测和建议
- 自然语言交互界面
- 文件上传分析支持
- 语音输入功能
- 主动洞察和建议

### 4. 报告系统 (Reports)
- 库存报告生成
- 销售数据分析
- Text-to-SQL 查询功能
- 可视化图表展示

### 5. 设置管理 (Settings)
- 个人资料管理
- 主题和外观设置
- AI助手配置
- 通知偏好设置
- 安全设置
- 第三方集成配置

## 🛠 技术栈

### 前端技术栈
- **框架**: React 18, TypeScript, Vite
- **UI 组件库**: shadcn/ui, Tailwind CSS
- **状态管理**: Zustand
- **路由**: React Router v6
- **数据可视化**: Chart.js
- **图标**: Lucide React

### 后端技术栈
- **框架**: FastAPI (Python)
- **数据库**: SQLite (默认) / PostgreSQL (可选)
- **ORM**: SQLAlchemy
- **认证**: JWT/OAuth2
- **异步任务**: Celery + Redis
- **AI服务**: OpenAI API / 类似服务
- **数据库迁移**: Alembic

## 🚀 快速开始

### 前端开发

1. 克隆项目:
```bash
git clone <repository-url>
```

2. 安装依赖:
```bash
npm install
```

3. 启动开发服务器:
```bash
npm run dev
```

4. 构建生产版本:
```bash
npm run build
```

### 后端开发

1. 创建虚拟环境:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或
venv\Scripts\activate  # Windows
```

2. 安装 Python 依赖:
```bash
pip install -r requirements.txt
```

3. 数据库迁移:
```bash
alembic upgrade head
```

4. 启动后端服务:
```bash
uvicorn app.main:app --reload
```

5. 启动 Celery 异步任务处理器 (新终端):
```bash
celery -A app.tasks.celery_app worker --loglevel=info
```

## 📋 功能实现状态

### 前端已完成功能
- [x] 响应式布局和现代化UI设计
- [x] 完整的路由系统
- [x] 所有页面的静态界面实现
- [x] 客户端状态管理 (Zustand)
- [x] AI助手界面和交互
- [x] 设置页面完整功能界面
- [x] 可拖拽AI助手组件

### 后端已完成功能
- [x] 微服务架构设计
- [x] 用户认证和授权系统
- [x] 数据持久化 (数据库集成)
- [x] 完整的RESTful API
- [x] 数据库迁移框架
- [x] 异步任务处理框架

### 需要完善的后端功能
- [ ] AI服务集成 (OpenAI/类似服务)
- [ ] 文件上传和处理服务
- [ ] 语音识别服务
- [ ] 实时通知推送 (WebSocket)
- [ ] 第三方服务集成API

## 🎯 详细功能说明

### AI助手配置和使用

AI助手是WarehouseAI的核心功能之一，提供了智能化的仓库管理辅助。

#### 前端功能:
- 可拖拽的悬浮AI助手按钮
- 完整的聊天界面，支持文本输入、文件上传和语音输入
- AI助手启用/禁用控制
- 聊天历史记录显示
- 快速操作建议
- 主动洞察提示

#### 后端需要实现:
- AI服务集成 (如OpenAI、Google AI等)
- 自然语言处理和Text-to-SQL转换
- 聊天历史存储和查询API
- 文件上传处理服务
- 语音识别服务
- 实时响应推送

#### 使用说明:
1. 在设置页面启用AI助手功能
2. 点击界面右下角的AI助手按钮打开聊天窗口
3. 输入自然语言查询库存、需求预测等信息
4. 可上传文件进行内容分析
5. 可使用语音输入功能进行语音查询

### 设置页面功能

设置页面允许用户自定义系统行为和个人偏好。

#### 已实现的前端功能:
- 个人资料管理 (头像上传、基本信息)
- 仓库配置 (仓库信息、时区、温度单位)
- AI助手配置 (启用开关、响应速度等)
- 通知偏好设置 (邮件、推送、短信等)
- 外观设置 (主题、界面选项)
- 安全设置 (密码、两步验证、API密钥)
- 第三方集成配置
- 设置保存和恢复功能

#### 需要完善的后端功能:
- 用户资料持久化存储
- 设置参数持久化存储
- 密码修改和安全验证
- API密钥生成和管理
- 第三方服务集成接口
- 通知推送服务

## 📞 联系方式

项目维护者: [Your Name]
项目仓库: [Repository URL]

## 🏗 后端架构

后端采用微服务架构设计，包含以下核心服务:

```
logistics_warehouse/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI主入口
│   ├── core/                   # 核心配置
│   │   ├── __init__.py
│   │   ├── config.py           # 配置管理
│   │   ├── security.py         # 安全/认证
│   │   ├── database.py         # 数据库连接
│   │   └── dependencies.py     # 依赖注入
│   │
│   ├── api/                    # API路由
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py         # 认证接口
│   │   │   ├── products.py     # 产品管理
│   │   │   ├── inventory.py    # 库存管理
│   │   │   ├── warehouse.py    # 仓库管理
│   │   │   ├── analytics.py    # 数据分析
│   │   │   └── ai_rag.py       # AI RAG接口
│   │   └── deps.py             # API依赖
│   │
│   ├── models/                 # 数据模型
│   │   ├── __init__.py
│   │   ├── product.py
│   │   ├── inventory.py
│   │   ├── warehouse.py
│   │   └── user.py
│   │
│   ├── schemas/                # Pydantic模型
│   │   ├── __init__.py
│   │   ├── product.py
│   │   ├── inventory.py
│   │   ├── warehouse.py
│   │   └── response.py
│   │
│   ├── crud/                   # CRUD操作
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── product.py
│   │   ├── inventory.py
│   │   └── warehouse.py
│   │
│   ├── services/               # 业务逻辑层
│   │   ├── __init__.py
│   │   ├── product_service.py
│   │   ├── inventory_service.py
│   │   ├── warehouse_service.py
│   │   ├── analytics_service.py
│   │   └── rag_service.py
│   │
│   ├── tasks/                  # Celery异步任务
│   │   ├── __init__.py
│   │   ├── celery_app.py
│   │   ├── inventory_tasks.py
│   │   └── analytics_tasks.py
│   │
│   └── utils/                  # 工具函数
│       ├── __init__.py
│       ├── hologres.py
│       ├── cache.py
│       └── exceptions.py
│
├── alembic/                    # 数据库迁移
├── tests/                      # 测试
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
└── .env
```

核心服务模块:
1. **API网关服务** (API Gateway Service) - 统一入口管理
2. **认证服务** (Authentication Service) - JWT/OAuth2认证
3. **产品管理服务** (Product Management Service) - 产品信息维护
4. **库存服务** (Inventory Service) - 库存水平跟踪
5. **仓库操作服务** (Warehouse Operations Service) - 入库/出库管理
6. **AI/RAG服务** (AI/RAG Service) - 智能问答接口
7. **分析服务** (Analytics Service) - 数据分析
8. **通知服务** (Notification Service) - 实时消息推送

## 📄 许可证

本项目仅供学习和参考使用。