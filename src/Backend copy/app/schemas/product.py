"""
产品 Pydantic 模型

该模块定义了与产品相关的 Pydantic 模型，用于数据验证和序列化。
主要包含：
1. ProductCategory 相关模型
2. Product 相关模型
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# 产品分类基础模型
class ProductCategoryBase(BaseModel):
    """产品分类基础模型"""
    name: str
    description: Optional[str] = None

# 创建产品分类模型
class ProductCategoryCreate(ProductCategoryBase):
    """创建产品分类模型"""
    pass

# 更新产品分类模型
class ProductCategoryUpdate(ProductCategoryBase):
    """更新产品分类模型"""
    name: Optional[str] = None

# 产品分类数据库模型
class ProductCategoryInDB(ProductCategoryBase):
    """产品分类数据库模型"""
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# 产品基础模型
class ProductBase(BaseModel):
    """产品基础模型"""
    name: str
    sku: str
    description: Optional[str] = None
    price: float
    cost: Optional[float] = None
    category_id: Optional[int] = None
    image_url: Optional[str] = None
    is_active: bool = True

# 创建产品模型
class ProductCreate(ProductBase):
    """创建产品模型"""
    pass

# 更新产品模型
class ProductUpdate(ProductBase):
    """更新产品模型"""
    name: Optional[str] = None
    sku: Optional[str] = None
    price: Optional[float] = None
    is_active: Optional[bool] = None

# 产品数据库模型
class ProductInDB(ProductBase):
    """产品数据库模型"""
    id: int
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True