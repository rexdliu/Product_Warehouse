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

// 认证相关接口
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  phone: string;
  password: string;
  full_name?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  full_name?: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at?: string;
  theme?: string;
  notifications?: any;
  ai_settings?: any;
  avatar_url?: string;
}

export interface UserSettings {
  theme?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
    lowStock?: boolean;
    orderUpdates?: boolean;
    systemAlerts?: boolean;
  };
  ai_settings?: {
    enabled?: boolean;
    autoSuggestions?: boolean;
    voiceInput?: boolean;
    contextMemory?: string;
    responseSpeed?: string;
  };
  avatar_url?: string;
}

export interface UserSettingsUpdate extends UserSettings {}

export interface PasswordUpdateRequest {
  current_password: string;
  new_password: string;
}

class ApiService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('access_token', token);
    } else {
      localStorage.removeItem('access_token');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('access_token');
    }
    return this.token;
  }

  private async request<T>(url: string, init?: RequestInit): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...init?.headers,
    };

    // 添加认证token（如果存在）
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      headers,
      ...init,
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

  // ========== 认证相关API ==========

  /**
   * 用户登录
   */
  async login(username: string, password: string): Promise<LoginResponse> {
    // FastAPI的OAuth2PasswordRequestForm期望form data，不是JSON
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Login failed (${response.status}): ${detail || response.statusText}`);
    }

    const data = await response.json() as LoginResponse;

    // 保存token
    this.setToken(data.access_token);

    return data;
  }

  /**
   * 用户注册
   */
  async register(data: RegisterRequest): Promise<User> {
    const response = await fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Registration failed (${response.status}): ${detail || response.statusText}`);
    }

    return response.json() as Promise<User>;
  }

  /**
   * 登出
   */
  logout() {
    this.setToken(null);
  }

  // ========== 用户相关API ==========

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<User> {
    return this.request<User>('/api/v1/users/me');
  }

  /**
   * 获取用户设置
   */
  async getUserSettings(): Promise<UserSettings> {
    return this.request<UserSettings>('/api/v1/users/settings');
  }

  /**
   * 更新用户设置
   */
  async updateUserSettings(settings: UserSettingsUpdate): Promise<UserSettings> {
    return this.request<UserSettings>('/api/v1/users/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  /**
   * 修改密码
   */
  async updatePassword(data: PasswordUpdateRequest): Promise<{ msg: string }> {
    return this.request<{ msg: string }>('/api/v1/users/me/password', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

export const apiService = new ApiService();
