from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
import models
from database import engine, get_db

# データベースのテーブルを作成
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="House Maker API")

# CORS設定（フロントエンドからのアクセスを許可）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 本番環境では特定のドメインに絞るべき
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydanticスキーマ（データバリデーション用）
class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str | None = None
    message: str

@app.get("/")
def read_root():
    return {"message": "Welcome to the House Maker API"}

@app.post("/api/contact")
def create_contact(contact: ContactCreate, db: Session = Depends(get_db)):
    try:
        new_contact = models.ContactItem(
            name=contact.name,
            email=contact.email,
            phone=contact.phone,
            message=contact.message
        )
        db.add(new_contact)
        db.commit()
        db.refresh(new_contact)
        return {"status": "success", "message": "お問い合わせを受け付けました。"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
