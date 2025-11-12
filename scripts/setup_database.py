#!/usr/bin/env python3
"""
完整的数据库设置脚本
1. 创建表结构（如果不存在）
2. 注入测试数据
"""
import pymysql
import sys
from pathlib import Path
from typing import Any

# 数据库连接配置
DB_CONFIG: dict[str, Any] = {
    'host': 'rm-cn-nwy3uyzdy0008j5o.rwlb.rds.aliyuncs.com',
    'user': 'rex',
    'password': 'Liudx_2017',
    'database': 'warehouse_test_data',
    'charset': 'utf8mb4'
}

def execute_sql_file(cursor, sql_file_path: str, file_description: str):
    """执行SQL文件"""
    print(f"\n{'='*60}")
    print(f"执行 {file_description}")
    print(f"文件: {sql_file_path}")
    print(f"{'='*60}\n")

    with open(sql_file_path, 'r', encoding='utf-8') as f:
        sql_content = f.read()

    # 分割SQL语句
    sql_statements = [stmt.strip() for stmt in sql_content.split(';') if stmt.strip()]

    print(f"找到 {len(sql_statements)} 条SQL语句")

    success_count = 0
    error_count = 0

    for i, statement in enumerate(sql_statements, 1):
        if statement.strip():
            try:
                # 跳过SELECT查询（验证查询）
                if statement.strip().upper().startswith('SELECT'):
                    print(f"⊙ 跳过第 {i} 条语句（验证查询）")
                    continue

                cursor.execute(statement)
                success_count += 1

                # 只显示重要操作
                stmt_upper = statement.upper()
                if 'CREATE TABLE' in stmt_upper:
                    table_name = statement.split('TABLE')[1].split('(')[0].strip().replace('IF NOT EXISTS', '').strip()
                    print(f"✓ 创建表: {table_name}")
                elif 'INSERT INTO' in stmt_upper:
                    table_name = statement.split('INTO')[1].split('(')[0].strip()
                    # 只打印每个表的第一条插入
                    if i == 1 or 'INSERT INTO' not in sql_statements[i-2].upper() or table_name not in sql_statements[i-2]:
                        print(f"✓ 插入数据到: {table_name}")
                elif 'TRUNCATE' in stmt_upper:
                    table_name = statement.split('TABLE')[1].strip()
                    print(f"✓ 清空表: {table_name}")
                else:
                    print(f"✓ 执行第 {i} 条语句")

            except Exception as e:
                error_count += 1
                print(f"✗ 第 {i} 条语句失败: {e}")
                # 只显示语句的前100个字符
                print(f"  语句: {statement[:100]}...")

    print(f"\n{'='*60}")
    print(f"执行完成: 成功 {success_count} 条, 失败 {error_count} 条")
    print(f"{'='*60}\n")

    return success_count, error_count

def verify_data(cursor):
    """验证数据"""
    print("\n" + "="*60)
    print("验证数据库数据")
    print("="*60 + "\n")

    tables = [
        ('users', '用户'),
        ('product_categories', '产品分类'),
        ('products', '产品'),
        ('warehouses', '仓库'),
        ('inventories', '库存'),
        ('distributors', '经销商'),
        ('sales_orders', '销售订单'),
        ('inventory_transactions', '库存交易'),
        ('activity_logs', '活动日志')
    ]

    for table_name, display_name in tables:
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
            count = cursor.fetchone()[0]
            print(f"✓ {display_name:12s}: {count:4d} 条记录")
        except Exception as e:
            print(f"✗ {display_name:12s}: 查询失败 - {e}")

    # 验证库存总量
    print("\n" + "-"*60)
    try:
        cursor.execute("""
            SELECT
                SUM(quantity) as total_qty,
                SUM(quantity * p.price) as total_value
            FROM inventories i
            JOIN products p ON i.product_id = p.id
        """)
        result = cursor.fetchone()
        if result:
            total_qty, total_value = result
            print(f"✓ 库存总数量: {total_qty}")
            print(f"✓ 库存总价值: ¥{total_value:,.2f}")
    except Exception as e:
        print(f"✗ 库存统计查询失败: {e}")

    # 验证低库存商品
    try:
        cursor.execute("""
            SELECT COUNT(*) as low_stock_count
            FROM inventories i
            JOIN products p ON i.product_id = p.id
            WHERE i.quantity <= p.min_stock_level AND i.quantity > 0
        """)
        low_stock_count = cursor.fetchone()[0]
        print(f"✓ 低库存商品数: {low_stock_count}")
    except Exception as e:
        print(f"✗ 低库存查询失败: {e}")

    print("\n" + "="*60 + "\n")

def main():
    print("\n" + "="*60)
    print("Cummins 仓库管理系统 - 数据库初始化")
    print("="*60 + "\n")

    # 文件路径
    project_root = Path(__file__).parent.parent
    schema_file = project_root / "database" / "schema.sql"
    seed_file = project_root / "database" / "seed_test_data_fixed.sql"

    # 检查文件是否存在
    if not schema_file.exists():
        print(f"✗ 错误: schema 文件不存在: {schema_file}")
        sys.exit(1)

    if not seed_file.exists():
        print(f"✗ 错误: seed 文件不存在: {seed_file}")
        sys.exit(1)

    try:
        # 连接数据库
        print(f"连接到数据库: {DB_CONFIG['database']}@{DB_CONFIG['host']}")
        connection = pymysql.connect(**DB_CONFIG)
        cursor = connection.cursor()
        print("✓ 数据库连接成功\n")

        # 1. 执行建表语句
        schema_success, schema_error = execute_sql_file(
            cursor,
            str(schema_file),
            "建表语句 (schema.sql)"
        )
        connection.commit()

        # 2. 执行种子数据
        seed_success, seed_error = execute_sql_file(
            cursor,
            str(seed_file),
            "测试数据 (seed_test_data_fixed.sql)"
        )
        connection.commit()

        # 3. 验证数据
        verify_data(cursor)

        # 关闭连接
        cursor.close()
        connection.close()

        print("\n" + "="*60)
        print("✓ 数据库初始化完成！")
        print("="*60 + "\n")

        print("你现在可以:")
        print("  1. 使用 admin/admin123 登录系统")
        print("  2. 使用 manager/manager123 登录（仓库管理员权限）")
        print("  3. 使用 staff/staff123 登录（只读权限）")
        print("  4. 使用 rextest/admin123 登录（测试账号）\n")

        if schema_error > 0 or seed_error > 0:
            print(f"⚠ 警告: 有 {schema_error + seed_error} 条语句执行失败")
            print("   请检查错误信息\n")
            sys.exit(1)

    except Exception as e:
        print(f"\n✗ 错误: {e}\n")
        sys.exit(1)

if __name__ == "__main__":
    main()
