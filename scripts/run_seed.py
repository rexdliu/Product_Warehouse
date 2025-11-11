#!/usr/bin/env python3
"""
执行数据库种子文件脚本
"""
import pymysql
import sys
from pathlib import Path

# 数据库连接配置
DB_CONFIG = {
    'host': 'rm-cn-nwy3uyzdy0008j5o.rwlb.rds.aliyuncs.com',
    'user': 'rex',
    'password': 'Liudx_2017',
    'database': 'warehouse_test_data',
    'charset': 'utf8mb4'
}

def run_sql_file(sql_file_path: str):
    """执行SQL文件"""
    print(f"连接到数据库 {DB_CONFIG['database']}...")

    try:
        # 建立数据库连接
        connection = pymysql.connect(**DB_CONFIG)
        cursor = connection.cursor()

        # 读取SQL文件
        print(f"读取SQL文件: {sql_file_path}")
        with open(sql_file_path, 'r', encoding='utf-8') as f:
            sql_content = f.read()

        # 分割SQL语句（按分号分割）
        sql_statements = [stmt.strip() for stmt in sql_content.split(';') if stmt.strip()]

        print(f"找到 {len(sql_statements)} 条SQL语句")
        print("开始执行SQL语句...")

        # 执行每条SQL语句
        for i, statement in enumerate(sql_statements, 1):
            if statement.strip():
                try:
                    cursor.execute(statement)
                    print(f"✓ 执行第 {i}/{len(sql_statements)} 条语句")
                except Exception as e:
                    print(f"✗ 执行第 {i} 条语句失败: {e}")
                    print(f"  语句: {statement[:100]}...")

        # 提交事务
        connection.commit()
        print("\n✓ 所有SQL语句执行完成，事务已提交")

        # 验证数据
        print("\n验证数据...")
        cursor.execute("SELECT COUNT(*) FROM inventories")
        inventory_count = cursor.fetchone()[0]
        print(f"✓ inventories 表记录数: {inventory_count}")

        cursor.execute("SELECT COUNT(*) FROM products")
        product_count = cursor.fetchone()[0]
        print(f"✓ products 表记录数: {product_count}")

        cursor.execute("SELECT COUNT(*) FROM users")
        user_count = cursor.fetchone()[0]
        print(f"✓ users 表记录数: {user_count}")

        cursor.execute("SELECT SUM(quantity) FROM inventories")
        total_quantity = cursor.fetchone()[0]
        print(f"✓ 库存总数量: {total_quantity}")

        # 关闭连接
        cursor.close()
        connection.close()
        print("\n✓ 数据库种子文件执行成功！")

    except Exception as e:
        print(f"\n✗ 错误: {e}")
        sys.exit(1)

if __name__ == "__main__":
    # SQL文件路径
    sql_file = Path(__file__).parent.parent / "database" / "seed_test_data_fixed.sql"

    if not sql_file.exists():
        print(f"✗ SQL文件不存在: {sql_file}")
        sys.exit(1)

    run_sql_file(str(sql_file))
