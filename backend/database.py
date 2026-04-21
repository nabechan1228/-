import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from dotenv import load_dotenv

load_dotenv()

user = os.getenv("MYSQL_USER", "root")
password = os.getenv("MYSQL_PASSWORD", "")
host = os.getenv("MYSQL_HOST", "localhost")
port = os.getenv("MYSQL_PORT", "3306")
database = os.getenv("MYSQL_DATABASE", "housemaker_db")

# pymysqlを使用
SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{user}:{password}@{host}:{port}/{database}?charset=utf8mb4"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# DBセッション取得用
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
