// src/services/api.ts
// 统一封装后台 API 调用

export interface HealthCheckResponse {
  status: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  description?: string;
  price: number;
  cost?: number;
  categoryId?: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface InventoryItem {
  id: number;
  productId: number;
  warehouseId: number;
  quantity: number;
  reservedQuantity: number;
  updatedAt?: string;
}

export interface Distributor {
  id: number;
  name: string;
  contactPerson: string;
  phone: string;
  region: string;
  createdAt: string;
}

export interface SalesOrder {
  id: number;
  orderCode: string;
  distributorId: number;
  productId: number;
  productName: string;
  quantity: number;
  totalValue: number;
  orderDate: string;
  createdAt: string;
}

export interface RAGQueryResponse {
  answer: string;
  sources: Array<{
    id: string;
    title: string;
    category: string;
    content: string;
  }>;
}

interface ProductDTO {
  id: number;
  name: string;
  sku: string;
  description?: string;
  price: number;
  cost?: number;
  category_id?: number;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

interface InventoryDTO {
  id: number;
  product_id: number;
  warehouse_id: number;
  quantity: number;
  reserved_quantity: number;
  updated_at?: string;
}

interface DistributorDTO {
  id: number;
  name: string;
  contact_person: string;
  phone: string;
  region: string;
  created_at: string;
}

interface SalesOrderDTO {
  id: number;
  order_code: string;
  distributor_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  total_value: number;
  order_date: string;
  created_at: string;
}

interface ProductCategoryDTO {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

export interface ProductCategory {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
}

// Dashboard API 类型定义
export interface DashboardStats {
  total_products: number;
  total_inventory: number;
  low_stock_items: number;
  out_of_stock: number;
  total_warehouses: number;
  pending_orders: number;
  total_inventory_value: number;
}

export interface StockStatus {
  status: string;
  count: number;
  percentage: number;
}

export interface ActivityLog {
  id: number;
  activity_type: string;
  action: string;
  item_name: string;
  user_id?: number;
  reference_id?: number;
  reference_type?: string;
  created_at: string;
}

export interface InventoryAlert {
  id: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  warehouse_name: string;
  current_quantity: number;
  min_stock_level: number;
  alert_type: string;
  severity: string;
}

export interface TopProduct {
  product_id: number;
  product_name: string;
  sku: string;
  total_sold: number;
  total_revenue: number;
}

export interface WarehouseUtilization {
  warehouse_id: number;
  warehouse_name: string;
  warehouse_code: string;
  capacity: number;
  current_usage: number;
  utilization_rate: number;
}

export interface OrderStatusDistribution {
  status: string;
  count: number;
  total_value: number;
}

export interface DashboardResponse {
  stats: DashboardStats;
  stock_status: StockStatus[];
  recent_activities: ActivityLog[];
  inventory_alerts: InventoryAlert[];
  top_products: TopProduct[];
  warehouse_utilization: WarehouseUtilization[];
  order_status_distribution: OrderStatusDistribution[];
}

// Auth API 类型定义
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  phone?: string;
  full_name?: string;
  role?: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  role: string;
  is_active: boolean;
}

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('access_token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('access_token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('access_token');
  }
  private async request<T>(url: string, init?: RequestInit): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...init?.headers as Record<string, string>,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...init,
      headers,
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Request failed (${response.status}): ${detail || response.statusText}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  async healthCheck(): Promise<HealthCheckResponse> {
    return this.request<HealthCheckResponse>('/health');
  }

