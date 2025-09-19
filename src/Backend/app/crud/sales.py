"""销售相关 CRUD"""

from typing import List, Optional
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.sales import Distributor, SalesOrder
from app.schemas.sales import (
    DistributorCreate,
    DistributorUpdate,
    SalesOrderCreate,
    SalesOrderUpdate,
)


class CRUDDistributor(CRUDBase[Distributor, DistributorCreate, DistributorUpdate]):
    pass


class CRUDSalesOrder(CRUDBase[SalesOrder, SalesOrderCreate, SalesOrderUpdate]):
    def get_by_distributor(
        self,
        db: Session,
        *,
        distributor_id: int,
        skip: int = 0,
        limit: int = 100,
    ) -> List[SalesOrder]:
        return (
            db.query(SalesOrder)
            .filter(SalesOrder.distributor_id == distributor_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_code(self, db: Session, *, order_code: str) -> Optional[SalesOrder]:
        return db.query(SalesOrder).filter(SalesOrder.order_code == order_code).first()


distributor = CRUDDistributor(Distributor)
sales_order = CRUDSalesOrder(SalesOrder)
