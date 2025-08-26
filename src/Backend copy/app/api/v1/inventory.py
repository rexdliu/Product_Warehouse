from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.crud import inventory as inventory_crud
from app.schemas.inventory import (
    WarehouseCreate, WarehouseUpdate, WarehouseInDB,
    InventoryCreate, InventoryUpdate, InventoryInDB
)

router = APIRouter()

# 仓库相关API
@router.get("/warehouses", response_model=List[WarehouseInDB])
def read_warehouses(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
) -> Any:
    """获取仓库列表"""
    warehouses = inventory_crud.get_warehouses(db, skip=skip, limit=limit)
    return warehouses

@router.post("/warehouses", response_model=WarehouseInDB)
def create_warehouse(
    *,
    db: Session = Depends(get_db),
    warehouse_in: WarehouseCreate
) -> Any:
    """创建仓库"""
    warehouse = inventory_crud.create_warehouse(db, warehouse_in=warehouse_in)
    return warehouse

# 库存相关API
@router.get("/items", response_model=List[InventoryInDB])
def read_inventory_items(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
) -> Any:
    """获取库存项目列表"""
    items = inventory_crud.get_inventory_items(db, skip=skip, limit=limit)
    return items

@router.get("/items/{id}", response_model=InventoryInDB)
def read_inventory_item(
    *,
    db: Session = Depends(get_db),
    id: int
) -> Any:
    """获取特定库存项目"""
    item = inventory_crud.get_inventory_item(db, id=id)
    if not item:
        raise HTTPException(
            status_code=404,
            detail="Inventory item not found"
        )
    return item

@router.put("/items/{id}", response_model=InventoryInDB)
def update_inventory_item(
    *,
    db: Session = Depends(get_db),
    id: int,
    item_in: InventoryUpdate
) -> Any:
    """更新库存项目"""
    item = inventory_crud.get_inventory_item(db, id=id)
    if not item:
        raise HTTPException(
            status_code=404,
            detail="Inventory item not found"
        )
    item = inventory_crud.update_inventory_item(db, db_obj=item, obj_in=item_in)
    return item