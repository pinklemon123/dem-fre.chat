# Deployment Guide for dem-fre.chat

This project is a **Next.js application** with Python serverless functions. It is designed to be deployed as a web application, not as a standalone Python application.

## Project Structure

- **Primary**: Next.js web application (`npm start`)
- **Secondary**: Python newsbot functions (`python main.py`)

## Deployment Commands

### For Web Deployment (Primary)
```bash
npm install
npm run build
npm start
```

### For Python Functions (Secondary)
```bash
pip install -r requirements.txt
python main.py newsbot
```

## Platform-Specific Instructions

### Vercel (Recommended)
This project is optimized for Vercel deployment with the existing `vercel.json` configuration.

### Railpack/Railway
The project includes both `main.py` and `app.py` entry points for Python compatibility:
- `main.py` - Main Python entry point
- `app.py` - Alternative Python entry point
- `Procfile` - Process definitions
- `runtime.txt` - Python runtime specification

### General Platforms
1. **Primary deployment**: Use Node.js/Next.js build process
2. **Python support**: Install Python dependencies for serverless functions
3. **Environment variables**: Configure Supabase and API keys as documented

## Architecture

This is a **hybrid application**:
- Frontend: Next.js + React + TypeScript
- Backend API: Next.js API routes
- Background Jobs: Python (newsbot processing)
- Database: Supabase
- Deployment: Serverless functions + static site

The Python components are used for:
- News article processing and translation
- RSS feed parsing
- AI-powered content analysis
- Background job execution

The Next.js components handle:
- Web interface and user interactions
- API endpoints and authentication
- Database operations
- Real-time features