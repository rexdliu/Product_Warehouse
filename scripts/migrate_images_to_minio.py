"""
图片迁移脚本：从本地文件系统迁移到 MinIO

该脚本会：
1. 扫描本地 static/avatars 和 static/products 目录
2. 上传所有图片到 MinIO
3. 更新数据库中的 URL
4. 可选：删除本地文件
"""

import sys
import os
from pathlib import Path

# 添加项目根目录到 Python 路径
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root / "src" / "Backend"))

import asyncio
from app.core.database import SessionLocal
from app.models.user import User
from app.models.product import Product
from app.core.storage import MinIOStorageBackend
from app.core.config import settings


async def migrate_avatars(storage: MinIOStorageBackend, db, dry_run: bool = True):
    """迁移用户头像"""
    print("\n========== 迁移用户头像 ==========")

    # 本地头像目录
    avatars_dir = project_root / "src" / "Backend" / "app" / "static" / "avatars"
    if not avatars_dir.exists():
        print(f"头像目录不存在: {avatars_dir}")
        return

    # 获取所有有头像的用户
    users = db.query(User).filter(User.avatar_url.isnot(None)).all()
    print(f"找到 {len(users)} 个用户有头像")

    migrated_count = 0
    for user in users:
        avatar_url = str(user.avatar_url)

        # 跳过默认头像
        if "default" in avatar_url:
            continue

        # 提取文件名
        if avatar_url.startswith("/static/avatars/"):
            filename = avatar_url.split("/")[-1]
            filepath = avatars_dir / filename

            if not filepath.exists():
                print(f"⚠️  文件不存在: {filepath}")
                continue

            print(f"正在迁移: {filename} (用户 ID: {user.id})")

            if not dry_run:
                try:
                    # 读取文件
                    with open(filepath, "rb") as f:
                        # 上传到 MinIO
                        new_url = await storage.upload(
                            file=f,
                            filename=filename,
                            content_type="image/jpeg",
                            folder="avatars"
                        )

                    # 更新数据库
                    user.avatar_url = new_url  # type: ignore
                    db.add(user)

                    migrated_count += 1
                    print(f"✓ 已迁移: {filename} -> {new_url}")

                except Exception as e:
                    print(f"✗ 迁移失败: {filename} - {str(e)}")

    if not dry_run:
        db.commit()
        print(f"\n成功迁移 {migrated_count} 个头像")
    else:
        print(f"\n[演练模式] 将迁移 {migrated_count} 个头像")


async def migrate_product_images(storage: MinIOStorageBackend, db, dry_run: bool = True):
    """迁移产品图片"""
    print("\n========== 迁移产品图片 ==========")

    # 本地产品图片目录
    products_dir = project_root / "src" / "Backend" / "app" / "static" / "products"
    if not products_dir.exists():
        print(f"产品图片目录不存在: {products_dir}")
        return

    # 获取所有有图片的产品
    products = db.query(Product).filter(Product.image_url.isnot(None)).all()
    print(f"找到 {len(products)} 个产品有图片")

    migrated_count = 0
    for product in products:
        image_url = str(product.image_url)

        # 提取文件名
        if image_url.startswith("/static/products/"):
            filename = image_url.split("/")[-1]
            filepath = products_dir / filename

            if not filepath.exists():
                print(f"⚠️  文件不存在: {filepath}")
                continue

            print(f"正在迁移: {filename} (产品 ID: {product.id})")

            if not dry_run:
                try:
                    # 读取文件
                    with open(filepath, "rb") as f:
                        # 上传到 MinIO
                        new_url = await storage.upload(
                            file=f,
                            filename=filename,
                            content_type="image/jpeg",
                            folder="products"
                        )

                    # 更新数据库
                    product.image_url = new_url  # type: ignore
                    db.add(product)

                    migrated_count += 1
                    print(f"✓ 已迁移: {filename} -> {new_url}")

                except Exception as e:
                    print(f"✗ 迁移失败: {filename} - {str(e)}")

    if not dry_run:
        db.commit()
        print(f"\n成功迁移 {migrated_count} 个产品图片")
    else:
        print(f"\n[演练模式] 将迁移 {migrated_count} 个产品图片")


async def main():
    """主函数"""
    import argparse

    parser = argparse.ArgumentParser(description="迁移图片到 MinIO")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="演练模式：不实际执行迁移，仅显示将要迁移的文件"
    )
    parser.add_argument(
        "--delete-local",
        action="store_true",
        help="迁移后删除本地文件"
    )
    args = parser.parse_args()

    print("========== MinIO 图片迁移工具 ==========")
    print(f"模式: {'演练模式 (不会实际迁移)' if args.dry_run else '正式迁移'}")
    print(f"MinIO 端点: {settings.MINIO_ENDPOINT}")
    print(f"存储桶: {settings.MINIO_BUCKET}")
    print("=" * 40)

    # 初始化 MinIO 存储
    storage = MinIOStorageBackend(
        endpoint=settings.MINIO_ENDPOINT,
        access_key=settings.MINIO_ACCESS_KEY,
        secret_key=settings.MINIO_SECRET_KEY,
        bucket_name=settings.MINIO_BUCKET,
        secure=settings.MINIO_SECURE,
        public_url=settings.MINIO_PUBLIC_URL
    )

    # 创建数据库会话
    db = SessionLocal()

    try:
        # 迁移头像
        await migrate_avatars(storage, db, dry_run=args.dry_run)

        # 迁移产品图片
        await migrate_product_images(storage, db, dry_run=args.dry_run)

        if args.dry_run:
            print("\n✓ 演练完成！使用 --no-dry-run 参数执行实际迁移")
        else:
            print("\n✓ 迁移完成！")

            if args.delete_local:
                print("\n警告：--delete-local 功能尚未实现，请手动删除本地文件")

    finally:
        db.close()


if __name__ == "__main__":
    asyncio.run(main())
