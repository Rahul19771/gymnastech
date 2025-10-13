# GymnaTech Setup Guide

## Quick Start

### 1. Prerequisites

Install the following on your system:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
- **Git** (optional) - [Download](https://git-scm.com/)

### 2. Database Setup

#### macOS/Linux
```bash
# Start PostgreSQL (if not running)
brew services start postgresql  # macOS with Homebrew
# or
sudo service postgresql start   # Linux

# Create database
createdb gymnastics_scoring

# Verify connection
psql gymnastics_scoring
```

#### Windows
```bash
# Use pgAdmin or command prompt
# Create database named: gymnastics_scoring
```

### 3. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your database credentials
# At minimum, set:
# - DB_PASSWORD=your_postgres_password
# - JWT_SECRET=your_random_secret_key

# Run database migrations
npm run migrate

# Seed initial data (apparatus, admin user, rules)
npm run seed

# Start development server
npm run dev
```

Backend should now be running at `http://localhost:3000`

### 4. Frontend Setup

```bash
# Open new terminal
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file (optional, uses defaults)
cp .env.example .env

# Start development server
npm run dev
```

Frontend should now be running at `http://localhost:5173`

### 5. Access the Application

1. Open browser to `http://localhost:5173`
2. Login with default credentials:
   - Email: `admin@gymnastech.com`
   - Password: `admin123`

## Detailed Configuration

### Environment Variables

#### Backend (.env)
```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gymnastics_scoring
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

### Database Schema

The database includes these main tables:
- `users` - User accounts and roles
- `athletes` - Athlete information
- `events` - Competition events
- `apparatus` - Gymnastics apparatus
- `performances` - Individual performances
- `scores` - Judge scores
- `final_scores` - Calculated results
- `scoring_rules` - Configurable rules
- `audit_log` - Audit trail

### Seeded Data

After running `npm run seed`, you'll have:

1. **Apparatus** (Women's Artistic Gymnastics):
   - Vault (VT)
   - Uneven Bars (UB)
   - Balance Beam (BB)
   - Floor Exercise (FX)

2. **Admin User**:
   - Email: admin@gymnastics.com
   - Password: admin123
   - Role: admin

3. **Scoring Rules**:
   - FIG WAG Code 2025-2028 for all apparatus

## Creating Additional Users

### Via API (after login)

```bash
# Login first to get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@gymnastech.com",
    "password": "admin123"
  }'

# Use returned token to create new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "email": "judge1@example.com",
    "password": "password123",
    "first_name": "Jane",
    "last_name": "Judge",
    "role": "judge"
  }'
```

### Via Database

```sql
-- Connect to database
psql gymnastics_scoring

-- Insert user (password: 'password123' hashed with bcrypt)
INSERT INTO users (email, password_hash, first_name, last_name, role)
VALUES (
  'judge1@example.com',
  '$2a$10$YourBcryptHashHere',
  'Jane',
  'Judge',
  'judge'
);
```

## Troubleshooting

### Port Already in Use

**Backend (Port 3000)**:
```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process or change PORT in backend/.env
```

**Frontend (Port 5173)**:
```bash
# Vite will automatically try next available port
# Or specify port in vite.config.ts
```

### Database Connection Failed

1. Verify PostgreSQL is running:
```bash
psql --version
psql -U postgres -l
```

2. Check credentials in `backend/.env`
3. Ensure database exists: `createdb gymnastics_scoring`
4. Check PostgreSQL logs for errors

### Cannot Login

1. Verify backend is running: `curl http://localhost:3000/api/health`
2. Check if user was seeded: `npm run seed` in backend
3. Verify frontend API URL in `frontend/.env`
4. Check browser console for errors

### Real-time Updates Not Working

1. Verify WebSocket connection in browser Network tab
2. Check CORS settings in backend
3. Ensure Socket.io ports are not blocked by firewall

## Running in Production

### Backend Production Build

```bash
cd backend

# Build TypeScript
npm run build

# Set production environment variables
export NODE_ENV=production
export DB_PASSWORD=your_secure_password
export JWT_SECRET=your_secure_secret

# Run production server
npm start
```

### Frontend Production Build

```bash
cd frontend

# Set production API URL
echo "VITE_API_URL=https://your-api-domain.com/api" > .env
echo "VITE_SOCKET_URL=https://your-api-domain.com" >> .env

# Build
npm run build

# Preview build locally
npm run preview

# Deploy dist/ folder to your hosting service
```

### Recommended Hosting

**Backend**:
- Heroku
- Railway
- DigitalOcean App Platform
- AWS Elastic Beanstalk
- Google Cloud Run

**Frontend**:
- Vercel (recommended)
- Netlify
- Cloudflare Pages
- AWS Amplify

**Database**:
- Heroku Postgres
- AWS RDS
- DigitalOcean Managed PostgreSQL
- Supabase

## Next Steps

1. ✅ Change default admin password
2. ✅ Create judge accounts for your competition
3. ✅ Create event/competition
4. ✅ Register athletes
5. ✅ Assign judges to apparatus
6. ✅ Start scoring!

For more information, see [README.md](./README.md)


