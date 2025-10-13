# GymnaTech Quick Start Guide

Get GymnaTech running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- PostgreSQL installed and running

## Installation

```bash
# 1. Create database
createdb gymnastics_scoring

# 2. Setup backend
cd backend
npm install
cp .env.example .env
# Edit .env and set your DB_PASSWORD
npm run migrate
npm run seed
npm run dev

# 3. Setup frontend (in new terminal)
cd frontend
npm install
npm run dev
```

## Access

1. Open browser to: http://localhost:5173
2. Login with:
   - Email: `admin@gymnastech.com`
   - Password: `admin123`

## Usage Flow

### For Admins

1. **Create Event**
   - Dashboard → New Event button
   - Fill in event details (name, date, location)
   - Save

2. **Add Athletes**
   - Athletes menu → Create athlete
   - Enter athlete details
   - Register athletes for event

3. **Setup Performances**
   - Event details → Manage performances
   - Create performance entries for each athlete/apparatus

### For Judges

1. **Access Judge Panel**
   - Events → Select event → Judge Panel
   - Select apparatus

2. **Submit Scores**
   - Select performance from list
   - Choose score type (D-score or E-score)
   - Enter score value
   - Add comments if needed
   - Submit

### For Everyone

1. **View Leaderboard**
   - Events → Select event → Leaderboard
   - Select apparatus to filter
   - See real-time rankings

## Example: Complete Scoring Flow

```bash
# Step 1: Create an event as admin
POST /api/events
{
  "name": "Summer Championship",
  "event_date": "2024-08-15",
  "status": "scheduled"
}

# Step 2: Register athlete for event
POST /api/events/1/athletes
{
  "athlete_id": 1,
  "apparatus_ids": [1, 2, 3, 4]
}

# Step 3: Create performance
POST /api/scoring/performances
{
  "event_id": 1,
  "athlete_id": 1,
  "apparatus_id": 1
}

# Step 4: Judges submit scores
POST /api/scoring/scores
{
  "performance_id": 1,
  "score_type": "d_score",
  "score_value": 5.2
}

POST /api/scoring/scores
{
  "performance_id": 1,
  "score_type": "e_score",
  "score_value": 8.95
}

# Step 5: View leaderboard
GET /api/scoring/leaderboard/1
```

## Troubleshooting

**Can't connect to database?**
```bash
# Check PostgreSQL is running
psql --version
psql -U postgres -l

# Recreate database if needed
dropdb gymnastics_scoring
createdb gymnastics_scoring
cd backend && npm run migrate && npm run seed
```

**Port already in use?**
```bash
# Backend (3000)
lsof -i :3000
kill -9 <PID>

# Frontend (5173) - Vite auto-selects next port
```

**Login not working?**
```bash
# Re-seed database
cd backend
npm run seed
```

## Key Features

✅ Multi-judge scoring with automatic averaging  
✅ Real-time leaderboard updates  
✅ D-score + E-score calculation  
✅ Automatic high/low score dropping  
✅ Role-based access (admin, judge, official, athlete, public)  
✅ Audit trail for all score submissions  
✅ WebSocket real-time updates  
✅ Configurable scoring rules  

## Project Structure

```
gym/
├── backend/          # Express API + PostgreSQL
├── frontend/         # React + Vite + Tailwind
├── README.md         # Full documentation
├── SETUP.md          # Detailed setup guide
└── API_DOCUMENTATION.md  # API reference
```

## Default Credentials

| Role     | Email                    | Password  |
|----------|--------------------------|-----------|
| Admin    | admin@gymnastech.com     | admin123  |

**Create more users via the UI or API after logging in!**

## Next Steps

- [Full Documentation](README.md)
- [Setup Guide](SETUP.md)
- [API Documentation](API_DOCUMENTATION.md)
- Create your first event
- Add judges and athletes
- Start scoring!

## Support

For issues or questions, refer to the documentation or check the code comments.

---

Happy Scoring! 🏆


