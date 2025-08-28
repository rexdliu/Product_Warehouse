"""
WarehouseAI 后端主应用入口文件

该文件包含 FastAPI 应用的初始化、配置和路由注册。
主要功能：
1. 初始化 FastAPI 应用实例
2. 配置 CORS 中间件以支持跨域请求
3. 注册 API 路由
4. 提供健康检查端点
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import api_router
from app.core.config import settings

app = FastAPI(
    title="WarehouseAI API",
    description="API for Warehouse Management with AI capabilities",
    version="1.0.0"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 包含API路由
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    """根路径，返回欢迎信息"""
    return {"message": "Welcome to WarehouseAI API"}

@app.get("/health")
async def health_check():
    """健康检查端点，用于监控服务状态"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)