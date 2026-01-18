# Quick Start Commands

## First Time Setup

### 1. Install Dependencies

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..

# Frontend
cd frontend
npm install
cd ..
```

### 2. Configure Environment

```bash
# Backend - create .env file with your credentials
cp backend/.env.example backend/.env
# Edit backend/.env with your Supabase and OpenAI credentials

# Frontend - create .env.local file
cp frontend/.env.local.example frontend/.env.local
# Edit frontend/.env.local with your API URL and Supabase credentials
```

### 3. Setup Database

1. Create Supabase project at https://supabase.com
2. Enable pgvector extension in SQL Editor:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
3. Run the migration script from `database/migrations/001_initial_schema.sql`

## Running the Application

### Option 1: Run Both Services Separately

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Option 2: Using Docker Compose

```bash
# Make sure Docker is installed and running
docker-compose up --build
```

## Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Admin Panel**: http://localhost:3000/admin/login

## Default Admin Credentials

- Email: `admin@hotel.com`
- Password: `admin123`

**⚠️ Important: Change these credentials in production!**

## Testing the RAG Chatbot

1. Login to admin panel
2. Go to Documents section
3. Upload a hotel policy PDF or information document
4. Wait for processing to complete
5. Go back to homepage and click "Chat with Concierge"
6. Ask questions about the hotel

## Common Commands

### Backend

```bash
# Start backend
cd backend && uvicorn app.main:app --reload

# Run with specific host/port
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Install new dependency
pip install package_name
pip freeze > requirements.txt
```

### Frontend

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Database

```bash
# Connect to Supabase PostgreSQL
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Run migration
psql -f database/migrations/001_initial_schema.sql
```

## Troubleshooting

### Backend Issues

```bash
# Check Python version (need 3.11+)
python --version

# Recreate virtual environment
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Check if backend is running
curl http://localhost:8000/health
```

### Frontend Issues

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check Node version (need 18+)
node --version
```

### Database Issues

- Verify Supabase project is active
- Check DATABASE_URL in .env is correct
- Ensure pgvector extension is enabled
- Verify migrations have been run

## Development Workflow

1. Make code changes
2. Backend auto-reloads with `--reload` flag
3. Frontend hot-reloads automatically
4. Test in browser at http://localhost:3000
5. Check API docs at http://localhost:8000/docs

## Production Deployment

See `SETUP_GUIDE.md` for detailed production deployment instructions.
