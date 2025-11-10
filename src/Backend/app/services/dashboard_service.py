"""
Dashboard 服务

该模块提供仪表板数据聚合的业务逻辑。
"""

from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, case, desc
from datetime import datetime, timedelta

from app.models.product import Product
from app.models.inventory import Inventory, Warehouse
from app.models.sales import SalesOrder
from app.models.activity_log import ActivityLog
from app.schemas.dashboard import (
    DashboardStats,
    StockStatus,
    ActivityLogResponse,
    InventoryAlert,
    TopProduct,
    WarehouseUtilization,
    OrderStatusDistribution,
    DashboardResponse,
)


class DashboardService:
    """仪表板服务类"""

    @staticmethod
    def get_dashboard_stats(db: Session) -> DashboardStats:
        """
        获取仪表板统计数据

        Args:
            db: 数据库会话

        Returns:
            DashboardStats: 统计数据
        """
        # 产品总数
        total_products = db.query(Product).filter(Product.is_active == True).count()

        # 库存总量
        total_inventory = db.query(func.sum(Inventory.quantity)).scalar() or 0

        # 低库存商品数（库存低于最低库存水平）
        low_stock_items = (
            db.query(Inventory)
            .join(Product)
            .filter(
                Inventory.quantity <= Product.min_stock_level,
                Inventory.quantity > 0,
            )
            .count()
        )

        # 缺货商品数
        out_of_stock = db.query(Inventory).filter(Inventory.quantity == 0).count()

        # 仓库总数
        total_warehouses = db.query(Warehouse).filter(Warehouse.is_active == True).count()

        # 待处理订单数
        pending_orders = (
            db.query(SalesOrder)
            .filter(SalesOrder.status.in_(["pending", "processing"]))
            .count()
        )

        # 库存总价值（库存数量 × 产品价格）
        inventory_value = (
            db.query(func.sum(Inventory.quantity * Product.price))
            .join(Product)
            .scalar()
            or 0.0
        )

        return DashboardStats(
            total_products=total_products,
            total_inventory=total_inventory,
            low_stock_items=low_stock_items,
            out_of_stock=out_of_stock,
            total_warehouses=total_warehouses,
            pending_orders=pending_orders,
            total_inventory_value=round(inventory_value, 2),
        )

    @staticmethod
    def get_stock_status(db: Session) -> List[StockStatus]:
        """
        获取库存状态分布

        Args:
            db: 数据库会话

        Returns:
            List[StockStatus]: 库存状态列表
        """
        total_products = db.query(Inventory).count()
        if total_products == 0:
            return []

        # 正常库存
        normal_stock = (
            db.query(Inventory)
            .join(Product)
            .filter(Inventory.quantity > Product.min_stock_level)
            .count()
        )

        # 低库存
        low_stock = (
            db.query(Inventory)
            .join(Product)
            .filter(
                Inventory.quantity <= Product.min_stock_level,
                Inventory.quantity > 0,
            )
            .count()
        )

        # 缺货
        out_of_stock = db.query(Inventory).filter(Inventory.quantity == 0).count()

        return [
            StockStatus(
                status="正常",
                count=normal_stock,
                percentage=round((normal_stock / total_products) * 100, 2),
            ),
            StockStatus(
                status="低库存",
                count=low_stock,
                percentage=round((low_stock / total_products) * 100, 2),
            ),
            StockStatus(
                status="缺货",
                count=out_of_stock,
                percentage=round((out_of_stock / total_products) * 100, 2),
            ),
        ]

    @staticmethod
    def get_recent_activities(db: Session, limit: int = 10) -> List[ActivityLogResponse]:
        """
        获取最近活动记录

        Args:
            db: 数据库会话
            limit: 返回记录数量限制

        Returns:
            List[ActivityLogResponse]: 活动记录列表
        """
        activities = (
            db.query(ActivityLog)
            .order_by(desc(ActivityLog.created_at))
            .limit(limit)
            .all()
        )

        return [ActivityLogResponse.from_orm(activity) for activity in activities]

    @staticmethod
    def get_inventory_alerts(db: Session, limit: int = 20) -> List[InventoryAlert]:
        """
        获取库存警报

        Args:
            db: 数据库会话
            limit: 返回记录数量限制

        Returns:
            List[InventoryAlert]: 库存警报列表
        """
        alerts = []

        # 查询低库存和缺货商品
        low_stock_items = (
            db.query(Inventory, Product, Warehouse)
            .join(Product, Inventory.product_id == Product.id)
            .join(Warehouse, Inventory.warehouse_id == Warehouse.id)
            .filter(Inventory.quantity <= Product.min_stock_level)
            .order_by(Inventory.quantity)
            .limit(limit)
            .all()
        )

        for inventory, product, warehouse in low_stock_items:
            alert_type = "out_of_stock" if inventory.quantity == 0 else "low_stock"
            severity = "critical" if inventory.quantity == 0 else "warning"

            alerts.append(
                InventoryAlert(
                    id=inventory.id,
                    product_id=product.id,
                    product_name=product.name,
                    product_sku=product.sku,
                    warehouse_name=warehouse.name,
                    current_quantity=inventory.quantity,
                    min_stock_level=product.min_stock_level,
                    alert_type=alert_type,
                    severity=severity,
                )
            )

        return alerts

    @staticmethod
    def get_top_products(db: Session, limit: int = 5, days: int = 30) -> List[TopProduct]:
        """
        获取热门产品（按销量）

        Args:
            db: 数据库会话
            limit: 返回记录数量限制
            days: 统计天数

        Returns:
            List[TopProduct]: 热门产品列表
        """
        start_date = datetime.now() - timedelta(days=days)

        top_products = (
            db.query(
                SalesOrder.product_id,
                SalesOrder.product_name,
                Product.sku,
                func.sum(SalesOrder.quantity).label("total_sold"),
                func.sum(SalesOrder.total_value).label("total_revenue"),
            )
            .join(Product, SalesOrder.product_id == Product.id)
            .filter(SalesOrder.order_date >= start_date)
            .filter(SalesOrder.status != "cancelled")
            .group_by(SalesOrder.product_id, SalesOrder.product_name, Product.sku)
            .order_by(desc("total_sold"))
            .limit(limit)
            .all()
        )

        return [
            TopProduct(
                product_id=p.product_id,
                product_name=p.product_name,
                sku=p.sku,
                total_sold=p.total_sold,
                total_revenue=round(p.total_revenue, 2),
            )
            for p in top_products
        ]

    @staticmethod
    def get_warehouse_utilization(db: Session) -> List[WarehouseUtilization]:
        """
        获取仓库利用率

        Args:
            db: 数据库会话

        Returns:
            List[WarehouseUtilization]: 仓库利用率列表
        """
        warehouses = db.query(Warehouse).filter(Warehouse.is_active == True).all()  # type: ignore[arg-type]

        utilization_list = []
        for warehouse in warehouses:
            # 获取实际值并进行类型转换
            capacity = float(warehouse.capacity) if warehouse.capacity else 0.0
            current_usage = float(warehouse.current_usage) if warehouse.current_usage else 0.0

            if capacity > 0:
                utilization_rate = round((current_usage / capacity) * 100, 2)
            else:
                utilization_rate = 0.0

            utilization_list.append(
                WarehouseUtilization(
                    warehouse_id=int(warehouse.id),
                    warehouse_name=str(warehouse.name),
                    warehouse_code=str(warehouse.code) if warehouse.code else f"WH{warehouse.id:03d}",
                    capacity=capacity,
                    current_usage=current_usage,
                    utilization_rate=float(utilization_rate),
                )
            )

        return utilization_list

    @staticmethod
    def get_order_status_distribution(db: Session) -> List[OrderStatusDistribution]:
        """
        获取订单状态分布

        Args:
            db: 数据库会话

        Returns:
            List[OrderStatusDistribution]: 订单状态分布列表
        """
        order_stats = (
            db.query(
                SalesOrder.status,
                func.count(SalesOrder.id).label("count"),
                func.sum(SalesOrder.total_value).label("total_value"),
            )
            .group_by(SalesOrder.status)
            .all()
        )

        return [
            OrderStatusDistribution(
                status=str(stat.status),
                count=int(stat.count),  # type: ignore[arg-type]
                total_value=round(float(stat.total_value or 0.0), 2),
            )
            for stat in order_stats
        ]

    @staticmethod
    def get_full_dashboard(db: Session) -> DashboardResponse:
        """
        获取完整的仪表板数据

        Args:
            db: 数据库会话

        Returns:
            DashboardResponse: 完整仪表板数据
        """
        return DashboardResponse(
            stats=DashboardService.get_dashboard_stats(db),
            stock_status=DashboardService.get_stock_status(db),
            recent_activities=DashboardService.get_recent_activities(db),
            inventory_alerts=DashboardService.get_inventory_alerts(db),
            top_products=DashboardService.get_top_products(db),
            warehouse_utilization=DashboardService.get_warehouse_utilization(db),
            order_status_distribution=DashboardService.get_order_status_distribution(db),
        )
