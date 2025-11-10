"""
种子数据生成脚本

该脚本用于生成测试数据，填充开发数据库。
运行方式: python -m scripts.seed_data
"""

import sys
import os
from datetime import datetime, timedelta
import random

# 添加父目录到 Python 路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.user import User
from app.models.product import Product, ProductCategory
from app.models.inventory import Warehouse, Inventory, InventoryTransaction
from app.models.sales import Distributor, SalesOrder
from app.models.activity_log import ActivityLog


def create_users(db: Session):
    """创建测试用户"""
    print("创建用户...")

    users_data = [
        {
            "username": "admin",
            "email": "admin@warehouse.com",
            "phone": "13800138000",
            "full_name": "系统管理员",
            "password": "admin123",
            "role": "admin",
            "is_superuser": True,
        },
        {
            "username": "manager",
            "email": "manager@warehouse.com",
            "phone": "13800138001",
            "full_name": "仓库经理",
            "password": "manager123",
            "role": "manager",
            "is_superuser": False,
        },
        {
            "username": "staff",
            "email": "staff@warehouse.com",
            "phone": "13800138002",
            "full_name": "仓库员工",
            "password": "staff123",
            "role": "staff",
            "is_superuser": False,
        },
    ]

    users = []
    for user_data in users_data:
        password = user_data.pop("password")
        user = User(**user_data, hashed_password=get_password_hash(password))
        db.add(user)
        users.append(user)

    db.commit()
    print(f"创建了 {len(users)} 个用户")
    return users


def create_product_categories(db: Session):
    """创建产品分类"""
    print("创建产品分类...")

    categories_data = [
        {"name": "发动机", "code": "ENGINE", "description": "Cummins 发动机整机"},
        {"name": "零配件", "code": "PARTS", "description": "发动机零配件"},
        {"name": "机油", "code": "OIL", "description": "润滑油和机油"},
        {"name": "滤芯", "code": "FILTER", "description": "各类滤芯"},
        {"name": "传感器", "code": "SENSOR", "description": "各类传感器"},
    ]

    categories = []
    for cat_data in categories_data:
        category = ProductCategory(**cat_data)
        db.add(category)
        categories.append(category)

    db.commit()
    print(f"创建了 {len(categories)} 个产品分类")
    return categories


