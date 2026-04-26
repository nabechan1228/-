"""
House Maker API
セキュリティ強化版 + 管理者API
"""
import logging
import re

from fastapi import FastAPI, Depends, HTTPException, Query, Request, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
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

# 開発環境（デフォルトキー使用時）のみSwagger UIを有効化
_is_dev = settings.jwt_secret_key == "change-me-in-production"
app = FastAPI(
    title="House Maker API",
    docs_url="/docs" if _is_dev else None,
    openapi_url="/openapi.json" if _is_dev else None,
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
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        # Content-Security-Policy: APIサーバーなのでスクリプト実行を禁止
        response.headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'"
        # HSTS: HTTPS使用時にHTTPへのダウングレードを防止
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response


app.add_middleware(SecurityHeadersMiddleware)

# CORS設定（環境変数で制御）
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
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

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        v = v.strip()
        if len(v) > 100:
            raise ValueError("ユーザー名が長すぎます")
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) > 200:
            raise ValueError("パスワードが長すぎます")
        return v


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

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        v = v.strip()
        if not v or len(v) > 200:
            raise ValueError("タイトルは1〜200文字で入力してください")
        return v

    @field_validator("content")
    @classmethod
    def validate_content(cls, v: str) -> str:
        v = v.strip()
        if not v or len(v) > 5000:
            raise ValueError("本文は1〜5000文字で入力してください")
        return v


class NewsUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    is_published: bool | None = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = v.strip()
        if not v or len(v) > 200:
            raise ValueError("タイトルは1〜200文字で入力してください")
        return v

    @field_validator("content")
    @classmethod
    def validate_content(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = v.strip()
        if not v or len(v) > 5000:
            raise ValueError("本文は1〜5000文字で入力してください")
        return v


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

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        v = v.strip()
        if not v or len(v) > 200:
            raise ValueError("タイトルは1〜200文字で入力してください")
        return v

    @field_validator("description")
    @classmethod
    def validate_description(cls, v: str) -> str:
        v = v.strip()
        if not v or len(v) > 3000:
            raise ValueError("説明文は1〜3000文字で入力してください")
        return v

    @field_validator("main_image_url")
    @classmethod
    def validate_image_url(cls, v: str | None) -> str | None:
        if v is None or v == "":
            return None
        v = v.strip()
        if not re.match(r"^https?://", v):
            raise ValueError("画像URLはhttpまたはhttpsで始まる必要があります")
        if len(v) > 500:
            raise ValueError("画像URLが長すぎます")
        return v

    @field_validator("location")
    @classmethod
    def validate_location(cls, v: str | None) -> str | None:
        if v is None or v == "":
            return None
        v = v.strip()
        if len(v) > 100:
            raise ValueError("所在地は100文字以内で入力してください")
        return v

    @field_validator("price_range")
    @classmethod
    def validate_price_range(cls, v: str | None) -> str | None:
        if v is None or v == "":
            return None
        v = v.strip()
        if len(v) > 100:
            raise ValueError("価格帯は100文字以内で入力してください")
        return v


class WorkUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    main_image_url: str | None = None
    location: str | None = None
    price_range: str | None = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = v.strip()
        if not v or len(v) > 200:
            raise ValueError("タイトルは1〜200文字で入力してください")
        return v

    @field_validator("description")
    @classmethod
    def validate_description(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = v.strip()
        if not v or len(v) > 3000:
            raise ValueError("説明文は1〜3000文字で入力してください")
        return v

    @field_validator("main_image_url")
    @classmethod
    def validate_image_url(cls, v: str | None) -> str | None:
        if v is None or v == "":
            return None
        v = v.strip()
        if not re.match(r"^https?://", v):
            raise ValueError("画像URLはhttpまたはhttpsで始まる必要があります")
        if len(v) > 500:
            raise ValueError("画像URLが長すぎます")
        return v

    @field_validator("location")
    @classmethod
    def validate_location(cls, v: str | None) -> str | None:
        if v is None or v == "":
            return None
        v = v.strip()
        if len(v) > 100:
            raise ValueError("所在地は100文字以内で入力してください")
        return v

    @field_validator("price_range")
    @classmethod
    def validate_price_range(cls, v: str | None) -> str | None:
        if v is None or v == "":
            return None
        v = v.strip()
        if len(v) > 100:
            raise ValueError("価格帯は100文字以内で入力してください")
        return v


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
        # ログインジェクション対策: usernameをrepr()でサニタイズしてから記録
        logger.warning(f"ログイン失敗: username={repr(login.username)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="ユーザー名またはパスワードが正しくありません",
        )

    token = create_access_token(data={"sub": login.username})
    logger.info(f"管理者ログイン成功: {repr(login.username)}")
    return {"access_token": token, "token_type": "bearer"}


@app.get("/api/admin/dashboard/stats")
def get_dashboard_stats(
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """ダッシュボード統計情報を取得"""
    unread_contacts = db.query(func.count(models.ContactItem.id)).filter(
        models.ContactItem.is_read == False
    ).scalar()
    total_contacts = db.query(func.count(models.ContactItem.id)).scalar()
    published_news = db.query(func.count(models.NewsItem.id)).filter(
        models.NewsItem.is_published == True
    ).scalar()
    total_works = db.query(func.count(models.WorkItem.id)).scalar()

    return {
        "unread_contacts": unread_contacts,
        "total_contacts": total_contacts,
        "published_news": published_news,
        "total_works": total_works,
    }


@app.get("/api/admin/contacts")
def list_contacts(
    skip: int = Query(default=0, ge=0, description="スキップ件数"),
    limit: int = Query(default=20, ge=1, le=100, description="取得件数（最大100）"),
    admin: str = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """お問い合わせ一覧取得（ページネーション付）"""
    total = db.query(models.ContactItem).count()
    contacts = (
        db.query(models.ContactItem)
        .order_by(models.ContactItem.created_at.desc())
        .offset(skip)
        .limit(limit)
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
@limiter.limit("30/minute")
def list_published_news(
    request: Request,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    news = db.query(models.NewsItem).filter(models.NewsItem.is_published == True).order_by(models.NewsItem.published_at.desc()).offset(skip).limit(limit).all()
    return [{"id": n.id, "title": n.title, "content": n.content, "published_at": n.published_at.isoformat() if n.published_at else None} for n in news]

@app.get("/api/works")
@limiter.limit("30/minute")
def list_works(
    request: Request,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    works = db.query(models.WorkItem).order_by(models.WorkItem.created_at.desc()).offset(skip).limit(limit).all()
    return [
        {
            "id": w.id, "title": w.title, "description": w.description, 
            "main_image_url": w.main_image_url, "location": w.location, "price_range": w.price_range
        } for w in works
    ]

@app.get("/api/works/{work_id}")
@limiter.limit("30/minute")
def get_work(request: Request, work_id: int, db: Session = Depends(get_db)):
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
    return [{"id": n.id, "title": n.title, "content": n.content, "is_published": n.is_published, "published_at": n.published_at.isoformat() if n.published_at else None} for n in news]

@app.post("/api/admin/news")
def create_news(news: NewsCreate, admin: str = Depends(get_current_admin), db: Session = Depends(get_db)):
    try:
        db_news = models.NewsItem(title=news.title, content=news.content, is_published=news.is_published)
        db.add(db_news)
        db.commit()
        db.refresh(db_news)
        logger.info(f"お知らせ作成: ID={db_news.id} by {repr(admin)}")
        return {"status": "success", "id": db_news.id}
    except Exception as e:
        db.rollback()
        logger.error(f"お知らせ作成エラー: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="お知らせの作成に失敗しました")

@app.put("/api/admin/news/{news_id}")
def update_news(news_id: int, news: NewsUpdate, admin: str = Depends(get_current_admin), db: Session = Depends(get_db)):
    """お知らせを更新"""
    db_news = db.query(models.NewsItem).filter(models.NewsItem.id == news_id).first()
    if not db_news:
        raise HTTPException(status_code=404, detail="お知らせが見つかりません")
    try:
        update_data = news.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_news, key, value)
        db.commit()
        db.refresh(db_news)
        logger.info(f"お知らせ更新: ID={news_id} by {repr(admin)}")
        return {"status": "success", "id": db_news.id}
    except Exception as e:
        db.rollback()
        logger.error(f"お知らせ更新エラー: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="お知らせの更新に失敗しました")

@app.delete("/api/admin/news/{news_id}")
def delete_news(news_id: int, admin: str = Depends(get_current_admin), db: Session = Depends(get_db)):
    db_news = db.query(models.NewsItem).filter(models.NewsItem.id == news_id).first()
    if not db_news:
        raise HTTPException(status_code=404, detail="お知らせが見つかりません")
    try:
        db.delete(db_news)
        db.commit()
        logger.info(f"お知らせ削除: ID={news_id} by {repr(admin)}")
        return {"status": "success"}
    except Exception as e:
        db.rollback()
        logger.error(f"お知らせ削除エラー: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="お知らせの削除に失敗しました")

@app.post("/api/admin/works")
def create_work(work: WorkCreate, admin: str = Depends(get_current_admin), db: Session = Depends(get_db)):
    try:
        db_work = models.WorkItem(**work.model_dump())
        db.add(db_work)
        db.commit()
        db.refresh(db_work)
        logger.info(f"施工事例作成: ID={db_work.id} by {repr(admin)}")
        return {"status": "success", "id": db_work.id}
    except Exception as e:
        db.rollback()
        logger.error(f"施工事例作成エラー: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="施工事例の作成に失敗しました")

@app.put("/api/admin/works/{work_id}")
def update_work(work_id: int, work: WorkUpdate, admin: str = Depends(get_current_admin), db: Session = Depends(get_db)):
    """施工事例を更新"""
    db_work = db.query(models.WorkItem).filter(models.WorkItem.id == work_id).first()
    if not db_work:
        raise HTTPException(status_code=404, detail="施工事例が見つかりません")
    try:
        update_data = work.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_work, key, value)
        db.commit()
        db.refresh(db_work)
        logger.info(f"施工事例更新: ID={work_id} by {repr(admin)}")
        return {"status": "success", "id": db_work.id}
    except Exception as e:
        db.rollback()
        logger.error(f"施工事例更新エラー: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="施工事例の更新に失敗しました")

@app.delete("/api/admin/works/{work_id}")
def delete_work(work_id: int, admin: str = Depends(get_current_admin), db: Session = Depends(get_db)):
    db_work = db.query(models.WorkItem).filter(models.WorkItem.id == work_id).first()
    if not db_work:
        raise HTTPException(status_code=404, detail="施工事例が見つかりません")
    try:
        db.delete(db_work)
        db.commit()
        logger.info(f"施工事例削除: ID={work_id} by {repr(admin)}")
        return {"status": "success"}
    except Exception as e:
        db.rollback()
        logger.error(f"施工事例削除エラー: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="施工事例の削除に失敗しました")
