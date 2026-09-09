import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from project root or backend folder if present
env_paths = [
    Path(__file__).resolve().parent.parent.parent / ".env",
    Path(__file__).resolve().parent.parent / ".env"
]
for p in env_paths:
    if p.exists():
        load_dotenv(p)
        break

class Settings:
    PROJECT_NAME: str = "Showrunner AI - Autonomous Creator Studio"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # API Keys
    PARALLEL_API_KEY: str = os.getenv("PARALLEL_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "") or os.getenv("GOOGLE_API_KEY", "")
    
    # Server host & port
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # Mode flags
    DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1")

settings = Settings()