def create_products(db: Session, categories):
    """创建产品"""
    print("创建产品...")

    engine_models = ["6BT5.9", "ISF2.8", "ISF3.8", "ISBe", "ISLe", "QSB6.7"]

    products_data = [
        # 发动机
        {
            "name": "Cummins 6BT5.9 发动机总成",
            "sku": "ENG-6BT59-001",
            "part_number": "6BT5.9-C120",
            "engine_model": "6BT5.9",
            "description": "Cummins 6BT5.9 柴油发动机总成，120马力",
            "price": 45000.00,
            "cost": 38000.00,
            "category_id": categories[0].id,
            "unit": "台",
            "min_stock_level": 5,
        },
        {
            "name": "Cummins ISF2.8 发动机总成",
            "sku": "ENG-ISF28-001",
            "part_number": "ISF2.8-C107",
            "engine_model": "ISF2.8",
            "description": "Cummins ISF2.8 柴油发动机总成，107马力",
            "price": 38000.00,
            "cost": 32000.00,
            "category_id": categories[0].id,
            "unit": "台",
            "min_stock_level": 5,
        },
        # 零配件
        {
            "name": "喷油器总成",
            "sku": "PART-INJ-001",
            "part_number": "4937065",
            "engine_model": "6BT5.9",
            "description": "6BT5.9 喷油器总成",
            "price": 1200.00,
            "cost": 950.00,
            "category_id": categories[1].id,
            "unit": "件",
            "min_stock_level": 20,
        },
        {
            "name": "活塞组件",
            "sku": "PART-PIS-001",
            "part_number": "3802657",
            "engine_model": "ISF2.8",
            "description": "ISF2.8 活塞组件（含活塞环）",
            "price": 580.00,
            "cost": 450.00,
            "category_id": categories[1].id,
            "unit": "套",
            "min_stock_level": 15,
        },
        {
            "name": "涡轮增压器",
            "sku": "PART-TUR-001",
            "part_number": "4955152",
            "engine_model": "6BT5.9",
            "description": "6BT5.9 涡轮增压器",
            "price": 3500.00,
            "cost": 2800.00,
            "category_id": categories[1].id,
            "unit": "件",
            "min_stock_level": 10,
        },
        # 机油
        {
            "name": "Cummins 专用机油 15W-40",
            "sku": "OIL-15W40-001",
            "part_number": "CES20081",
            "engine_model": "通用",
            "description": "Cummins 认证柴油机机油 15W-40",
            "price": 280.00,
            "cost": 220.00,
            "category_id": categories[2].id,
            "unit": "桶",
            "min_stock_level": 50,
        },
        {
            "name": "Cummins 专用机油 10W-30",
            "sku": "OIL-10W30-001",
            "part_number": "CES20086",
            "engine_model": "通用",
            "description": "Cummins 认证柴油机机油 10W-30",
            "price": 300.00,
            "cost": 240.00,
            "category_id": categories[2].id,
            "unit": "桶",
            "min_stock_level": 40,
        },
        # 滤芯
        {
            "name": "机油滤清器",
            "sku": "FIL-OIL-001",
            "part_number": "LF9009",
            "engine_model": "6BT5.9",
            "description": "6BT5.9 机油滤清器",
            "price": 85.00,
            "cost": 60.00,
            "category_id": categories[3].id,
            "unit": "件",
            "min_stock_level": 100,
        },
        {
            "name": "燃油滤清器",
            "sku": "FIL-FUEL-001",
            "part_number": "FF5320",
            "engine_model": "ISF2.8",
            "description": "ISF2.8 燃油滤清器",
            "price": 95.00,
            "cost": 70.00,
            "category_id": categories[3].id,
            "unit": "件",
            "min_stock_level": 100,
        },
        {
            "name": "空气滤清器",
            "sku": "FIL-AIR-001",
            "part_number": "AF25558",
            "engine_model": "通用",
            "description": "空气滤清器外滤芯",
            "price": 120.00,
            "cost": 90.00,
            "category_id": categories[3].id,
            "unit": "件",
            "min_stock_level": 80,
        },
        # 传感器
        {
            "name": "水温传感器",
            "sku": "SEN-TEMP-001",
            "part_number": "4921477",
            "engine_model": "6BT5.9",
            "description": "6BT5.9 水温传感器",
            "price": 150.00,
            "cost": 110.00,
            "category_id": categories[4].id,
            "unit": "件",
            "min_stock_level": 30,
        },
        {
            "name": "机油压力传感器",
            "sku": "SEN-PRES-001",
            "part_number": "4921322",
            "engine_model": "ISF2.8",
            "description": "ISF2.8 机油压力传感器",
            "price": 180.00,
            "cost": 140.00,
            "category_id": categories[4].id,
            "unit": "件",
            "min_stock_level": 30,
        },
    ]

    products = []
    for prod_data in products_data:
        product = Product(**prod_data)
        db.add(product)
        products.append(product)

    db.commit()
    print(f"创建了 {len(products)} 个产品")
    return products


def create_warehouses(db: Session):
    """创建仓库"""
    print("创建仓库...")

    warehouses_data = [
        {
            "name": "成都主仓库",
            "code": "WH001",
            "location": "四川省成都市新都区",
            "capacity": 5000.0,
            "current_usage": 2800.0,
            "manager_name": "张三",
            "phone": "13900000001",
        },
        {
            "name": "重庆分仓库",
            "code": "WH002",
            "location": "重庆市北碚区",
            "capacity": 3000.0,
            "current_usage": 1500.0,
            "manager_name": "李四",
            "phone": "13900000002",
        },
        {
            "name": "昆明分仓库",
            "code": "WH003",
            "location": "云南省昆明市官渡区",
            "capacity": 2000.0,
            "current_usage": 800.0,
            "manager_name": "王五",
            "phone": "13900000003",
        },
    ]

    warehouses = []
    for wh_data in warehouses_data:
        warehouse = Warehouse(**wh_data)
        db.add(warehouse)
        warehouses.append(warehouse)

    db.commit()
    print(f"创建了 {len(warehouses)} 个仓库")
    return warehouses


