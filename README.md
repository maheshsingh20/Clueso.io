# Clueso Clone - AI-Powered Screen Recording Platform

A complete clone of Clueso.io built with the MERN stack and TypeScript.

## Features

- 🎥 Screen recording and video upload
- 🤖 AI-powered voiceovers and transcription
- 📝 Automatic documentation generation
- ✂️ Video editing with timeline
- 👥 Team collaboration
- 📤 Multiple export formats

## Tech Stack

- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT + Refresh Tokens
- **Storage**: AWS S3 / Cloudflare R2
- **Video Processing**: FFmpeg
- **AI Services**: OpenAI (Whisper + GPT)
- **Queue**: BullMQ + Redis

## Project Structure

```
clueso-clone/
├── frontend/          # React application
├── backend/           # Express API server
├── shared/            # Shared TypeScript types
├── docker-compose.yml # Development environment
└── README.md
```

## Quick Start

### Option 1: Automated Start (Recommended)
```bash
# Windows
start.bat

# Linux/Mac
chmod +x start.sh
./start.sh
```

### Option 2: Manual Start
```bash
# 1. Install dependencies
npm install
cd frontend && npm install
cd ../backend && npm install

# 2. Start backend (in one terminal)
cd backend
npm run dev

# 3. Start frontend (in another terminal)
cd frontend
npm run dev
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/v1/health

## Environment Variables

See `.env.example` files in frontend/ and backend/ directories.

## Documentation

- [API Documentation](./backend/docs/api.md)
- [Frontend Architecture](./frontend/docs/architecture.md)
- [Deployment Guide](./docs/deployment.md)