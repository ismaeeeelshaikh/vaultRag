from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import init_db
from .config import settings
from . import models  # noqa: F401 - ensures model metadata is registered
from .routers import auth, chat, chat_sessions, password_reset, documents

app = FastAPI(
    title="VaultRAG AI Chatbot",
    description="AI-powered chatbot with per-user document RAG",
    version="1.0.0"
)

# Dynamic CORS based on environment
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]

if settings.FRONTEND_URL and settings.FRONTEND_URL not in allowed_origins:
    allowed_origins.append(settings.FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(chat_sessions.router)
app.include_router(password_reset.router)
app.include_router(documents.router)

@app.on_event("startup")
async def on_startup():
    await init_db()

@app.get("/")
async def root():
    return {"message": "VaultRAG AI Chatbot API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