def create_inventory(db: Session, products, warehouses):
    """创建库存"""
    print("创建库存...")

    inventories = []
    location_prefixes = ["A", "B", "C", "D"]

    for product in products:
        # 为每个产品在各个仓库创建库存
        for warehouse in warehouses:
            # 根据最低库存水平生成随机库存量
            min_stock = product.min_stock_level
            # 大部分产品有正常库存，少部分低库存或缺货
            stock_type = random.choices(
                ["normal", "low", "out"], weights=[0.7, 0.2, 0.1]
            )[0]

            if stock_type == "normal":
                quantity = random.randint(min_stock + 10, min_stock + 100)
            elif stock_type == "low":
                quantity = random.randint(1, min_stock)
            else:
                quantity = 0

            # 生成货位编号
            prefix = random.choice(location_prefixes)
            location_code = f"{prefix}-{random.randint(1, 20):02d}-{random.randint(1, 50):02d}"

            inventory = Inventory(
                product_id=product.id,
                warehouse_id=warehouse.id,
                quantity=quantity,
                reserved_quantity=random.randint(0, min(quantity, 5)),
                location_code=location_code,
            )
            db.add(inventory)
            inventories.append(inventory)

    db.commit()
    print(f"创建了 {len(inventories)} 条库存记录")
    return inventories


def create_distributors(db: Session):
    """创建经销商"""
    print("创建经销商...")

    distributors_data = [
        {
            "name": "成都康明斯专卖店",
            "code": "DIST001",
            "contact_person": "赵六",
            "phone": "028-88888888",
            "email": "zhao@cdcummins.com",
            "address": "四川省成都市武侯区人民南路123号",
            "region": "四川",
            "credit_limit": 500000.0,
        },
        {
            "name": "重庆康明斯经销商",
            "code": "DIST002",
            "contact_person": "钱七",
            "phone": "023-66666666",
            "email": "qian@cqcummins.com",
            "address": "重庆市渝北区金渝大道456号",
            "region": "重庆",
            "credit_limit": 300000.0,
        },
        {
            "name": "云南康明斯代理",
            "code": "DIST003",
            "contact_person": "孙八",
            "phone": "0871-77777777",
            "email": "sun@yncummins.com",
            "address": "云南省昆明市盘龙区北京路789号",
            "region": "云南",
            "credit_limit": 200000.0,
        },
        {
            "name": "贵州康明斯销售中心",
            "code": "DIST004",
            "contact_person": "周九",
            "phone": "0851-99999999",
            "email": "zhou@gzcummins.com",
            "address": "贵州省贵阳市南明区中华南路321号",
            "region": "贵州",
            "credit_limit": 150000.0,
        },
    ]

    distributors = []
    for dist_data in distributors_data:
        distributor = Distributor(**dist_data)
        db.add(distributor)
        distributors.append(distributor)

    db.commit()
    print(f"创建了 {len(distributors)} 个经销商")
    return distributors


def create_sales_orders(db: Session, products, distributors, warehouses, users):
    """创建销售订单"""
    print("创建销售订单...")

    orders = []
    statuses = ["pending", "processing", "shipped", "completed", "cancelled"]
    status_weights = [0.2, 0.15, 0.1, 0.5, 0.05]

    # 生成过去60天的订单
    for day_offset in range(60):
        # 每天生成 2-5 个订单
        num_orders = random.randint(2, 5)

        for _ in range(num_orders):
            order_date = datetime.now() - timedelta(days=day_offset)
            product = random.choice(products)
            distributor = random.choice(distributors)
            warehouse = random.choice(warehouses)
            user = random.choice([u for u in users if u.role in ["manager", "admin"]])

            quantity = random.randint(1, 20)
            unit_price = product.price * random.uniform(0.95, 1.0)  # 可能有折扣
            total_value = quantity * unit_price

            status = random.choices(statuses, weights=status_weights)[0]

            # 根据订单日期和状态设置交货日期和完成时间
            delivery_date = order_date + timedelta(days=random.randint(7, 15))
            completed_at = None
            if status == "completed":
                completed_at = delivery_date + timedelta(days=random.randint(-2, 3))

            order_code = f"SO{order_date.strftime('%Y%m%d')}{random.randint(1000, 9999)}"

            order = SalesOrder(
                order_code=order_code,
                distributor_id=distributor.id,
                product_id=product.id,
                product_name=product.name,
                quantity=quantity,
                unit_price=unit_price,
                total_value=total_value,
                status=status,
                warehouse_id=warehouse.id,
                delivery_date=delivery_date,
                completed_at=completed_at,
                user_id=user.id,
                order_date=order_date,
                notes=f"订单备注 - {distributor.name}",
            )
            db.add(order)
            orders.append(order)

    db.commit()
    print(f"创建了 {len(orders)} 个销售订单")
    return orders


