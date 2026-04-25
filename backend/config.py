"""
アプリケーション設定管理
環境変数から設定を型安全に読み込む
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # MySQL設定
    mysql_user: str = "root"
    mysql_password: str = ""
    mysql_host: str = "localhost"
    mysql_port: int = 3306
    mysql_database: str = "housemaker_db"

    # CORS設定（カンマ区切りで複数指定可能）
    allowed_origins: str = "http://localhost:3000"

    # JWT設定
    jwt_secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 30

    # SMTP設定（自動返信メール用）
    smtp_server: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from_email: str = "info@watanabe-komuten.example.com"
    smtp_from_name: str = "渡部工務店"

    # サイトURL設定（メール本文などで使用）
    site_url: str = "http://localhost:3000"

    # 管理者認証
    admin_username: str = "admin"
    admin_password_hash: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    @property
    def database_url(self) -> str:
        return (
            f"mysql+pymysql://{self.mysql_user}:{self.mysql_password}"
            f"@{self.mysql_host}:{self.mysql_port}/{self.mysql_database}"
            f"?charset=utf8mb4"
        )

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",")]


@lru_cache()
def get_settings() -> Settings:
    return Settings()
