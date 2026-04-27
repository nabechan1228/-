"""
データベースモデル定義
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime, timezone


class ContactItem(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=True)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class NewsItem(Base):
    __tablename__ = "news"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    published_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    is_published = Column(Boolean, default=True, nullable=False)


class WorkItem(Base):
    __tablename__ = "works"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    main_image_url = Column(String(500), nullable=True) # メイン画像
    location = Column(String(100), nullable=True)
    price_range = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # 追加画像用のリレーション
    images = relationship("WorkImage", back_populates="work", cascade="all, delete-orphan", order_by="WorkImage.display_order")


class WorkImage(Base):
    __tablename__ = "work_images"

    id = Column(Integer, primary_key=True, index=True)
    work_id = Column(Integer, ForeignKey("works.id", ondelete="CASCADE"), nullable=False)
    image_url = Column(String(500), nullable=False)
    display_order = Column(Integer, default=0)

    work = relationship("WorkItem", back_populates="images")


