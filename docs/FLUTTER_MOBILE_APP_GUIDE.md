# Flutter 移动应用开发指南

## 📱 概述

本文档详细说明如何使用 Flutter 开发 Product Warehouse 仓库管理系统的移动应用（iOS + Android）。

---

## 🎯 为什么选择 Flutter？

| 特性 | Flutter | React Native | 原生开发 |
|------|---------|-------------|---------|
| **跨平台** | ✅ iOS + Android + Web | ✅ iOS + Android | ❌ 分别开发 |
| **性能** | ⭐⭐⭐⭐⭐ 接近原生 | ⭐⭐⭐⭐ 较好 | ⭐⭐⭐⭐⭐ 最佳 |
| **开发效率** | ⭐⭐⭐⭐⭐ 热重载 | ⭐⭐⭐⭐ 热重载 | ⭐⭐⭐ 较慢 |
| **UI 一致性** | ⭐⭐⭐⭐⭐ 完全一致 | ⭐⭐⭐ 基本一致 | ⭐⭐⭐⭐⭐ 原生 |
| **学习曲线** | Dart (易学) | JavaScript/React | Swift + Kotlin |
| **生态系统** | 🚀 快速增长 | 🌟 成熟丰富 | 🌟 最成熟 |
| **推荐度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |

**结论：Flutter 最适合本项目**
- ✅ 一套代码，iOS + Android 双端发布
- ✅ 性能接近原生，流畅度高
- ✅ UI 完全一致，维护成本低
- ✅ 与现有 React 前端架构相似，学习成本低

---

## 🏗️ 移动应用架构

### 整体架构图

```
┌─────────────────────────────────────────────────────────┐
│              Flutter Mobile App (iOS + Android)         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │           Presentation Layer (UI)               │   │
│  │  ┌──────────────┐  ┌──────────────┐            │   │
│  │  │  Login Page  │  │Dashboard Page│  ...       │   │
│  │  └──────────────┘  └──────────────┘            │   │
│  │  ┌──────────────┐  ┌──────────────┐            │   │
│  │  │Product List  │  │ Inventory    │  ...       │   │
│  │  └──────────────┘  └──────────────┘            │   │
│  └─────────────┬───────────────────────────────────┘   │
│                │                                        │
│  ┌─────────────▼───────────────────────────────────┐   │
│  │        Business Logic Layer (BLoC/Provider)     │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐      │   │
│  │  │ AuthBloc │  │ProductBloc│  │InventoryBloc│  │   │
│  │  └──────────┘  └──────────┘  └──────────┘      │   │
│  └─────────────┬───────────────────────────────────┘   │
│                │                                        │
│  ┌─────────────▼───────────────────────────────────┐   │
│  │           Data Layer (Repository)               │   │
│  │  ┌──────────────────┐  ┌──────────────────┐    │   │
│  │  │ AuthRepository   │  │ ProductRepository│    │   │
│  │  └──────────────────┘  └──────────────────┘    │   │
│  └─────────────┬───────────────────────────────────┘   │
│                │                                        │
│  ┌─────────────▼───────────────────────────────────┐   │
│  │          Data Sources (API Client)              │   │
│  │  ┌──────────────────┐  ┌──────────────────┐    │   │
│  │  │  REST API Client │  │ Local Storage    │    │   │
│  │  └──────────────────┘  └──────────────────┘    │   │
│  └─────────────┬───────────────────────────────────┘   │
│                │                                        │
└────────────────┼────────────────────────────────────────┘
                 │
                 ▼ HTTP/HTTPS
┌─────────────────────────────────────────────────────────┐
│          Backend API (FastAPI - Python)                 │
│          http://your-server.com/api/v1                  │
└─────────────────────────────────────────────────────────┘
```

### 分层说明

#### 1. **Presentation Layer (UI 层)**

使用 Flutter Widgets 构建用户界面。

**特点：**
- 响应式 UI（StatelessWidget / StatefulWidget）
- Material Design 或 Cupertino 风格
- 与业务逻辑分离

**示例页面：**
- 登录页 (LoginPage)
- 仪表盘 (DashboardPage)
- 产品列表 (ProductListPage)
- 库存管理 (InventoryPage)
- AI 助手聊天 (AIChatPage)
- 用户设置 (SettingsPage)

#### 2. **Business Logic Layer (业务逻辑层)**

