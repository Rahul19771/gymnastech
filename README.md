# GymnaTech

<div align="center">

## Professional Gymnastics Scoring Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql&logoColor=white)](https://www.postgresql.org/)

A comprehensive, real-time scoring system for Women's Artistic Gymnastics events, built with modern web technologies and designed for accuracy, transparency, and scalability.

[Features](#features) • [Quick Start](#installation--setup) • [Documentation](#project-structure) • [Contributing](CONTRIBUTING.md)

</div>

---

## Features

✅ **Multi-Judge Scoring System**
- Simultaneous score input from multiple judges
- Support for D-score (Difficulty) and E-score (Execution)
- Automatic calculation with highest/lowest score dropping
- Real-time score updates via WebSockets

✅ **Event Management**
- Create and manage gymnastics events
- Register athletes for competitions
- Assign judges to apparatus
- Track performance status

✅ **Role-Based Access Control**
- **Admin**: Full system access, user management, configuration
- **Judge**: Submit scores, add comments and penalties
- **Official**: Monitor scores, publish results, manage events
- **Athlete/Public**: View live results and leaderboards

✅ **Real-Time Updates**
- Live leaderboard updates
- Score submission notifications
- WebSocket-based communication

✅ **Apparatus Support**
- Vault (VT)
- Uneven Bars (UB)
- Balance Beam (BB)
- Floor Exercise (FX)

✅ **Scoring System (FIG 2025-2028)**
- D-score: Sum of 8 most difficult elements
- E-score: Starting from 10.0, with deductions
- Final Score = D-score + E-score - Neutral Deductions
- Configurable scoring rules per apparatus

✅ **Audit Trail**
- Complete logging of all score submissions
- Track changes and modifications
- Transparency for reviews and appeals

## Tech Stack

### Backend
- **Node.js** with **Express.js**
- **TypeScript** for type safety
- **PostgreSQL** for data persistence
- **Socket.io** for real-time updates
- **JWT** authentication
- **bcrypt** for password hashing

### Frontend
- **React 18** with **TypeScript**
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Router** for navigation
- **Axios** for API calls
- **Socket.io Client** for real-time updates

## Project Structure

```
gym/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── config/         # Database and configuration
│   │   ├── database/       # Schema and migrations
│   │   ├── middleware/     # Auth and validation
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Helper functions
│   │   └── server.ts       # Main server file
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API and Socket services
│   │   ├── stores/        # Zustand stores
│   │   ├── types/         # TypeScript types
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   ├── package.json
│   └── vite.config.ts
│
├── package.json            # Root package.json (monorepo)
└── README.md              # This file
```

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Database Setup

1. Install PostgreSQL and create a database:
```bash
createdb gymnastics_scoring
```

2. Configure database credentials:
```bash
# In backend directory, create .env file
cd backend
cp .env.example .env
# Edit .env with your database credentials
```

### Backend Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Run database migrations:
```bash
npm run migrate
```

3. Seed initial data (apparatus, admin user, scoring rules):
```bash
npm run seed
```

4. Start the backend server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Configure API endpoint:
```bash
# Create .env file
cp .env.example .env
# Edit if needed (default points to localhost:3000)
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Running Both Servers

From the root directory:
```bash
npm run dev
```

This will start both backend and frontend concurrently.

## Default Credentials

After seeding, you can login with:
- **Email**: `admin@gymnastech.com`
- **Password**: `admin123`

**⚠️ Important**: Change this password in production!

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Events
- `GET /api/events` - List all events
- `POST /api/events` - Create event (admin/official)
- `GET /api/events/:id` - Get event details
- `PUT /api/events/:id` - Update event (admin/official)
- `GET /api/events/:id/athletes` - Get event athletes
- `POST /api/events/:id/athletes` - Register athlete (admin/official)

### Athletes
- `GET /api/athletes` - List all athletes
- `POST /api/athletes` - Create athlete (admin/official)
- `GET /api/athletes/:id` - Get athlete details
- `PUT /api/athletes/:id` - Update athlete (admin/official)

### Scoring
- `GET /api/scoring/performances/event/:eventId` - Get performances
- `POST /api/scoring/performances` - Create performance (admin/official)
- `POST /api/scoring/scores` - Submit score (judge/admin)
- `GET /api/scoring/scores/performance/:id` - Get scores for performance
- `GET /api/scoring/leaderboard/:eventId` - Get leaderboard
- `POST /api/scoring/publish` - Publish scores (admin/official)

### Apparatus
- `GET /api/apparatus` - List apparatus

### Configuration
- `GET /api/config/scoring-rules` - Get scoring rules
- `POST /api/config/scoring-rules` - Create scoring rule (admin)
- `PUT /api/config/scoring-rules/:id` - Update scoring rule (admin)
- `GET /api/config/apparatus-config/:id` - Get apparatus config
- `PUT /api/config/apparatus-config/:id` - Update apparatus config (admin)

## Scoring Algorithm

The system implements FIG Women's Artistic Gymnastics scoring rules:

### D-Score (Difficulty Score)
- Sum of 8 most difficult elements (including dismount)
- Open-ended, no maximum
- Includes connection value and composition requirements

### E-Score (Execution Score)
- Starts at 10.0 per judge
- Deductions for execution faults, artistry, composition
- Multiple judges (typically 4) submit scores
- Highest and lowest scores are dropped
- Remaining scores are averaged

### Final Score Calculation
```
Final Score = D-Score + E-Score (averaged) - Neutral Deductions
```

### Neutral Deductions
- Out of bounds: 0.1 - 0.3
- Time violations: 0.1
- Coach assistance: 0.5
- Other rule violations

## Real-Time Features

The system uses WebSocket connections for real-time updates:

1. **Score Updates**: When a judge submits a score, it's instantly broadcast to:
   - Event organizers
   - Other judges (for awareness)
   - Leaderboard displays
   - Public viewers

2. **Leaderboard Updates**: Rankings update automatically when:
   - New scores are submitted
   - Scores are recalculated
   - Scores are published officially

3. **Performance Status**: Real-time notifications for:
   - Performance starting
   - Scoring in progress
   - Scoring complete
   - Results published

## Future Enhancements

- 📱 Mobile apps (iOS/Android) with React Native
- 🎥 Video integration for performance review
- 📊 Advanced analytics and reporting
- 📄 PDF/Excel export functionality
- 🏆 Men's Artistic Gymnastics support
- 🎪 Rhythmic, Trampoline, and Acrobatic Gymnastics
- 🔧 Custom scoring rule configurations per competition
- 🌐 Multi-language support
- 📺 Hardware scoreboard integration
- ☁️ Cloud deployment and scalability

## Database Schema

### Key Tables
- **users**: Authentication and role management
- **athletes**: Competitor information
- **events**: Competition events
- **apparatus**: Gymnastics apparatus definitions
- **performances**: Individual athlete performances
- **scores**: Judge score submissions
- **final_scores**: Calculated results
- **scoring_rules**: Configurable scoring parameters
- **audit_log**: Complete audit trail

## Security

- JWT-based authentication
- Bcrypt password hashing
- Role-based access control (RBAC)
- SQL injection prevention (parameterized queries)
- XSS protection
- CORS configuration
- Helmet.js security headers

## Development

### Backend Development
```bash
cd backend
npm run dev     # Start with hot reload
npm run build   # Build for production
npm run start   # Start production server
```

### Frontend Development
```bash
cd frontend
npm run dev     # Start dev server
npm run build   # Build for production
npm run preview # Preview production build
```

## Testing

```bash
# Backend tests (when implemented)
cd backend
npm test

# Frontend tests (when implemented)
cd frontend
npm test
```

## Deployment

### Backend Deployment
1. Set environment variables for production
2. Build the TypeScript code: `npm run build`
3. Set up PostgreSQL database
4. Run migrations: `npm run migrate`
5. Start server: `npm start`

### Frontend Deployment
1. Set production API URL in `.env`
2. Build: `npm run build`
3. Deploy `dist` folder to static hosting (Vercel, Netlify, etc.)

### Database Deployment
- Use managed PostgreSQL (AWS RDS, Heroku Postgres, etc.)
- Ensure secure connection strings
- Regular backups recommended

## Contributing

This is a comprehensive gymnastics scoring system. Contributions are welcome for:
- Bug fixes
- New features
- Documentation improvements
- Test coverage
- Performance optimizations

## License

This project is provided as-is for gymnastics competition management.

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Contributors

Thank you to all contributors who help make GymnaTech better!

<!-- Add contributors here -->

## Support

- 📖 [Documentation](README.md)
- 🐛 [Report Bug](https://github.com/YOUR_USERNAME/gymnastech/issues/new?template=bug_report.md)
- 💡 [Request Feature](https://github.com/YOUR_USERNAME/gymnastech/issues/new?template=feature_request.md)
- 💬 [Discussions](https://github.com/YOUR_USERNAME/gymnastech/discussions)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- FIG (Fédération Internationale de Gymnastique) for the official scoring rules
- The gymnastics community for inspiration and feedback
- All contributors and supporters of this project

---

<div align="center">

**GymnaTech** - Built with ❤️ for the gymnastics community

[![GitHub stars](https://img.shields.io/github/stars/YOUR_USERNAME/gymnastech?style=social)](https://github.com/YOUR_USERNAME/gymnastech/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/YOUR_USERNAME/gymnastech?style=social)](https://github.com/YOUR_USERNAME/gymnastech/network/members)

</div>

