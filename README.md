# AI-Powered Hotel Management Website with RAG Chatbot

A modern, full-stack hotel management system with AI-powered concierge chatbot using Retrieval-Augmented Generation (RAG).

## Architecture

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: Python FastAPI
- **Database**: Supabase PostgreSQL with pgvector extension
- **AI**: OpenAI GPT-4 with embeddings-based RAG

## Features

- 🏨 Room browsing and booking system
- 🤖 AI chatbot concierge with RAG
- 📱 Responsive mobile-first design
- 🔐 Admin dashboard with authentication
- 📄 Document upload and processing for RAG
- 💬 Chat conversation logging
- 🎯 Vector similarity search for accurate responses

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm/yarn
- Python 3.11+
- Supabase account
- OpenAI API key

### Database Setup

1. Create a new Supabase project at https://supabase.com
2. Enable the pgvector extension in your Supabase SQL editor:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
3. Run the migration script in `database/migrations/001_initial_schema.sql`

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

5. Update the `.env` file with your credentials:
   - `DATABASE_URL`: Your Supabase PostgreSQL connection string
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `JWT_SECRET`: A secure random string
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_KEY`: Your Supabase service role key

6. Run the backend:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file (copy from `.env.local.example`):
   ```bash
   cp .env.local.example .env.local
   ```

4. Update the `.env.local` file:
   - `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:8000)
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon public key

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open http://localhost:3000 in your browser

## Default Admin Credentials

- **Email**: admin@hotel.com
- **Password**: admin123

**⚠️ Important**: Change these credentials in production!

## Usage

### Guest Features

- Browse available rooms
- Make bookings with date selection
- Chat with AI concierge
- View hotel information

### Admin Features

- Manage rooms (create, update, delete)
- View all bookings
- Upload hotel documents (PDF, DOC, TXT)
- View chatbot conversation logs
- Dashboard with statistics

### RAG Chatbot

The chatbot is trained on:
- Uploaded hotel documents
- Room information from the database
- Hotel policies and FAQs

It will only answer questions based on available data and will politely decline if information is not available.

## Project Structure

```
├── frontend/              # Next.js application
│   ├── app/              # App router pages
│   ├── components/       # React components
│   └── lib/              # Utility functions
├── backend/              # FastAPI application
│   └── app/
│       ├── api/          # API routes
│       ├── core/         # Configuration
│       ├── services/     # Business logic
│       ├── models/       # Database models
│       └── database/     # Database connection
└── database/             # Migration scripts
```

## API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Docker Deployment

Build and run with Docker:

```bash
# Backend
cd backend
docker build -t hotel-backend .
docker run -p 8000:8000 --env-file .env hotel-backend

# Frontend
cd frontend
docker build -t hotel-frontend .
docker run -p 3000:3000 hotel-frontend
```

## License

MIT License
