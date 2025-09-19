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

class ApiService {
  private async request<T>(url: string, init?: RequestInit): Promise<T> {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
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
}

export const apiService = new ApiService();
