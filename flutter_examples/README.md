# Product Warehouse Mobile App (Flutter)

仓库管理系统移动应用 - 基于 Flutter 开发的跨平台应用（iOS + Android）

## 📱 功能特性

- ✅ 用户认证（登录/注册）
- ✅ 产品管理（查看/搜索/创建/编辑）
- ✅ 库存管理（查看/调整/预警）
- ✅ 仪表盘（数据统计和可视化）
- ✅ AI 助手（智能问答和产品洞察）
- ✅ 用户设置（个人资料/头像/语言）
- ✅ 离线支持（本地缓存）
- ✅ 扫码功能（条形码/二维码）

## 🏗️ 项目结构

```
lib/
├── core/               # 核心功能
│   ├── api/           # API 客户端
│   ├── config/        # 配置
│   ├── constants/     # 常量
│   └── utils/         # 工具类
├── data/              # 数据层
│   ├── models/        # 数据模型
│   ├── repositories/  # Repository
│   └── datasources/   # 数据源
├── presentation/      # 表现层
│   ├── blocs/         # BLoC 状态管理
│   ├── pages/         # 页面
│   └── widgets/       # 组件
└── routes/            # 路由配置
```

## 🚀 快速开始

### 1. 安装依赖

```bash
flutter pub get
```

### 2. 代码生成

```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

### 3. 运行应用

```bash
# Android
flutter run

# iOS
flutter run -d ios

# 指定设备
flutter devices
flutter run -d <device_id>
```

## 🔧 配置

### API 地址

编辑 `lib/core/config/app_config.dart`：

```dart
class AppConfig {
  static const String apiBaseUrl = 'http://your-server.com/api/v1';
}
```

### 依赖注入

使用 `get_it` 和 `injectable` 管理依赖：

```dart
@module
abstract class AppModule {
  @lazySingleton
  Dio get dio => Dio(BaseOptions(
        baseUrl: AppConfig.apiBaseUrl,
      ));

  @lazySingleton
  ApiClient apiClient(Dio dio) => ApiClient(dio);
}
```

## 📦 打包发布

### Android APK

```bash
flutter build apk --release
```

输出：`build/app/outputs/flutter-apk/app-release.apk`

### iOS IPA

```bash
flutter build ios --release
```

## 🧪 测试

```bash
# 单元测试
flutter test

# 集成测试
flutter test integration_test/
```

## 📚 相关文档

- [Flutter 移动应用完整指南](../docs/FLUTTER_MOBILE_APP_GUIDE.md)
- [API 集成文档](../docs/OPENAI_SETUP_GUIDE.md)
- [RAG 服务架构](../docs/RAG_SERVICE_ARCHITECTURE.md)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
