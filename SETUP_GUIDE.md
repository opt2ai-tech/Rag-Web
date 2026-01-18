# Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18+ and npm
- Python 3.11+
- A Supabase account (https://supabase.com)
- An OpenAI API key (https://platform.openai.com)

## Step 1: Database Setup

### Create Supabase Project

1. Go to https://supabase.com and create a new project
2. Wait for the project to be provisioned
3. Navigate to the SQL Editor in your Supabase dashboard

### Enable pgvector Extension

Run this SQL command in the SQL Editor:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Run Database Migration

Copy the entire contents of `database/migrations/001_initial_schema.sql` and execute it in the SQL Editor. This will:
- Create all necessary tables (users, rooms, bookings, documents, document_chunks, chat_logs)
- Set up indexes for performance
- Insert sample rooms
- Create a default admin user (admin@hotel.com / admin123)

### Get Your Supabase Credentials

From your Supabase project settings:
- Project URL (Settings → API → Project URL)
- Service Role Key (Settings → API → service_role key) - for backend
- Anon Public Key (Settings → API → anon public key) - for frontend

## Step 2: Backend Setup

### Navigate to Backend Directory

```bash
cd backend
```

### Create Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate it
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Create Environment File

Create a `.env` file in the `backend` directory:

```bash
# Copy the example
cp .env.example .env
```

Edit `.env` with your actual credentials:

```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
OPENAI_API_KEY=sk-your-openai-api-key-here
JWT_SECRET=your-random-secret-key-here
SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
SUPABASE_KEY=your-service-role-key-here
CORS_ORIGINS=http://localhost:3000
```

**Important**: 
- Replace `[YOUR-PASSWORD]` and `[YOUR-PROJECT-REF]` with your Supabase credentials
- Get your OpenAI API key from https://platform.openai.com/api-keys
- Generate a secure JWT secret (use a random 32+ character string)

### Run the Backend

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Swagger Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Step 3: Frontend Setup

### Open a New Terminal

Keep the backend running and open a new terminal window.

### Navigate to Frontend Directory

```bash
cd frontend
```

### Install Dependencies

```bash
npm install
```

### Create Environment File

Create a `.env.local` file in the `frontend` directory:

```bash
# Copy the example
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here
```

### Run the Frontend

```bash
npm run dev
```

The frontend will be available at http://localhost:3000

## Step 4: Verify Installation

1. **Frontend**: Open http://localhost:3000
   - You should see the hotel homepage
   - Try the "Chat with Concierge" button

2. **Backend API**: Open http://localhost:8000/docs
   - You should see the Swagger API documentation
   - Try the `/health` endpoint

3. **Admin Panel**: Go to http://localhost:3000/admin/login
   - Login with: `admin@hotel.com` / `admin123`
   - You should see the admin dashboard

## Step 5: Test the RAG Chatbot

### Upload Training Documents

1. Login to admin panel
2. Go to "Documents" section
3. Upload a PDF, DOC, or TXT file with hotel information
4. Wait for processing to complete

### Test the Chatbot

1. Go back to the homepage
2. Click "Chat with Concierge"
3. Ask questions like:
   - "What rooms are available?"
   - "What amenities do you offer?"
   - "What is your check-in time?"

The chatbot will use RAG to answer based on your uploaded documents and room data.

## Common Issues

### Backend won't start

- Check that Python 3.11+ is installed: `python --version`
- Ensure virtual environment is activated
- Verify all dependencies are installed: `pip list`
- Check `.env` file has correct credentials

### Frontend build errors

- Delete `node_modules` and `package-lock.json`, then run `npm install` again
- Check that Node.js 18+ is installed: `node --version`
- Verify `.env.local` file exists and has correct values

### Database connection errors

- Verify your Supabase project is active
- Check DATABASE_URL format is correct
- Ensure pgvector extension is enabled
- Verify migrations have been run

### OpenAI API errors

- Verify your OpenAI API key is valid
- Check you have credits available in your OpenAI account
- Ensure the key has access to GPT-4 and embeddings models

## Production Deployment

### Environment Variables

Never commit `.env` or `.env.local` files. Always use environment variables in production.

### Database

Use Supabase's production database with appropriate security rules.

### Backend

Deploy using:
- Docker (Dockerfile provided)
- Platform services like Heroku, Railway, or Render
- Cloud providers (AWS, GCP, Azure)

### Frontend

Deploy using:
- Vercel (recommended for Next.js)
- Netlify
- Any static hosting service

### Security Checklist

- [ ] Change default admin password
- [ ] Use strong JWT secret
- [ ] Enable HTTPS
- [ ] Set up proper CORS origins
- [ ] Review Supabase RLS policies
- [ ] Rate limit API endpoints
- [ ] Monitor OpenAI API usage

## Next Steps

1. Customize the hotel branding and styling
2. Add real room images
3. Integrate payment processing for bookings
4. Set up email notifications
5. Add more hotel documents for RAG training
6. Configure Google Maps for location
7. Set up analytics and monitoring

## Support

For issues or questions:
- Check the README.md
- Review API documentation at http://localhost:8000/docs
- Check backend logs for errors
- Review browser console for frontend issues
