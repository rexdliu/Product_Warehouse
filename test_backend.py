from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)