"""销售相关 API"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.crud import sales as sales_crud
from app.schemas.sales import (
    DistributorCreate,
    DistributorInDB,
    DistributorUpdate,
    SalesOrderCreate,
    SalesOrderInDB,
    SalesOrderUpdate,
)

router = APIRouter()


@router.get("/distributors", response_model=List[DistributorInDB])
def list_distributors(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> List[DistributorInDB]:
    return sales_crud.distributor.get_multi(db, skip=skip, limit=limit)


@router.post("/distributors", response_model=DistributorInDB, status_code=201)
def create_distributor(
    distributor_in: DistributorCreate,
    db: Session = Depends(get_db),
) -> DistributorInDB:
    return sales_crud.distributor.create(db, obj_in=distributor_in)


@router.put("/distributors/{distributor_id}", response_model=DistributorInDB)
def update_distributor(
    distributor_id: int,
    distributor_in: DistributorUpdate,
    db: Session = Depends(get_db),
) -> DistributorInDB:
    db_obj = sales_crud.distributor.get(db, distributor_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Distributor not found")
    return sales_crud.distributor.update(db, db_obj=db_obj, obj_in=distributor_in)


@router.get("/orders", response_model=List[SalesOrderInDB])
def list_sales_orders(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    distributor_id: Optional[int] = None,
) -> List[SalesOrderInDB]:
    if distributor_id is not None:
        return sales_crud.sales_order.get_by_distributor(
            db, distributor_id=distributor_id, skip=skip, limit=limit
        )
    return sales_crud.sales_order.get_multi(db, skip=skip, limit=limit)


@router.post("/orders", response_model=SalesOrderInDB, status_code=201)
def create_sales_order(
    order_in: SalesOrderCreate,
    db: Session = Depends(get_db),
) -> SalesOrderInDB:
    existing = sales_crud.sales_order.get_by_code(db, order_code=order_in.order_code)
    if existing:
        raise HTTPException(status_code=400, detail="Order code already exists")
    return sales_crud.sales_order.create(db, obj_in=order_in)


@router.put("/orders/{order_id}", response_model=SalesOrderInDB)
def update_sales_order(
    order_id: int,
    order_in: SalesOrderUpdate,
    db: Session = Depends(get_db),
) -> SalesOrderInDB:
    db_obj = sales_crud.sales_order.get(db, order_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Order not found")
    return sales_crud.sales_order.update(db, db_obj=db_obj, obj_in=order_in)
