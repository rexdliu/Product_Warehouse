// src/services/api.ts
const API_BASE_URL = 'http://127.0.0.1:8000';

interface Product {
  id: number;
  name: string;
  quantity: number;
}

interface HealthCheckResponse {
  status: string;
}

interface ProductsResponse {
  products: Product[];
}

class ApiService {
  async healthCheck(): Promise<HealthCheckResponse> {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async getProducts(): Promise<ProductsResponse> {
    const response = await fetch(`${API_BASE_URL}/api/products`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }
}

export const apiService = new ApiService();