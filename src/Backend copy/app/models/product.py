"""
产品相关数据模型

该模块定义了与产品管理相关的 SQLAlchemy 数据模型。
主要包含：
1. ProductCategory - 产品分类模型
2. Product - 产品模型
"""

from sqlalchemy import Column, Integer, String, Float, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class ProductCategory(Base):
    """
    产品分类模型
    
    用于对产品进行分类管理，例如电子产品、服装、食品等。
    """
    
    __tablename__ = "product_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Product(Base):
    """
    产品模型
    
    用于存储产品的基本信息，包括名称、SKU、价格、描述等。
    """
    
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    sku = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    cost = Column(Float)
    category_id = Column(Integer, ForeignKey("product_categories.id"))
    image_url = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 关系
    category = relationship("ProductCategory")