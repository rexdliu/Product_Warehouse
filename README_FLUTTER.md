# Product Warehouse - Flutter 移动应用

🚀 仓库管理系统的跨平台移动应用（iOS + Android）

**注意：** 这是 Flutter 移动应用开发分支。Web 前端请查看主分支。

---

## 📱 项目概述

基于 Flutter 框架开发的跨平台移动应用，为 Product Warehouse 仓库管理系统提供移动端支持。

### 主要特性

- ✅ **跨平台** - 一套代码，iOS + Android 双端运行
- ✅ **原生性能** - 接近原生应用的流畅体验
- ✅ **完整功能** - 产品管理、库存管理、数据分析、AI 助手
- ✅ **离线支持** - 本地缓存，支持离线访问
- ✅ **现代架构** - BLoC 状态管理 + Clean Architecture

---

## 🏗️ 项目结构

```
Product_Warehouse/
├── flutter_mobile/              # Flutter 移动应用（主要开发目录）
│   ├── lib/
│   │   ├── core/               # 核心功能
│   │   ├── data/               # 数据层
│   │   ├── domain/             # 业务逻辑层
│   │   ├── presentation/       # 表现层（UI）
│   │   └── routes/             # 路由配置
│   ├── android/                # Android 原生配置
│   ├── ios/                    # iOS 原生配置
│   ├── assets/                 # 资源文件
│   ├── pubspec.yaml            # 依赖配置
│   └── README.md
│
├── src/Backend/                # 后端 API（Python FastAPI）
│   └── app/                    # API 服务（供移动端调用）
│
├── flutter_examples/           # Flutter 代码示例和模板
│   └── lib/                    # 示例代码
│
└── docs/                       # 文档
    ├── FLUTTER_MOBILE_APP_GUIDE.md      # Flutter 完整开发指南
    ├── OPENAI_SETUP_GUIDE.md            # AI 功能配置指南
    └── RAG_SERVICE_ARCHITECTURE.md      # RAG 服务架构

```

---

## 🚀 快速开始

### 前置要求

- Flutter SDK (>= 3.0.0)
- Dart SDK (>= 3.0.0)
- Android Studio / Xcode
- Git

### 1. 克隆项目

```bash
git clone <repository-url>
cd Product_Warehouse
git checkout claude/flutter-mobile-app-01SopKhpoEEQoYdc9q4fm1WS
```

### 2. 创建 Flutter 项目

```bash
# 创建新的 Flutter 项目
flutter create flutter_mobile

cd flutter_mobile

# 复制示例配置
cp -r ../flutter_examples/lib/* lib/
cp ../flutter_examples/pubspec.yaml .
```

### 3. 安装依赖

```bash
flutter pub get
```

### 4. 配置后端 API

编辑 `lib/core/config/app_config.dart`：

```dart
class AppConfig {
  // 修改为你的后端 API 地址
  static const String apiBaseUrl = 'http://your-server.com/api/v1';

  // 开发环境可以使用 localhost
  // Android 模拟器: http://10.0.2.2:8001/api/v1
  // iOS 模拟器: http://localhost:8001/api/v1
}
```

### 5. 运行应用

```bash
# 查看可用设备
flutter devices

# 运行到 Android
flutter run -d android

# 运行到 iOS
flutter run -d ios

# 运行到 Chrome（Web 预览）
flutter run -d chrome
```

---

## 📦 技术栈

### 核心框架
- **Flutter** - UI 框架
- **Dart** - 编程语言

### 状态管理
- **flutter_bloc** - BLoC 模式状态管理
- **provider** - 轻量级状态管理

### 网络请求
- **dio** - HTTP 客户端
- **retrofit** - 类型安全的 API 客户端

### 本地存储
- **hive** - 轻量级 NoSQL 数据库
- **shared_preferences** - 键值存储

### 依赖注入
- **get_it** - 服务定位器
- **injectable** - 依赖注入代码生成

### UI 组件
- **cached_network_image** - 图片缓存
- **shimmer** - 加载骨架屏
- **flutter_svg** - SVG 支持

---

## 🎯 核心功能

### 已规划功能

#### 1. 用户认证
- [x] 登录/注册
- [x] JWT Token 管理
- [x] 自动登录
- [x] 密码重置

#### 2. 产品管理
- [x] 产品列表（支持搜索、筛选）
- [x] 产品详情
- [x] 产品创建/编辑
- [x] 产品图片上传

#### 3. 库存管理
- [x] 库存查看
- [x] 库存调整
- [x] 库存预警
- [x] 库存历史记录

#### 4. 仪表盘
- [x] 销售统计
- [x] 库存概览
- [x] 数据图表
- [x] 实时数据刷新

#### 5. AI 功能
- [x] AI 聊天助手
- [x] 产品智能分析
- [x] RAG 知识库问答
- [x] 数据洞察

#### 6. 用户设置
- [x] 个人资料管理
- [x] 头像上传
- [x] 语言切换
- [x] 主题切换（浅色/深色）

### 高级功能（计划中）

- [ ] 离线数据同步
- [ ] 扫码功能（条形码/二维码）
- [ ] Push 通知
- [ ] 报表导出
- [ ] 多仓库切换

---

## 📱 屏幕截图

_（待添加）_

---

## 🔧 开发指南

### 代码生成

```bash
# 生成序列化代码、路由等
flutter pub run build_runner build --delete-conflicting-outputs

# 监听文件变化，自动生成
flutter pub run build_runner watch
```

### 代码规范

```bash
# 代码格式化
flutter format lib/

# 代码分析
flutter analyze

# 运行测试
flutter test
```

### 打包发布

#### Android APK

```bash
# Debug 版本
flutter build apk --debug

# Release 版本
flutter build apk --release

# 输出位置
# build/app/outputs/flutter-apk/app-release.apk
```

#### iOS IPA

```bash
# Release 版本
flutter build ios --release

# 通过 Xcode Archive 导出 IPA
```

---

## 📚 文档

### 开发文档
- [Flutter 移动应用完整开发指南](docs/FLUTTER_MOBILE_APP_GUIDE.md)
- [API 集成指南](docs/OPENAI_SETUP_GUIDE.md)
- [RAG 服务架构](docs/RAG_SERVICE_ARCHITECTURE.md)

### 官方资源
- [Flutter 官方文档](https://docs.flutter.dev/)
- [Dart 语言指南](https://dart.dev/guides)
- [Flutter BLoC 文档](https://bloclibrary.dev/)

---

## 🤝 贡献指南

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

---

## 🐛 问题反馈

如遇到问题，请创建 [Issue](https://github.com/rexdliu/Product_Warehouse/issues)。

---

## 📄 许可证

MIT License

---

## 📞 联系方式

- 项目仓库：[Product Warehouse](https://github.com/rexdliu/Product_Warehouse)
- 主分支：Web 前端 + 后端 API
- 当前分支：`claude/flutter-mobile-app-01SopKhpoEEQoYdc9q4fm1WS` - Flutter 移动应用

---

**🎉 开始构建你的移动应用吧！**
