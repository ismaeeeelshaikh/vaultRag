# VaultRAG - AI Document Chatbot

Full-stack RAG-powered AI chatbot where each user can upload documents and chat with them privately. Built with FastAPI + React + PostgreSQL + ChromaDB + Groq LLM.

## Features
- **Per-user document isolation** — each user only sees and queries their own files
- **File storage in PostgreSQL** — documents stored as binary in the database (no filesystem dependency)
- **Per-user vector indexes** — each user has their own ChromaDB collection
- **ChatGPT-style sessions** — auto-titled conversations with history
- **Multi-format support** — PDF, DOCX, TXT, MD files up to 20MB
- **Production-ready** — configured for Render (backend) + Vercel (frontend)

## Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL running locally

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux
pip install -r requirements-min.txt
# Copy .env.example to .env and fill in your values
cp .env.example .env
# Run migrations
alembic upgrade head
# Start server
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Deployment

### Backend on Render
1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repo, set **Root Directory** to `backend`
3. **Build Command**: `pip install -r requirements-min.txt && alembic upgrade head`
4. **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Create a **PostgreSQL** database on Render
6. Set environment variables:
   - `DATABASE_URL` — from Render PostgreSQL (auto-set if using render.yaml)
   - `GROQ_API_KEY` — your Groq API key
   - `JWT_SECRET` — a secure random string
   - `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM`, `MAIL_PORT`, `MAIL_SERVER`, `MAIL_TLS`, `MAIL_SSL`
   - `FRONTEND_URL` — your Vercel frontend URL (e.g., `https://your-app.vercel.app`)
   - `ENVIRONMENT` — `production`

### Frontend on Vercel
1. Import your GitHub repo on [vercel.com](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. Set environment variable:
   - `VITE_API_URL` — your Render backend URL (e.g., `https://your-backend.onrender.com`)

## Environment Variables

### Backend (.env)
See [backend/.env.example](backend/.env.example)

### Frontend (.env)
See [frontend/.env.example](frontend/.env.example)