使用 **BLoC (Business Logic Component)** 或 **Provider** 管理状态。

**推荐：BLoC Pattern**
```dart
// 示例：产品列表 BLoC
class ProductBloc extends Bloc<ProductEvent, ProductState> {
  final ProductRepository repository;

  ProductBloc({required this.repository}) : super(ProductInitial()) {
    on<LoadProducts>(_onLoadProducts);
    on<SearchProducts>(_onSearchProducts);
  }

  Future<void> _onLoadProducts(
    LoadProducts event,
    Emitter<ProductState> emit,
  ) async {
    emit(ProductLoading());
    try {
      final products = await repository.getProducts();
      emit(ProductLoaded(products));
    } catch (e) {
      emit(ProductError(e.toString()));
    }
  }
}
```

#### 3. **Data Layer (数据层)**

负责数据获取和持久化。

**Repository Pattern:**
```dart
abstract class ProductRepository {
  Future<List<Product>> getProducts();
  Future<Product> getProductById(int id);
  Future<void> createProduct(Product product);
  Future<void> updateProduct(Product product);
  Future<void> deleteProduct(int id);
}

class ProductRepositoryImpl implements ProductRepository {
  final ApiClient apiClient;
  final LocalStorage localStorage;

  ProductRepositoryImpl({
    required this.apiClient,
    required this.localStorage,
  });

  @override
  Future<List<Product>> getProducts() async {
    try {
      // 优先从 API 获取
      final response = await apiClient.get('/products');
      final products = (response.data as List)
          .map((json) => Product.fromJson(json))
          .toList();

      // 缓存到本地
      await localStorage.saveProducts(products);

      return products;
    } catch (e) {
      // 网络失败，从缓存读取
      return await localStorage.getProducts();
    }
  }
}
```

#### 4. **Data Sources (数据源)**

**API Client (网络请求):**
```dart
class ApiClient {
  final Dio dio;

  ApiClient() : dio = Dio(BaseOptions(
    baseUrl: 'http://your-server.com/api/v1',
    connectTimeout: Duration(seconds: 5),
    receiveTimeout: Duration(seconds: 3),
  )) {
    // 添加拦截器：认证、日志、错误处理
    dio.interceptors.add(AuthInterceptor());
    dio.interceptors.add(LogInterceptor());
  }

  Future<Response> get(String path, {Map<String, dynamic>? params}) {
    return dio.get(path, queryParameters: params);
  }

  Future<Response> post(String path, {dynamic data}) {
    return dio.post(path, data: data);
  }
}
```

**Local Storage (本地存储):**
```dart
class LocalStorage {
  Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
  }

  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }

  Future<void> saveProducts(List<Product> products) async {
    final box = await Hive.openBox<Product>('products');
    await box.clear();
    await box.addAll(products);
  }
}
```

---

## 📦 Flutter 项目结构

