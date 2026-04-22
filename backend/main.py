"""
House Maker API
セキュリティ強化版 + 管理者API
"""
import logging
import re

from fastapi import FastAPI, Depends, HTTPException, Request, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, field_validator
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from starlette.middleware.base import BaseHTTPMiddleware

import models
from database import engine, get_db
from config import get_settings
from auth import verify_password, create_access_token, get_current_admin
from email_service import send_auto_reply_email

# ロガー設定
logger = logging.getLogger("housemaker")
logging.basicConfig(level=logging.INFO)

# 設定読み込み
settings = get_settings()

# データベースのテーブルを作成
models.Base.metadata.create_all(bind=engine)

# レート制限の設定（config_filename=NoneでWindows CP932エンコーディング問題を回避）
limiter = Limiter(key_func=get_remote_address, config_filename=None)

app = FastAPI(
    title="House Maker API",
    docs_url="/docs" if settings.jwt_secret_key == "change-me-in-production" else None,
    redoc_url=None,
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# ===== ミドルウェア =====

# セキュリティヘッダーミドルウェア
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response


app.add_middleware(SecurityHeadersMiddleware)

# CORS設定（環境変数で制御）
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["*"],
)


# ===== Pydanticスキーマ =====

class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str | None = None
    message: str

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if not v or len(v) > 100:
            raise ValueError("お名前は1〜100文字で入力してください")
        return v

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str | None) -> str | None:
        if v is None or v == "":
            return None
        v = v.strip()
        if not re.match(r"^[0-9\-]{10,15}$", v):
            raise ValueError("電話番号は10〜15桁の数字（ハイフン可）で入力してください")
        return v

    @field_validator("message")
    @classmethod
    def validate_message(cls, v: str) -> str:
        v = v.strip()
        if not v or len(v) > 2000:
            raise ValueError("お問い合わせ内容は1〜2000文字で入力してください")
        return v


class AdminLogin(BaseModel):
    username: str
    password: str


class ContactResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: str | None
    message: str
    is_read: bool
    created_at: str

    class Config:
        from_attributes = True


class NewsCreate(BaseModel):
    title: str
    content: str
    is_published: bool = True

class NewsResponse(BaseModel):
    id: int
    title: str
    content: str
    published_at: str | None
    is_published: bool

    class Config:
        from_attributes = True

class WorkCreate(BaseModel):
    title: str
    description: str
    main_image_url: str | None = None
    location: str | None = None
    price_range: str | None = None

class WorkResponse(BaseModel):
    id: int
    title: str
    description: str
    main_image_url: str | None
    location: str | None
    price_range: str | None
    created_at: str | None

    class Config:
        from_attributes = True


# ===== 一般公開API =====

@app.get("/")
def read_root():
    return {"message": "Welcome to the House Maker API"}


