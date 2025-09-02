// src/services/api.ts
// 使用相对路径配合 Vite 代理，避免端口差异

export interface Product {
  id: number;
  name: string;
}

export interface HealthCheckResponse {
  status: string;
}

class ApiService {
  async healthCheck(): Promise<HealthCheckResponse> {
    const response = await fetch(`/health`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async getProducts(): Promise<Product[]> {
    const response = await fetch(`/api/v1/products`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }
}

export const apiService = new ApiService();