```
warehouse_mobile/
├── android/                 # Android 原生代码
├── ios/                     # iOS 原生代码
├── lib/                     # Flutter 应用主代码
│   ├── main.dart           # 应用入口
│   │
│   ├── core/               # 核心功能
│   │   ├── api/            # API 客户端
│   │   │   ├── api_client.dart
│   │   │   └── interceptors/
│   │   ├── config/         # 配置
│   │   │   └── app_config.dart
│   │   ├── constants/      # 常量
│   │   │   ├── api_endpoints.dart
│   │   │   └── app_colors.dart
│   │   ├── error/          # 错误处理
│   │   │   └── exceptions.dart
│   │   └── utils/          # 工具类
│   │       └── validators.dart
│   │
│   ├── data/               # 数据层
│   │   ├── models/         # 数据模型
│   │   │   ├── user.dart
│   │   │   ├── product.dart
│   │   │   └── inventory.dart
│   │   ├── repositories/   # Repository 实现
│   │   │   ├── auth_repository.dart
│   │   │   ├── product_repository.dart
│   │   │   └── inventory_repository.dart
│   │   └── datasources/    # 数据源
│   │       ├── remote/     # 远程数据源 (API)
│   │       └── local/      # 本地数据源 (缓存)
│   │
│   ├── domain/             # 业务逻辑层 (可选，Clean Architecture)
│   │   ├── entities/       # 业务实体
│   │   ├── repositories/   # Repository 接口
│   │   └── usecases/       # 用例
│   │
│   ├── presentation/       # 表现层 (UI)
│   │   ├── blocs/          # BLoC 状态管理
│   │   │   ├── auth/
│   │   │   │   ├── auth_bloc.dart
│   │   │   │   ├── auth_event.dart
│   │   │   │   └── auth_state.dart
│   │   │   ├── product/
│   │   │   └── inventory/
│   │   │
│   │   ├── pages/          # 页面
│   │   │   ├── auth/
│   │   │   │   ├── login_page.dart
│   │   │   │   └── register_page.dart
│   │   │   ├── dashboard/
│   │   │   │   └── dashboard_page.dart
│   │   │   ├── products/
│   │   │   │   ├── product_list_page.dart
│   │   │   │   └── product_detail_page.dart
│   │   │   ├── inventory/
│   │   │   ├── ai/
│   │   │   │   └── ai_chat_page.dart
│   │   │   └── settings/
│   │   │
│   │   └── widgets/        # 可复用组件
│   │       ├── common/
│   │       │   ├── app_button.dart
│   │       │   ├── loading_indicator.dart
│   │       │   └── error_widget.dart
│   │       └── product/
│   │           └── product_card.dart
│   │
│   ├── routes/             # 路由配置
│   │   └── app_router.dart
│   │
│   └── l10n/               # 国际化
│       ├── app_en.arb
│       └── app_zh.arb
│
├── test/                   # 单元测试
├── integration_test/       # 集成测试
├── assets/                 # 资源文件
│   ├── images/
│   ├── icons/
│   └── fonts/
├── pubspec.yaml           # 项目依赖配置
└── README.md
```

---

## 🚀 快速开始

### 1. 安装 Flutter

**macOS:**
```bash
# 安装 Flutter SDK
git clone https://github.com/flutter/flutter.git -b stable
export PATH="$PATH:`pwd`/flutter/bin"

# 验证安装
flutter doctor
```

**Windows:**
```powershell
# 下载 Flutter SDK
# https://docs.flutter.dev/get-started/install/windows

# 验证安装
flutter doctor
```

### 2. 创建 Flutter 项目

```bash
# 创建新项目
flutter create warehouse_mobile

cd warehouse_mobile

# 运行项目
flutter run
```

### 3. 添加依赖

编辑 `pubspec.yaml`：

```yaml
dependencies:
  flutter:
    sdk: flutter

  # 状态管理
  flutter_bloc: ^8.1.3
  provider: ^6.0.5

  # 网络请求
  dio: ^5.3.3
  retrofit: ^4.0.3

  # 本地存储
  shared_preferences: ^2.2.2
  hive: ^2.2.3
  hive_flutter: ^1.1.0

  # JSON 序列化
  json_annotation: ^4.8.1

  # 依赖注入
  get_it: ^7.6.4
  injectable: ^2.3.2

  # 路由导航
  go_router: ^12.1.1

  # UI 组件
  flutter_svg: ^2.0.9
  cached_network_image: ^3.3.0
  shimmer: ^3.0.0

  # 工具
  equatable: ^2.0.5
  dartz: ^0.10.1
  intl: ^0.18.1

dev_dependencies:
  flutter_test:
    sdk: flutter

  # 代码生成
  build_runner: ^2.4.6
  json_serializable: ^6.7.1
  retrofit_generator: ^8.0.4
  injectable_generator: ^2.4.1

  # 代码分析
  flutter_lints: ^3.0.1
```

安装依赖：
```bash
flutter pub get
```

---

## 🔧 核心功能实现

### 1. API 客户端

**`lib/core/api/api_client.dart`:**

```dart
import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

part 'api_client.g.dart';  // 代码生成

@RestApi(baseUrl: "http://your-server.com/api/v1")
abstract class ApiClient {
  factory ApiClient(Dio dio, {String baseUrl}) = _ApiClient;

  // 认证
  @POST("/auth/login")
  Future<LoginResponse> login(@Body() LoginRequest request);

  // 产品
  @GET("/products")
  Future<List<Product>> getProducts();

  @GET("/products/{id}")
  Future<Product> getProductById(@Path("id") int id);

  @POST("/products")
  Future<Product> createProduct(@Body() Product product);

  // 库存
  @GET("/inventory")
  Future<List<InventoryItem>> getInventory();

  // AI 功能
  @POST("/ai/rag/query")
  Future<RagResponse> ragQuery(@Body() RagRequest request);

  @POST("/ai/chat")
  Future<ChatResponse> chat(@Body() ChatRequest request);
}
```

