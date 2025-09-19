from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class DistributorBase(BaseModel):
    name: str
    contact_person: str
    phone: str
    region: str


class DistributorCreate(DistributorBase):
    pass


class DistributorUpdate(BaseModel):
    name: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    region: Optional[str] = None


class DistributorInDB(DistributorBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class SalesOrderBase(BaseModel):
    order_code: str
    distributor_id: int
    product_id: int
    product_name: str
    quantity: int
    total_value: float
    order_date: datetime


class SalesOrderCreate(SalesOrderBase):
    pass


class SalesOrderUpdate(BaseModel):
    quantity: Optional[int] = None
    total_value: Optional[float] = None
    order_date: Optional[datetime] = None


class SalesOrderInDB(SalesOrderBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