def create_activity_logs(db: Session, products, users, orders):
    """创建活动日志"""
    print("创建活动日志...")

    activities = []
    activity_types = [
        ("inventory", "入库", "product"),
        ("inventory", "出库", "product"),
        ("order", "创建订单", "order"),
        ("order", "订单完成", "order"),
        ("product", "更新产品", "product"),
        ("alert", "低库存警报", "product"),
    ]

    # 生成过去30天的活动记录
    for day_offset in range(30):
        # 每天生成 5-10 条活动记录
        num_activities = random.randint(5, 10)

        for _ in range(num_activities):
            created_at = datetime.now() - timedelta(
                days=day_offset,
                hours=random.randint(0, 23),
                minutes=random.randint(0, 59),
            )

            activity_type, action, ref_type = random.choice(activity_types)

            if ref_type == "product":
                item = random.choice(products)
                item_name = item.name
                reference_id = item.id
            else:
                item = random.choice(orders)
                item_name = f"订单 {item.order_code}"
                reference_id = item.id

            user = random.choice(users)

            activity = ActivityLog(
                activity_type=activity_type,
                action=action,
                item_name=item_name,
                user_id=user.id,
                reference_id=reference_id,
                reference_type=ref_type,
                created_at=created_at,
            )
            db.add(activity)
            activities.append(activity)

    db.commit()
    print(f"创建了 {len(activities)} 条活动日志")
    return activities


def create_inventory_transactions(db: Session, products, warehouses, users):
    """创建库存交易记录"""
    print("创建库存交易记录...")

    transactions = []
    transaction_types = ["IN", "OUT", "ADJUST", "TRANSFER"]

    # 生成过去30天的交易记录
    for day_offset in range(30):
        # 每天生成 3-8 条交易记录
        num_transactions = random.randint(3, 8)

        for _ in range(num_transactions):
            created_at = datetime.now() - timedelta(
                days=day_offset,
                hours=random.randint(0, 23),
                minutes=random.randint(0, 59),
            )

            trans_type = random.choice(transaction_types)
            product = random.choice(products)
            warehouse = random.choice(warehouses)
            user = random.choice(users)

            if trans_type in ["IN", "ADJUST"]:
                quantity = random.randint(10, 100)
            else:
                quantity = -random.randint(5, 50)

            reference = f"REF-{created_at.strftime('%Y%m%d')}-{random.randint(1000, 9999)}"

            transaction = InventoryTransaction(
                product_id=product.id,
                warehouse_id=warehouse.id,
                transaction_type=trans_type,
                quantity=quantity,
                user_id=user.id,
                reference=reference,
                notes=f"{trans_type} 操作 - {product.name}",
                created_at=created_at,
            )
            db.add(transaction)
            transactions.append(transaction)

    db.commit()
    print(f"创建了 {len(transactions)} 条库存交易记录")
    return transactions


def main():
    """主函数"""
    print("=" * 50)
    print("开始生成种子数据...")
    print("=" * 50)

    # 创建数据库表（如果不存在）
    Base.metadata.create_all(bind=engine)

    # 创建数据库会话
    db = SessionLocal()

    try:
        # 按顺序创建数据
        users = create_users(db)
        categories = create_product_categories(db)
        products = create_products(db, categories)
        warehouses = create_warehouses(db)
        inventories = create_inventory(db, products, warehouses)
        distributors = create_distributors(db)
        orders = create_sales_orders(db, products, distributors, warehouses, users)
        activities = create_activity_logs(db, products, users, orders)
        transactions = create_inventory_transactions(db, products, warehouses, users)

        print("=" * 50)
        print("种子数据生成完成！")
        print("=" * 50)
        print(f"总计创建:")
        print(f"  - {len(users)} 个用户")
        print(f"  - {len(categories)} 个产品分类")
        print(f"  - {len(products)} 个产品")
        print(f"  - {len(warehouses)} 个仓库")
        print(f"  - {len(inventories)} 条库存记录")
        print(f"  - {len(distributors)} 个经销商")
        print(f"  - {len(orders)} 个销售订单")
        print(f"  - {len(activities)} 条活动日志")
        print(f"  - {len(transactions)} 条库存交易记录")
        print("=" * 50)
        print("\n测试账号:")
        print("  管理员: admin / admin123")
        print("  经理: manager / manager123")
        print("  员工: staff / staff123")
        print("=" * 50)

    except Exception as e:
        print(f"错误: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
