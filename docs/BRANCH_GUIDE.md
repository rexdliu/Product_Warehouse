# 分支管理指南

## 📋 分支说明

本项目采用功能分支策略，不同平台的开发在不同分支进行。

---

## 🌲 分支结构

### 主要分支

#### 1. **claude/database-for-user-images-01SopKhpoEEQoYdc9q4fm1WS** ⭐ (当前)
**用途：** Web 前端 + 后端 API

**包含内容：**
- ✅ React Web 前端（src/App.tsx, components/, pages/ 等）
- ✅ Python FastAPI 后端（src/Backend/）
- ✅ 对象存储系统（MinIO/OSS/S3 支持）
- ✅ OpenAI RAG 增强服务
- ✅ AI 功能（智能问答、产品洞察、聊天助手）

**主要功能：**
- 用户管理和认证
- 产品管理（CRUD）
- 库存管理
- 销售管理
- 数据统计仪表盘
- AI 助手集成
- 图片存储（多后端支持）

**适用场景：**
- Web 应用开发
- 后端 API 开发
- 桌面浏览器访问

---

#### 2. **claude/flutter-mobile-app-01SopKhpoEEQoYdc9q4fm1WS** 📱
**用途：** Flutter 移动应用（iOS + Android）

**包含内容：**
- ✅ Flutter 移动应用代码（flutter_examples/）
- ✅ Python FastAPI 后端（共享）
- ✅ 移动端架构设计
- ✅ API 集成示例

**主要功能：**
- 跨平台移动应用（iOS + Android）
- 原生性能体验
- 离线数据支持
- 扫码功能
- Push 通知

**适用场景：**
- 移动应用开发
- iOS/Android 双端发布
- 移动设备访问

---

## 🔀 分支切换

### 切换到 Web 前端分支

```bash
git checkout claude/database-for-user-images-01SopKhpoEEQoYdc9q4fm1WS
```

### 切换到 Flutter 移动应用分支

```bash
git checkout claude/flutter-mobile-app-01SopKhpoEEQoYdc9q4fm1WS
```

---

## 📂 文件结构对比

### Web 前端分支

```
Product_Warehouse/
├── src/
│   ├── App.tsx                 # React 应用入口
│   ├── components/             # React 组件
│   ├── pages/                  # 页面
│   ├── services/               # API 服务
│   └── Backend/                # Python 后端
│       └── app/
│           ├── api/            # API 端点
│           ├── services/       # 业务逻辑
│           │   ├── ai_service.py
│           │   ├── enhanced_rag_service.py
│           │   └── rag_service.py
│           └── core/
│               └── storage.py  # 对象存储
├── docs/
│   ├── RAG_SERVICE_ARCHITECTURE.md
│   ├── OPENAI_SETUP_GUIDE.md
│   └── STORAGE_SETUP_GUIDE.md
└── docker-compose.minio.yml
```

### Flutter 移动应用分支

```
Product_Warehouse/
├── flutter_examples/           # Flutter 示例代码
│   ├── lib/
│   │   ├── main.dart
│   │   ├── core/
│   │   │   └── api/
│   │   │       └── api_client.dart
│   │   └── data/
│   │       └── models/
│   │           └── product.dart
│   ├── pubspec.yaml
│   └── README.md
├── src/Backend/                # 共享后端 API
│   └── app/
├── docs/
│   ├── FLUTTER_MOBILE_APP_GUIDE.md
│   ├── RAG_SERVICE_ARCHITECTURE.md
│   └── OPENAI_SETUP_GUIDE.md
└── README_FLUTTER.md          # Flutter 分支说明
```

---

## 🚀 开发工作流

### Web 前端开发

```bash
# 1. 切换到 Web 分支
git checkout claude/database-for-user-images-01SopKhpoEEQoYdc9q4fm1WS

# 2. 启动后端
cd src/Backend
uvicorn app.main:app --reload --port 8001

# 3. 启动前端（新终端）
npm run dev
```

