#!/usr/bin/env python3
"""
测试阿里云RDS MySQL数据库连接
"""

import sys
import os

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# 修复导入路径
import src.Backend.app.core.config
import src.Backend.app.core.database
from src.Backend.app.core.config import settings
from src.Backend.app.core.database import engine, SessionLocal
from sqlalchemy import text

def test_database_connection():
    print("测试阿里云RDS MySQL数据库连接...")
    print(f"数据库URL: {settings.SQLALCHEMY_DATABASE_URL}")
    
    try:
        # 测试数据库引擎连接
        with engine.connect() as connection:
            result = connection.execute(text("SELECT VERSION()"))
            version = result.fetchone()
            print(f"MySQL版本: {version[0]}")
            
            result = connection.execute(text("SELECT DATABASE()"))
            database = result.fetchone()
            print(f"当前数据库: {database[0]}")
            
        print("✅ 数据库引擎连接成功!")
        
        # 测试会话创建
        session = SessionLocal()
        result = session.execute(text("SHOW TABLES"))
        tables = result.fetchall()
        print(f"现有数据表: {[table[0] for table in tables]}")
        session.close()
        print("✅ 数据库会话测试成功!")
        
        return True
        
    except Exception as e:
        print(f"❌ 数据库连接失败: {e}")
        return False

if __name__ == "__main__":
    print("=== 阿里云RDS MySQL数据库连接测试 ===")
    success = test_database_connection()
    if success:
        print("\n🎉 所有测试通过，数据库连接配置正确!")
    else:
        print("\n💥 数据库连接存在问题，请检查配置!")
    print("=== 测试完成 ===")