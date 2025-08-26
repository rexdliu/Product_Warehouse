"""
库存 CRUD 操作

该模块定义了库存和仓库相关的 CRUD 操作。
主要功能：
1. 库存项目的创建、获取、更新、删除
2. 仓库的创建、获取、更新、删除
"""

from typing import List
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.inventory import Inventory, Warehouse
from app.schemas.inventory import InventoryCreate, InventoryUpdate, WarehouseCreate, WarehouseUpdate

class CRUDInventory(CRUDBase[Inventory, InventoryCreate, InventoryUpdate]):
    """库存 CRUD 操作类"""
    
    def get_by_product_and_warehouse(self, db: Session, *, product_id: int, warehouse_id: int) -> Inventory:
        """
        根据产品ID和仓库ID获取库存项目
        
        Args:
            db: 数据库会话
            product_id: 产品ID
            warehouse_id: 仓库ID
            
        Returns:
            Inventory: 库存项目对象
        """
        return db.query(Inventory).filter(
            Inventory.product_id == product_id,
            Inventory.warehouse_id == warehouse_id
        ).first()

class CRUDWarehouse(CRUDBase[Warehouse, WarehouseCreate, WarehouseUpdate]):
    """仓库 CRUD 操作类"""
    pass

# 创建库存 CRUD 实例
inventory = CRUDInventory(Inventory)

# 创建仓库 CRUD 实例
warehouse = CRUDWarehouse(Warehouse)