### Flutter 移动应用开发

```bash
# 1. 切换到 Flutter 分支
git checkout claude/flutter-mobile-app-01SopKhpoEEQoYdc9q4fm1WS

# 2. 启动后端（共享）
cd src/Backend
uvicorn app.main:app --reload --port 8001

# 3. 创建并运行 Flutter 应用（新终端）
flutter create flutter_mobile
cd flutter_mobile
cp -r ../flutter_examples/lib/* lib/
flutter run
```

---

## 📝 开发建议

### 后端 API 开发

**后端 API 在两个分支中共享**，建议：

1. 在 **Web 分支** 开发和测试 API
2. 确保 API 变更后同步到 **Flutter 分支**
3. 保持 API 接口向后兼容

### 前端开发

**Web 和 Flutter 独立开发**：

- **Web 前端** - 仅在 Web 分支开发
- **Flutter 应用** - 仅在 Flutter 分支开发

### 文档维护

**共享文档** 在两个分支保持同步：
- `docs/RAG_SERVICE_ARCHITECTURE.md`
- `docs/OPENAI_SETUP_GUIDE.md`

**特定文档** 各自维护：
- `docs/STORAGE_SETUP_GUIDE.md` (Web)
- `docs/FLUTTER_MOBILE_APP_GUIDE.md` (Flutter)

---

## 🔄 分支合并策略

### 后端 API 更新

当在 Web 分支更新后端 API 后：

```bash
# 1. 提交 Web 分支更改
git checkout claude/database-for-user-images-01SopKhpoEEQoYdc9q4fm1WS
git add src/Backend/
git commit -m "feat: 更新 API 端点"
git push

# 2. 切换到 Flutter 分支
git checkout claude/flutter-mobile-app-01SopKhpoEEQoYdc9q4fm1WS

# 3. Cherry-pick 后端更改（或手动同步）
git cherry-pick <commit-hash>
```

### 文档同步

共享文档更新后，需要同步到两个分支。

---

## ⚠️ 注意事项

1. **不要在 Web 分支开发 Flutter 代码**
2. **不要在 Flutter 分支开发 React 代码**
3. **后端 API 变更需要同步到两个分支**
4. **提交前确认当前分支正确**

---

## 📊 功能对比

| 功能 | Web 分支 | Flutter 分支 |
|------|---------|-------------|
| **前端框架** | React + TypeScript | Flutter + Dart |
| **后端 API** | ✅ FastAPI | ✅ FastAPI（共享） |
| **对象存储** | ✅ MinIO/OSS/S3 | ✅ 共享配置 |
| **OpenAI RAG** | ✅ 完整支持 | ✅ API 调用 |
| **用户管理** | ✅ Web UI | ✅ 移动端 UI |
| **产品管理** | ✅ Web UI | ✅ 移动端 UI |
| **库存管理** | ✅ Web UI | ✅ 移动端 UI |
| **AI 助手** | ✅ Web 集成 | ✅ 移动端集成 |
| **离线支持** | ❌ | ✅ 本地缓存 |
| **扫码功能** | ❌ | ✅ 相机扫码 |
| **Push 通知** | ❌ | ✅ FCM/APNs |

---

## 🎯 下一步

### Web 前端分支
- [ ] 集成 OpenAI RAG 到前端界面
- [ ] 添加 AI 聊天组件
- [ ] 优化对象存储性能

### Flutter 移动应用分支
- [ ] 完善 Flutter 项目结构
- [ ] 实现核心页面（登录、产品列表等）
- [ ] 集成后端 API
- [ ] 添加离线支持

---

## 📞 获取帮助

如有疑问，请参考：
- [Web 开发文档](../docs/)
- [Flutter 开发指南](../docs/FLUTTER_MOBILE_APP_GUIDE.md)
- [创建 Issue](https://github.com/rexdliu/Product_Warehouse/issues)

---

**文档版本：** v1.0
**最后更新：** 2025-11-18
