
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()

# Models
class User(BaseModel):
    id: int
    name: str
    email: str

class Product(BaseModel):
    id: int
    name: str
    quantity: int
    price: float

class Settings(BaseModel):
    theme: str
    notifications: bool

# Mock Data
users = [
    User(id=1, name="John Doe", email="john.doe@example.com")
]

products = [
    Product(id=1, name="Laptop", quantity=50, price=1200.00),
    Product(id=2, name="Mouse", quantity=200, price=25.00),
    Product(id=3, name="Keyboard", quantity=100, price=75.00)
]

settings = Settings(theme="dark", notifications=True)

# API Endpoints
@app.get("/")
def read_root():
    return {"message": "Welcome to the Product Warehouse API"}

@app.get("/api/users", response_model=List[User])
def get_users():
    return users

@app.get("/api/products", response_model=List[Product])
def get_products(search: Optional[str] = None):
    if search:
        return [p for p in products if search.lower() in p.name.lower()]
    return products

@app.get("/api/settings", response_model=Settings)
def get_settings():
    return settings

@app.put("/api/settings", response_model=Settings)
def update_settings(new_settings: Settings):
    global settings
    settings = new_settings
    return settings

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
