from bson import ObjectId
from fastapi import APIRouter, HTTPException
from bson.errors import InvalidId

from app.core.mongo import mongo_service
from app.models.product import ProductCreate, ProductOut, ProductUpdate

router = APIRouter(prefix="/products", tags=["products"])
collection = mongo_service.database["products"]


def serialize(doc):
    return {
        "id": str(doc["_id"]),
        "name": doc["name"],
        "sku": doc["sku"],
        "description": doc.get("description"),
        "price": doc["price"],
    }


@router.get("", response_model=list[ProductOut])
def list_products():
    return [serialize(doc) for doc in collection.find().sort("_id", -1)]


@router.post("", response_model=ProductOut)
def create_product(payload: ProductCreate):
    result = collection.insert_one(payload.model_dump())
    doc = collection.find_one({"_id": result.inserted_id})
    return serialize(doc)


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: str):
    try:
        object_id = ObjectId(product_id)
    except InvalidId as exc:
        raise HTTPException(status_code=400, detail="Invalid product id") from exc
    doc = collection.find_one({"_id": object_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Product not found")
    return serialize(doc)


@router.put("/{product_id}", response_model=ProductOut)
def update_product(product_id: str, payload: ProductUpdate):
    try:
        object_id = ObjectId(product_id)
    except InvalidId as exc:
        raise HTTPException(status_code=400, detail="Invalid product id") from exc
    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    result = collection.update_one({"_id": object_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    doc = collection.find_one({"_id": object_id})
    return serialize(doc)


@router.delete("/{product_id}")
def delete_product(product_id: str):
    try:
        object_id = ObjectId(product_id)
    except InvalidId as exc:
        raise HTTPException(status_code=400, detail="Invalid product id") from exc
    result = collection.delete_one({"_id": object_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"deleted": True}
