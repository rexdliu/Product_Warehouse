from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.crud.product import product as product_repo, category as category_repo
from app.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductInDB,
    ProductCategoryInDB,
)
from app.api.deps import (
    get_current_active_user,
    require_manager_or_above,
    require_admin,
)
from app.models.user import User
from app.models.product import Product

router = APIRouter()

@router.get("/", response_model=List[ProductInDB])
def read_products(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
) -> Any:
    """获取产品列表"""
    products = product_repo.get_multi(db, skip=skip, limit=limit)
    return products

@router.post("/", response_model=ProductInDB)
def create_product(
    *,
    db: Session = Depends(get_db),
    product_in: ProductCreate,
    current_user: User = Depends(require_manager_or_above)
) -> Any:
    """
    创建新产品

    需要 Manager/Admin/Tester 权限
    验证：
    - SKU 唯一性
    - Part number 唯一性（如果提供）
    - Category ID 存在性
    """
    # 验证 SKU 唯一性
    existing = db.query(Product).filter(Product.sku == product_in.sku).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"SKU '{product_in.sku}' 已存在"
        )

    # 验证 Part number 唯一性（如果提供）
    if product_in.part_number:
        existing = db.query(Product).filter(
            Product.part_number == product_in.part_number
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"零件号 '{product_in.part_number}' 已存在"
            )

    # 验证分类存在
    category = category_repo.get(db, id=product_in.category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"分类 ID {product_in.category_id} 不存在"
        )

    product = product_repo.create(db, obj_in=product_in)
    return product

@router.get("/categories", response_model=List[ProductCategoryInDB])
def read_categories(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """获取产品分类列表"""
    return category_repo.get_multi(db, skip=skip, limit=limit)

@router.get("/{id}", response_model=ProductInDB)
def read_product(
    *,
    db: Session = Depends(get_db),
    id: int
) -> Any:
    """获取特定产品"""
    product = product_repo.get(db, id=id)
    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )
    return product

@router.put("/{id}", response_model=ProductInDB)
def update_product(
    *,
    db: Session = Depends(get_db),
    id: int,
    product_in: ProductUpdate,
    current_user: User = Depends(require_manager_or_above)
) -> Any:
    """
    更新产品信息

    需要 Manager/Admin/Tester 权限
    """
    product = product_repo.get(db, id=id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="产品不存在"
        )

    # 验证 SKU 唯一性（如果修改）
    if product_in.sku and product_in.sku != product.sku:
        existing = db.query(Product).filter(Product.sku == product_in.sku).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"SKU '{product_in.sku}' 已存在"
            )

    # 验证 Part number 唯一性（如果修改）
    if product_in.part_number and product_in.part_number != product.part_number:
        existing = db.query(Product).filter(
            Product.part_number == product_in.part_number
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"零件号 '{product_in.part_number}' 已存在"
            )

    # 验证分类存在（如果修改）
    if product_in.category_id:
        category = category_repo.get(db, id=product_in.category_id)
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"分类 ID {product_in.category_id} 不存在"
            )

    product = product_repo.update(db, db_obj=product, obj_in=product_in)
    return product

@router.delete("/{id}", response_model=ProductInDB)
def delete_product(
    *,
    db: Session = Depends(get_db),
    id: int,
    current_user: User = Depends(require_admin)
) -> Any:
    """
    删除产品（软删除）

    需要 Admin 或 Tester 权限
    仅设置 is_active = False，不进行物理删除
    """
    product = product_repo.get(db, id=id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="产品不存在"
        )

    # 软删除：设置 is_active = False
    product.is_active = False  # type: ignore[assignment]
    db.add(product)
    db.commit()
    db.refresh(product)

    return product