**认证拦截器：**

```dart
class AuthInterceptor extends Interceptor {
  final LocalStorage localStorage;

  AuthInterceptor(this.localStorage);

  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    // 添加 JWT Token
    final token = await localStorage.getToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    super.onRequest(options, handler);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    // 处理 401 未授权错误
    if (err.response?.statusCode == 401) {
      // 跳转到登录页
      // navigatorKey.currentState?.pushReplacementNamed('/login');
    }
    super.onError(err, handler);
  }
}
```

### 2. 数据模型

**`lib/data/models/product.dart`:**

```dart
import 'package:json_annotation/json_annotation.dart';
import 'package:equatable/equatable.dart';

part 'product.g.dart';  // 代码生成

@JsonSerializable()
class Product extends Equatable {
  final int id;
  final String name;
  final String sku;
  final double price;
  @JsonKey(name: 'part_number')
  final String? partNumber;
  @JsonKey(name: 'engine_model')
  final String? engineModel;
  @JsonKey(name: 'image_url')
  final String? imageUrl;
  @JsonKey(name: 'is_active')
  final bool isActive;

  const Product({
    required this.id,
    required this.name,
    required this.sku,
    required this.price,
    this.partNumber,
    this.engineModel,
    this.imageUrl,
    this.isActive = true,
  });

  factory Product.fromJson(Map<String, dynamic> json) =>
      _$ProductFromJson(json);

  Map<String, dynamic> toJson() => _$ProductToJson(this);

  @override
  List<Object?> get props => [
        id,
        name,
        sku,
        price,
        partNumber,
        engineModel,
        imageUrl,
        isActive,
      ];
}
```

生成代码：
```bash
flutter pub run build_runner build
```

### 3. BLoC 状态管理

**`lib/presentation/blocs/product/product_bloc.dart`:**

```dart
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';

// Events
abstract class ProductEvent extends Equatable {
  @override
  List<Object?> get props => [];
}

class LoadProducts extends ProductEvent {}

class SearchProducts extends ProductEvent {
  final String query;
  SearchProducts(this.query);
  @override
  List<Object?> get props => [query];
}

// States
abstract class ProductState extends Equatable {
  @override
  List<Object?> get props => [];
}

class ProductInitial extends ProductState {}

class ProductLoading extends ProductState {}

class ProductLoaded extends ProductState {
  final List<Product> products;
  ProductLoaded(this.products);
  @override
  List<Object?> get props => [products];
}

class ProductError extends ProductState {
  final String message;
  ProductError(this.message);
  @override
  List<Object?> get props => [message];
}

// BLoC
class ProductBloc extends Bloc<ProductEvent, ProductState> {
  final ProductRepository repository;

  ProductBloc({required this.repository}) : super(ProductInitial()) {
    on<LoadProducts>(_onLoadProducts);
    on<SearchProducts>(_onSearchProducts);
  }

  Future<void> _onLoadProducts(
    LoadProducts event,
    Emitter<ProductState> emit,
  ) async {
    emit(ProductLoading());
    try {
      final products = await repository.getProducts();
      emit(ProductLoaded(products));
    } catch (e) {
      emit(ProductError(e.toString()));
    }
  }

  Future<void> _onSearchProducts(
    SearchProducts event,
    Emitter<ProductState> emit,
  ) async {
    emit(ProductLoading());
    try {
      final products = await repository.searchProducts(event.query);
      emit(ProductLoaded(products));
    } catch (e) {
      emit(ProductError(e.toString()));
    }
  }
}
```

### 4. UI 页面

**`lib/presentation/pages/products/product_list_page.dart`:**

```dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class ProductListPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('产品列表'),
        actions: [
          IconButton(
            icon: Icon(Icons.search),
            onPressed: () {
              // 搜索功能
            },
          ),
        ],
      ),
      body: BlocBuilder<ProductBloc, ProductState>(
        builder: (context, state) {
          if (state is ProductLoading) {
            return Center(child: CircularProgressIndicator());
          } else if (state is ProductLoaded) {
            return ListView.builder(
              itemCount: state.products.length,
              itemBuilder: (context, index) {
                final product = state.products[index];
                return ProductCard(product: product);
              },
            );
          } else if (state is ProductError) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.error, size: 64, color: Colors.red),
                  SizedBox(height: 16),
                  Text(state.message),
                  SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () {
                      context.read<ProductBloc>().add(LoadProducts());
                    },
                    child: Text('重试'),
                  ),
                ],
              ),
            );
          }
          return Container();
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // 添加产品
        },
        child: Icon(Icons.add),
      ),
    );
  }
}
```

