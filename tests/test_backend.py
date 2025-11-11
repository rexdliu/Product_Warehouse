from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import threading
import time
import requests
import json

app = FastAPI(title="Product Warehouse API", version="1.0.0")

# 添加CORS中间件以允许前端连接
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中应该指定具体的域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Product Warehouse API"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

@app.get("/api/products")
def get_products():
    # 模拟产品数据
    products = [
        {"id": 1, "name": "Product 1", "quantity": 10},
        {"id": 2, "name": "Product 2", "quantity": 20},
        {"id": 3, "name": "Product 3", "quantity": 30},
    ]
    return {"products": products}

@app.get("/api/inventory")
def get_inventory():
    # 模拟库存数据
    inventory = [
        {"id": 1, "product_id": 1, "location": "A1", "quantity": 10},
        {"id": 2, "product_id": 2, "location": "A2", "quantity": 20},
        {"id": 3, "product_id": 3, "location": "B1", "quantity": 30},
    ]
    return {"inventory": inventory}

def run_server():
    """在后台线程中运行服务器"""
    uvicorn.run(app, host="127.0.0.1", port=8001, log_level="warning")

def test_endpoints():
    """测试所有API端点"""
    print("开始测试API端点...")
    
    # 等待服务器启动
    time.sleep(2)
    
    base_url = "http://127.0.0.1:8000"
    
    try:
        # 测试根路径
        print("\n1. 测试根路径端点...")
        response = requests.get(f"{base_url}/")
        print(f"   状态码: {response.status_code}")
        print(f"   响应: {response.json()}")
        
        # 测试健康检查©
        print("\n2. 测试健康检查端点...")
        response = requests.get(f"{base_url}/api/health")
        print(f"   状态码: {response.status_code}")
        print(f"   响应: {response.json()}")
        
        # 测试产品端点
        print("\n3. 测试产品端点...")
        response = requests.get(f"{base_url}/api/products")
        print(f"   状态码: {response.status_code}")
        print(f"   响应: {response.json()}")
        
        # 测试库存端点
        print("\n4. 测试库存端点...")
        response = requests.get(f"{base_url}/api/inventory")
        print(f"   状态码: {response.status_code}")
        print(f"   响应: {response.json()}")
        
        print("\n所有测试完成!")
        
    except requests.exceptions.ConnectionError:
        print("错误: 无法连接到服务器")
    except Exception as e:
        print(f"测试过程中发生错误: {e}")

if __name__ == "__main__":
    # 在后台线程中启动服务器
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    
    # 运行测试
    test_endpoints()
    

    print("按 Ctrl+C 停止服务器")
    
    try:
        # 保持主线程运行
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n服务器已停止")