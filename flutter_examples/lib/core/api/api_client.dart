import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import 'package:warehouse_mobile/data/models/user.dart';
import 'package:warehouse_mobile/data/models/product.dart';

part 'api_client.g.dart';

@RestApi(baseUrl: "http://localhost:8001/api/v1")
abstract class ApiClient {
  factory ApiClient(Dio dio, {String baseUrl}) = _ApiClient;

  // ==================== 认证 ====================
  @POST("/auth/login")
  Future<LoginResponse> login(@Body() LoginRequest request);

  @POST("/auth/register")
  Future<User> register(@Body() RegisterRequest request);

  @GET("/users/me")
  Future<User> getCurrentUser();

  // ==================== 产品 ====================
  @GET("/products")
  Future<List<Product>> getProducts({
    @Query("skip") int? skip,
    @Query("limit") int? limit,
    @Query("search") String? search,
  });

  @GET("/products/{id}")
  Future<Product> getProductById(@Path("id") int id);

  @POST("/products")
  Future<Product> createProduct(@Body() Product product);

  @PUT("/products/{id}")
  Future<Product> updateProduct(
    @Path("id") int id,
    @Body() Product product,
  );

  @DELETE("/products/{id}")
  Future<void> deleteProduct(@Path("id") int id);

  // ==================== 库存 ====================
  @GET("/inventory")
  Future<List<InventoryItem>> getInventory();

  @POST("/inventory/{product_id}/adjust")
  Future<void> adjustInventory(
    @Path("product_id") int productId,
    @Body() InventoryAdjustment adjustment,
  );

  // ==================== AI 功能 ====================
  @POST("/ai/rag/query")
  Future<RagResponse> ragQuery(@Body() RagRequest request);

  @POST("/ai/insights")
  Future<InsightResponse> getProductInsights(@Body() InsightRequest request);

  @POST("/ai/chat")
  Future<ChatResponse> chat(@Body() ChatRequest request);

  // ==================== 仪表盘 ====================
  @GET("/dashboard/summary")
  Future<DashboardSummary> getDashboardSummary();
}

// ==================== Request/Response 模型 ====================

class LoginRequest {
  final String username;
  final String password;

  LoginRequest({required this.username, required this.password});

  Map<String, dynamic> toJson() => {
        'username': username,
        'password': password,
      };
}

class LoginResponse {
  final String accessToken;
  final String tokenType;

  LoginResponse({required this.accessToken, required this.tokenType});

  factory LoginResponse.fromJson(Map<String, dynamic> json) => LoginResponse(
        accessToken: json['access_token'],
        tokenType: json['token_type'],
      );
}

class RegisterRequest {
  final String username;
  final String email;
  final String password;
  final String? fullName;

  RegisterRequest({
    required this.username,
    required this.email,
    required this.password,
    this.fullName,
  });

  Map<String, dynamic> toJson() => {
        'username': username,
        'email': email,
        'password': password,
        if (fullName != null) 'full_name': fullName,
      };
}