  async getProducts(): Promise<Product[]> {
    const data = await this.request<ProductDTO[]>('/api/v1/products/');
    return data.map((item) => ({
      id: item.id,
      name: item.name,
      sku: item.sku,
      description: item.description,
      price: item.price,
      cost: item.cost,
      categoryId: item.category_id,
      imageUrl: item.image_url,
      isActive: item.is_active,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  }

  async getInventoryItems(): Promise<InventoryItem[]> {
    const data = await this.request<InventoryDTO[]>('/api/v1/inventory/items');
    return data.map((item) => ({
      id: item.id,
      productId: item.product_id,
      warehouseId: item.warehouse_id,
      quantity: item.quantity,
      reservedQuantity: item.reserved_quantity,
      updatedAt: item.updated_at,
    }));
  }

  async getDistributors(): Promise<Distributor[]> {
    const data = await this.request<DistributorDTO[]>('/api/v1/sales/distributors');
    return data.map((item) => ({
      id: item.id,
      name: item.name,
      contactPerson: item.contact_person,
      phone: item.phone,
      region: item.region,
      createdAt: item.created_at,
    }));
  }

  async getSalesOrders(distributorId?: number): Promise<SalesOrder[]> {
    const params = distributorId ? `?distributor_id=${distributorId}` : '';
    const data = await this.request<SalesOrderDTO[]>(`/api/v1/sales/orders${params}`);
    return data.map((item) => ({
      id: item.id,
      orderCode: item.order_code,
      distributorId: item.distributor_id,
      productId: item.product_id,
      productName: item.product_name,
      quantity: item.quantity,
      totalValue: item.total_value,
      orderDate: item.order_date,
      createdAt: item.created_at,
    }));
  }

  async queryRag(question: string, topK = 3): Promise<RAGQueryResponse> {
    return this.request<RAGQueryResponse>('/api/v1/ai/rag/query', {
      method: 'POST',
      body: JSON.stringify({ question, top_k: topK }),
    });
  }

  async getProductCategories(): Promise<ProductCategory[]> {
    const data = await this.request<ProductCategoryDTO[]>('/api/v1/products/categories');
    return data.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      createdAt: item.created_at,
    }));
  }

  // Dashboard API 方法
  async getDashboard(): Promise<DashboardResponse> {
    return this.request<DashboardResponse>('/api/v1/dashboard/');
  }

  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/api/v1/dashboard/stats');
  }

  async getStockStatus(): Promise<StockStatus[]> {
    return this.request<StockStatus[]>('/api/v1/dashboard/stock-status');
  }

  async getRecentActivities(limit = 10): Promise<ActivityLog[]> {
    return this.request<ActivityLog[]>(`/api/v1/dashboard/activities?limit=${limit}`);
  }

  async getInventoryAlerts(limit = 20): Promise<InventoryAlert[]> {
    return this.request<InventoryAlert[]>(`/api/v1/dashboard/alerts?limit=${limit}`);
  }

  async getTopProducts(limit = 5, days = 30): Promise<TopProduct[]> {
    return this.request<TopProduct[]>(`/api/v1/dashboard/top-products?limit=${limit}&days=${days}`);
  }

  async getWarehouseUtilization(): Promise<WarehouseUtilization[]> {
    return this.request<WarehouseUtilization[]>('/api/v1/dashboard/warehouse-utilization');
  }

  async getOrderStatusDistribution(): Promise<OrderStatusDistribution[]> {
    return this.request<OrderStatusDistribution[]>('/api/v1/dashboard/order-status-distribution');
  }

  async getInventorySalesTrend(period: string = 'weekly', days: number = 30): Promise<{
    labels: string[];
    inventory_levels: number[];
    sales_data: number[];
  }> {
    return this.request<{
      labels: string[];
      inventory_levels: number[];
      sales_data: number[];
    }>(`/api/v1/dashboard/inventory-sales-trend?period=${period}&days=${days}`);
  }

  async getProductMovement(period: string = 'weekly', days: number = 30): Promise<{
    labels: string[];
    movement_data: number[];
  }> {
    return this.request<{
      labels: string[];
      movement_data: number[];
    }>(`/api/v1/dashboard/product-movement?period=${period}&days=${days}`);
  }

  async getCategoryDistribution(): Promise<{
    labels: string[];
    data: number[];
  }> {
    return this.request<{
      labels: string[];
      data: number[];
    }>('/api/v1/dashboard/category-distribution');
  }

  // Auth API 方法
  async login(username: string, password: string): Promise<LoginResponse> {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await this.request<LoginResponse>('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    // 保存 token
    this.setToken(response.access_token);
    return response;
  }

  async register(data: RegisterRequest): Promise<UserResponse> {
    return this.request<UserResponse>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCurrentUser(): Promise<UserResponse> {
    return this.request<UserResponse>('/api/v1/users/me');
  }

  logout() {
    this.clearToken();
  }
}

export const apiService = new ApiService();
