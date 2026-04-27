import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from urllib.parse import quote_plus
from dotenv import load_dotenv

# Load .env during local dev; in Docker you'll pass env vars directly
load_dotenv()

SERVER = os.getenv("MSSQL_SERVER", "123456")       # e.g., "10.10.10.10,1433"
DATABASE = os.getenv("MSSQL_DATABASE", "fab")
USERNAME = os.getenv("MSSQL_USERNAME", "fab")
PASSWORD = os.getenv("MSSQL_PASSWORD", "")         # set securely in Docker/host

# ODBC connection string for SQL Server (ODBC Driver 18)
odbc_str = (
    "Driver={ODBC Driver 18 for SQL Server};"
    f"Server={SERVER};"
    f"Database={DATABASE};"
    f"Uid={USERNAME};"
    f"Pwd={PASSWORD};"
    "Encrypt=yes;"
    "TrustServerCertificate=yes;"
    "Connection Timeout=30;"
)

connection_url = f"mssql+pyodbc:///?odbc_connect={quote_plus(odbc_str)}"

# Engine + session factory (SQLAlchemy 2.x)
engine = create_engine(
    connection_url,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    future=True,
)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()