@app.post("/api/contact")
@limiter.limit("5/minute")
def create_contact(
    request: Request,
    contact: ContactCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    try:
        new_contact = models.ContactItem(
            name=contact.name,
            email=contact.email,
            phone=contact.phone,
            message=contact.message,
        )
        db.add(new_contact)
        db.commit()
        db.refresh(new_contact)
        logger.info(f"新しいお問い合わせ: ID={new_contact.id}")
        
        # 自動返信メールをバックグラウンドで送信
        background_tasks.add_task(send_auto_reply_email, contact.email, contact.name)
        
        return {"status": "success", "message": "お問い合わせを受け付けました。"}
    except Exception as e:
        db.rollback()
        logger.error(f"お問い合わせ保存エラー: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="お問い合わせの送信に失敗しました。時間をおいて再度お試しください。",
        )


# ===== 管理者API（JWT認証必須） =====

@app.post("/api/admin/login")
@limiter.limit("10/minute")
def admin_login(request: Request, login: AdminLogin):
    """管理者ログイン → JWTトークン発行"""
    if (
        login.username != settings.admin_username
        or not verify_password(login.password, settings.admin_password_hash)
    ):
        logger.warning(f"ログイン失敗: username={login.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="ユーザー名またはパスワードが正しくありません",
        )

    token = create_access_token(data={"sub": login.username})
    logger.info(f"管理者ログイン成功: {login.username}")
    return {"access_token": token, "token_type": "bearer"}


@app.get("/api/admin/contacts")
def list_contacts(
    skip: int = 0,
    limit: int = 20,
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """お問い合わせ一覧取得（ページネーション付）"""
    total = db.query(models.ContactItem).count()
    contacts = (
        db.query(models.ContactItem)
        .order_by(models.ContactItem.created_at.desc())
        .offset(skip)
        .limit(min(limit, 100))  # 最大100件
        .all()
    )
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "contacts": [
            {
                "id": c.id,
                "name": c.name,
                "email": c.email,
                "phone": c.phone,
                "message": c.message,
                "is_read": c.is_read,
                "created_at": c.created_at.isoformat() if c.created_at else None,
            }
            for c in contacts
        ],
    }


@app.get("/api/admin/contacts/{contact_id}")
def get_contact(
    contact_id: int,
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """お問い合わせ詳細取得"""
    contact = db.query(models.ContactItem).filter(models.ContactItem.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="お問い合わせが見つかりません")
    return {
        "id": contact.id,
        "name": contact.name,
        "email": contact.email,
        "phone": contact.phone,
        "message": contact.message,
        "is_read": contact.is_read,
        "created_at": contact.created_at.isoformat() if contact.created_at else None,
    }


@app.patch("/api/admin/contacts/{contact_id}/read")
def mark_contact_read(
    contact_id: int,
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """既読フラグ更新"""
    contact = db.query(models.ContactItem).filter(models.ContactItem.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="お問い合わせが見つかりません")
    contact.is_read = True
    db.commit()
    logger.info(f"お問い合わせ既読: ID={contact_id} by {admin}")
    return {"status": "success", "message": "既読にしました"}


@app.delete("/api/admin/contacts/{contact_id}")
def delete_contact(
    contact_id: int,
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """お問い合わせ削除"""
    contact = db.query(models.ContactItem).filter(models.ContactItem.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="お問い合わせが見つかりません")
    db.delete(contact)
    db.commit()
    logger.info(f"お問い合わせ削除: ID={contact_id} by {admin}")
    return {"status": "success", "message": "削除しました"}


# ===== 一般公開API (News & Works) =====

@app.get("/api/news")
def list_published_news(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    news = db.query(models.NewsItem).filter(models.NewsItem.is_published == True).order_by(models.NewsItem.published_at.desc()).offset(skip).limit(limit).all()
    return [{"id": n.id, "title": n.title, "content": n.content, "published_at": n.published_at.isoformat() if n.published_at else None} for n in news]

@app.get("/api/works")
def list_works(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    works = db.query(models.WorkItem).order_by(models.WorkItem.created_at.desc()).offset(skip).limit(limit).all()
    return [
        {
            "id": w.id, "title": w.title, "description": w.description, 
            "main_image_url": w.main_image_url, "location": w.location, "price_range": w.price_range
        } for w in works
    ]

@app.get("/api/works/{work_id}")
def get_work(work_id: int, db: Session = Depends(get_db)):
    work = db.query(models.WorkItem).filter(models.WorkItem.id == work_id).first()
    if not work:
        raise HTTPException(status_code=404, detail="施工事例が見つかりません")
    return {
        "id": work.id, "title": work.title, "description": work.description, 
        "main_image_url": work.main_image_url, "location": work.location, "price_range": work.price_range
    }

# ===== 管理者API (News & Works CRUD) =====

@app.get("/api/admin/news")
def admin_list_news(admin: str = Depends(get_current_admin), db: Session = Depends(get_db)):
    news = db.query(models.NewsItem).order_by(models.NewsItem.published_at.desc()).all()
    return [{"id": n.id, "title": n.title, "is_published": n.is_published, "published_at": n.published_at.isoformat() if n.published_at else None} for n in news]

@app.post("/api/admin/news")
def create_news(news: NewsCreate, admin: str = Depends(get_current_admin), db: Session = Depends(get_db)):
    db_news = models.NewsItem(title=news.title, content=news.content, is_published=news.is_published)
    db.add(db_news)
    db.commit()
    db.refresh(db_news)
    return {"status": "success", "id": db_news.id}

@app.delete("/api/admin/news/{news_id}")
def delete_news(news_id: int, admin: str = Depends(get_current_admin), db: Session = Depends(get_db)):
    db_news = db.query(models.NewsItem).filter(models.NewsItem.id == news_id).first()
    if not db_news:
        raise HTTPException(status_code=404, detail="お知らせが見つかりません")
    db.delete(db_news)
    db.commit()
    return {"status": "success"}

@app.post("/api/admin/works")
def create_work(work: WorkCreate, admin: str = Depends(get_current_admin), db: Session = Depends(get_db)):
    db_work = models.WorkItem(**work.model_dump())
    db.add(db_work)
    db.commit()
    db.refresh(db_work)
    return {"status": "success", "id": db_work.id}

@app.delete("/api/admin/works/{work_id}")
def delete_work(work_id: int, admin: str = Depends(get_current_admin), db: Session = Depends(get_db)):
    db_work = db.query(models.WorkItem).filter(models.WorkItem.id == work_id).first()
    if not db_work:
        raise HTTPException(status_code=404, detail="施工事例が見つかりません")
    db.delete(db_work)
    db.commit()
    return {"status": "success"}
