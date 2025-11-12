"""销售相关 API"""

from typing import Iterable, List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.crud import sales as sales_crud
from app.schemas.sales import (
    DistributorCreate,
    DistributorInDB,
    DistributorUpdate,
    SalesOrderCreateRequest,
    SalesOrderCreate,
    SalesOrderInDB,
    SalesOrderUpdate,
)
from app.models.sales import Distributor, SalesOrder
from app.models.product import Product
from app.api.deps import require_manager_or_above
from app.models.user import User

router = APIRouter()


def _map_distributors(distributors: Iterable[Distributor]) -> List[DistributorInDB]:
    return [DistributorInDB.model_validate(item) for item in distributors]


def _map_sales_orders(orders: Iterable[SalesOrder]) -> List[SalesOrderInDB]:
    return [SalesOrderInDB.model_validate(item) for item in orders]


@router.get("/distributors", response_model=List[DistributorInDB])
def list_distributors(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> List[DistributorInDB]:
    distributors = sales_crud.distributor.get_multi(db, skip=skip, limit=limit)
    return _map_distributors(distributors)


@router.post("/distributors", response_model=DistributorInDB, status_code=201)
def create_distributor(
    distributor_in: DistributorCreate,
    db: Session = Depends(get_db),
) -> DistributorInDB:
    distributor = sales_crud.distributor.create(db, obj_in=distributor_in)
    return DistributorInDB.model_validate(distributor)


@router.put("/distributors/{distributor_id}", response_model=DistributorInDB)
def update_distributor(
    distributor_id: int,
    distributor_in: DistributorUpdate,
    db: Session = Depends(get_db),
) -> DistributorInDB:
    db_obj = sales_crud.distributor.get(db, distributor_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Distributor not found")
    updated = sales_crud.distributor.update(db, db_obj=db_obj, obj_in=distributor_in)
    return DistributorInDB.model_validate(updated)


@router.get("/orders", response_model=List[SalesOrderInDB])
def list_sales_orders(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    distributor_id: Optional[int] = None,
) -> List[SalesOrderInDB]:
    if distributor_id is not None:
        orders = sales_crud.sales_order.get_by_distributor(
            db, distributor_id=distributor_id, skip=skip, limit=limit
        )
    else:
        orders = sales_crud.sales_order.get_multi(db, skip=skip, limit=limit)
    return _map_sales_orders(orders)


@router.post("/orders", response_model=SalesOrderInDB, status_code=201)
def create_sales_order(
    order_in: SalesOrderCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager_or_above)
) -> SalesOrderInDB:
    """
    创建新订单

    需要 Manager/Admin/Tester 权限
    自动生成订单号格式: SO-YYYYMMDD-XXXX
    """
    # 验证经销商存在
    distributor = sales_crud.distributor.get(db, id=order_in.distributor_id)
    if not distributor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"经销商 ID {order_in.distributor_id} 不存在"
        )

    # 验证产品存在
    product = db.query(Product).filter(Product.id == order_in.product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"产品 ID {order_in.product_id} 不存在"
        )

    # 生成订单号: SO-YYYYMMDD-XXXX
    today_str = datetime.now().strftime("%Y%m%d")
    last_order = db.query(SalesOrder).filter(
        SalesOrder.order_code.like(f"SO{today_str}%")
    ).order_by(SalesOrder.id.desc()).first()

    if last_order:
        last_num = int(last_order.order_code[-4:])  # type: ignore[arg-type]
        order_code = f"SO{today_str}{(last_num + 1):04d}"
    else:
        order_code = f"SO{today_str}1001"

    # 构建完整的订单数据
    order_create = SalesOrderCreate(
        order_code=order_code,
        distributor_id=order_in.distributor_id,
        product_id=order_in.product_id,
        product_name=order_in.product_name,
        quantity=order_in.quantity,
        unit_price=order_in.unit_price,
        total_value=order_in.total_value,
        order_date=datetime.now(),
        warehouse_id=order_in.warehouse_id,
        delivery_date=order_in.delivery_date,
        user_id=current_user.id,
        notes=order_in.notes
    )

    order = sales_crud.sales_order.create(db, obj_in=order_create)
    return SalesOrderInDB.model_validate(order)


@router.put("/orders/{order_id}", response_model=SalesOrderInDB)
def update_sales_order(
    order_id: int,
    order_in: SalesOrderUpdate,
    db: Session = Depends(get_db),
) -> SalesOrderInDB:
    db_obj = sales_crud.sales_order.get(db, order_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Order not found")
    order = sales_crud.sales_order.update(db, db_obj=db_obj, obj_in=order_in)
    return SalesOrderInDB.model_validate(order)
