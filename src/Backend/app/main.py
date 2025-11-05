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
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from .api.v1 import api_router
from app.core.config import settings
from app.core.database import Base, engine
# 导入模型以确保元数据注册
from app.models import user as user_models  # noqa: F401
from app.models import product as product_models  # noqa: F401
from app.models import inventory as inventory_models  # noqa: F401
from app.models import sales as sales_models  # noqa: F401
import os
from pathlib import Path

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

# 查找dist目录的位置（生产环境）
# 目录结构：Product_Warehouse/
#   ├── src/Backend/app/main.py (当前文件)
#   └── dist/ (构建后的前端文件)
current_file = Path(__file__)  # .../src/Backend/app/main.py
project_root = current_file.parent.parent.parent.parent  # 上4级到项目根目录
dist_path = project_root / "dist"

# 如果dist目录存在，挂载静态文件
if dist_path.exists() and dist_path.is_dir():
    print(f"📁 找到前端构建文件: {dist_path}")

    # 挂载静态资源文件（带缓存）
    app.mount("/assets", StaticFiles(directory=str(dist_path / "assets")), name="assets")

    # 根路径返回index.html
    @app.get("/")
    async def serve_frontend_root():
        """生产环境：返回前端index.html"""
        index_file = dist_path / "index.html"
        if index_file.exists():
            return FileResponse(str(index_file))
        return {"message": "Frontend not built. Run 'npm run build' first."}

    # Catch-all路由：支持前端路由（React Router）
    # 这必须放在最后，匹配所有未被API路由捕获的路径
    from fastapi import Request

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str, request: Request):
        """
        Catch-all路由：返回index.html以支持前端路由

        注意：API路由(/api/v1/*)会优先匹配，不会进入这里
        """
        # 如果是请求静态文件，尝试返回
        file_path = dist_path / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(str(file_path))

        # 否则返回index.html（让前端路由处理）
        index_file = dist_path / "index.html"
        if index_file.exists():
            return FileResponse(str(index_file))

        return {"message": "Frontend not found"}

    print("✅ 生产模式：前端静态文件已挂载")
else:
    print(f"⚠️  开发模式：未找到dist目录 ({dist_path})")
    print("   提示：运行 'npm run build' 构建前端")

    @app.get("/")
    async def root():
        """开发模式：返回欢迎信息"""
        return {
            "message": "Welcome to WarehouseAI API",
            "mode": "development",
            "note": "Run 'npm run build' to build frontend for production"
        }

@app.get("/api/v1/health")
async def api_health_check():
    """版本化健康检查端点，便于前端统一代理"""
    return {"status": "healthy"}

@app.get("/health")
async def health_check():
    """健康检查端点，用于监控服务状态"""
    return {"status": "healthy"}

@app.get("/favicon.ico")
async def favicon():
    """Favicon图标"""
    # 使用绝对路径或相对路径查找favicon文件
    favicon_path = os.path.join("..", "..", "public", "favicon.ico")
    logo_path = os.path.join("..", "..", "public", "cummins_logo.png")
    
    if os.path.exists(favicon_path):
        return FileResponse(favicon_path)
    elif os.path.exists(logo_path):
        return FileResponse(logo_path)
    else:
        return {"message": "Favicon not found"}

@app.on_event("startup")
def on_startup() -> None:
    """应用启动时初始化数据库表（本地开发）。

    未连接外部数据库时，使用 SQLite 自动建表，方便前端联调。
    """
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
