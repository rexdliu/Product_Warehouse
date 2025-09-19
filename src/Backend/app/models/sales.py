"""销售相关模型"""

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Distributor(Base):
    __tablename__ = "distributors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    contact_person = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    region = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    sales_orders = relationship("SalesOrder", back_populates="distributor", cascade="all,delete")


class SalesOrder(Base):
    __tablename__ = "sales_orders"

    id = Column(Integer, primary_key=True, index=True)
    order_code = Column(String, unique=True, nullable=False)
    distributor_id = Column(Integer, ForeignKey("distributors.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    product_name = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    total_value = Column(Float, nullable=False)
    order_date = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    distributor = relationship("Distributor", back_populates="sales_orders")
