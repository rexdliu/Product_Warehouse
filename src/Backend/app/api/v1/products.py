from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.crud.product import product as product_repo, category as category_repo
from app.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductInDB,
    ProductCategoryInDB,
)

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
    product_in: ProductCreate
) -> Any:
    """创建产品"""
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
    product_in: ProductUpdate
) -> Any:
    """更新产品"""
    product = product_repo.get(db, id=id)
    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )
    product = product_repo.update(db, db_obj=product, obj_in=product_in)
    return product

@router.delete("/{id}", response_model=ProductInDB)
def delete_product(
    *,
    db: Session = Depends(get_db),
    id: int
) -> Any:
    """删除产品"""
    product = product_repo.get(db, id=id)
    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )
    product = product_repo.remove(db, id=id)
    return product