**`lib/presentation/widgets/product/product_card.dart`:**

```dart
class ProductCard extends StatelessWidget {
  final Product product;

  const ProductCard({required this.product});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: ListTile(
        leading: product.imageUrl != null
            ? CachedNetworkImage(
                imageUrl: product.imageUrl!,
                width: 60,
                height: 60,
                fit: BoxFit.cover,
                placeholder: (context, url) => CircularProgressIndicator(),
                errorWidget: (context, url, error) => Icon(Icons.error),
              )
            : Icon(Icons.inventory, size: 60),
        title: Text(product.name),
        subtitle: Text('SKU: ${product.sku}\n价格: ¥${product.price}'),
        isThreeLine: true,
        trailing: Icon(Icons.chevron_right),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => ProductDetailPage(product: product),
            ),
          );
        },
      ),
    );
  }
}
```

---

## 📱 核心功能清单

### 已规划功能

- [x] **用户认证**
  - [x] 登录/注册
  - [x] JWT Token 管理
  - [x] 自动登录

- [x] **产品管理**
  - [x] 产品列表
  - [x] 产品详情
  - [x] 产品搜索
  - [x] 产品创建/编辑

- [x] **库存管理**
  - [x] 库存列表
  - [x] 库存调整
  - [x] 库存预警

- [x] **仪表盘**
  - [x] 销售统计
  - [x] 库存概览
  - [x] 图表展示

- [x] **AI 功能**
  - [x] AI 聊天助手
  - [x] 产品洞察
  - [x] RAG 问答

- [x] **用户设置**
  - [x] 个人资料
  - [x] 头像上传
  - [x] 语言切换
  - [x] 主题切换

### 高级功能（可选）

- [ ] **离线支持**
  - [ ] 本地数据缓存
  - [ ] 离线操作队列
  - [ ] 同步机制

- [ ] **通知**
  - [ ] Push Notifications
  - [ ] 库存预警提醒
  - [ ] 订单通知

- [ ] **扫码功能**
  - [ ] 条形码/二维码扫描
  - [ ] 快速入库/出库

- [ ] **数据分析**
  - [ ] 图表可视化
  - [ ] 导出报表

---

## 🛠️ 开发工具和插件

### VS Code 插件

```json
{
  "recommendations": [
    "Dart-Code.dart-code",
    "Dart-Code.flutter",
    "alexisvt.flutter-snippets",
    "Nash.awesome-flutter-snippets",
    "felixangelov.bloc"
  ]
}
```

### Android Studio 插件

- Flutter
- Dart
- Flutter Intl
- Bloc

---

## 📚 学习资源

### 官方文档
- [Flutter 官方文档](https://docs.flutter.dev/)
- [Dart 语言指南](https://dart.dev/guides)
- [Flutter BLoC](https://bloclibrary.dev/)

### 推荐教程
- [Flutter 实战](https://book.flutterchina.club/)
- [Flutter 完整开发实战详解](https://guoshuyu.cn/home/wx/)

### 示例项目
- [Flutter Gallery](https://github.com/flutter/gallery)
- [FlutterFire Samples](https://github.com/firebase/flutterfire/tree/master/packages)

---

## 📝 下一步

1. ✅ **设置开发环境**
   - 安装 Flutter SDK
   - 配置 IDE 和插件

2. 🚀 **创建项目**
   - 使用 `flutter create` 创建项目
   - 配置 `pubspec.yaml` 依赖

3. 🔧 **实现核心功能**
   - 登录认证
   - 产品列表
   - API 集成

4. 🎨 **UI/UX 设计**
   - 设计应用主题
   - 实现可复用组件

5. 🧪 **测试和调试**
   - 单元测试
   - 集成测试
   - UI 测试

6. 📦 **打包发布**
   - Android APK/AAB
   - iOS IPA

---

**文档版本：** v1.0
**最后更新：** 2025-11-18
**维护者：** Product Warehouse Team
