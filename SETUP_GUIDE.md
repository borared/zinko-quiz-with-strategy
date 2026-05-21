# Zinko Setup Guide

## Environment Variables Setup

This project requires 3 `.env` files. Follow these steps:

### 1. Root `.env` (For Docker)
```bash
cp .env.example .env
```
Edit `.env` and fill in your values.

### 2. Backend `.env`
```bash
cp backend/.env.example backend/.env
```
Edit `backend/.env` and fill in:
- Clerk keys (from Clerk Dashboard)
- Supabase service role key (from Supabase Dashboard)
- Groq API key (from Groq)

### 3. Frontend `.env`
```bash
cp frontend/.env.example frontend/.env
```
Edit `frontend/.env` and fill in:
- Clerk publishable key (from Clerk Dashboard)
- Supabase URL and anon key (from Supabase Dashboard)

## Quick Start

### Option 1: Docker (Recommended)
```bash
docker-compose up
```

### Option 2: Local Development
```bash
# Terminal 1 - Backend
cd backend
npm install
npm start

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev

# Terminal 3 - ngrok (for webhooks)
ngrok http 5000
```

## Important Notes

⚠️ **Never commit actual `.env` files to Git!**
✅ Only commit `.env.example` files (templates)

## Need Help?

Check `DOCKER_SETUP.md` for detailed Docker instructions.
