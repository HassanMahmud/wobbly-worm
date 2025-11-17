# Snake Game - Full Stack Application

A classic Snake game built with modern web technologies, featuring user authentication, score tracking, and a leaderboard.

## Architecture

- **Frontend**: React with TypeScript + Vite
- **Backend**: .NET 8 with ASP.NET Core
- **Database**: SQL Server
- **Containerization**: Docker & Docker Compose
- **Orchestration**: Nginx (for production)

## Features

- User authentication (Login/Register)
- Guest mode for quick play
- Real-time game with canvas rendering
- Score tracking and persistent storage
- Global leaderboard (top 10 scores)
- Personal score history
- User statistics (total games, best score, average)
- Responsive UI with modern styling
- JWT-based authentication

## Project Structure

```
Snake/
├── backend/                 # .NET 8 Backend
│   ├── Controllers/        # API endpoints
│   ├── Models/            # Data models
│   ├── Services/          # Business logic
│   ├── Data/              # Database context
│   ├── SnakeGame.csproj   # Project file
│   └── Dockerfile         # Backend containerization
├── frontend/              # React TypeScript Frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── api.ts         # API client
│   │   ├── types.ts       # TypeScript definitions
│   │   ├── App.tsx        # Main app component
│   │   └── index.css      # Styles
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile         # Frontend containerization
├── docker-compose.yml     # Development configuration
├── docker-compose.prod.yml # Production configuration
├── nginx.conf            # Nginx reverse proxy config
├── api_spec.yaml         # OpenAPI specification
└── README.md            # This file
```

## Prerequisites

- Docker (v20.0+)
- Docker Compose (v1.29+)
- OR Node.js 20+ and .NET 8 SDK (for local development)

## Quick Start

### Using Docker (Recommended)

1. **Clone/Navigate to project directory**
   ```bash
   cd Snake
   ```

2. **Build and start services**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api
   - API Documentation: http://localhost:5000/swagger

4. **Stop services**
   ```bash
   docker-compose down
   ```

### Using Make Commands

```bash
# Build images
make build

# Start services
make up

# View logs
make logs

# Stop services
make down

# Clean everything
make clean

# Rebuild and restart
make rebuild

# View specific service logs
make backend-logs
make frontend-logs
make db-logs
```

## API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `POST /api/users/guest` - Create guest session
- `POST /api/users/verify` - Verify credentials
- `GET /api/users/{userId}` - Get user profile

### Scores
- `POST /api/scores` - Submit game score
- `GET /api/scores/top` - Get top 10 scores
- `GET /api/scores/user/{userId}` - Get user's scores

### Health
- `GET /api/health` - Health check

## Game Controls

- **Arrow Keys** or **WASD** - Move snake
- **Spacebar** - Pause/Resume game

## Game Mechanics

- Snake starts with 1 segment
- Each food eaten increases score by 10 points (+ 10 bonus per 3 foods eaten)
- Snake speed increases every 3 foods consumed
- Game ends on collision with walls or self
- Color changes when food is eaten

## User Stories Implementation

✅ User can login/register
✅ User can play as guest
✅ Pause game with spacebar
✅ Snake color changes when eating food
✅ View top 10 scores
✅ Snake speed increases with every 3 foods
✅ Save scores to database
✅ User authentication and verification

## Development

### Local Setup (Without Docker)

**Backend:**
```bash
cd backend
dotnet restore
dotnet run
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

Create a `.env` file in the project root:
```env
DB_PASSWORD=YourSecurePassword123
JWT_KEY=your-secret-jwt-key-change-in-production
```

## Production Deployment

1. **Update environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

2. **Start production stack**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Configure SSL** (optional, update nginx.conf)

## API Documentation

The API follows OpenAPI 3.0 specification. See `api_spec.yaml` for full documentation.

## Testing

### Backend
```bash
cd backend
dotnet test
```

### Frontend
```bash
cd frontend
npm test
```

## Database

The application uses SQL Server for data persistence. Database is automatically created on startup.

**Connection String**: `Server=db;Database=snakegame;User Id=sa;Password=YourPassword@123;Encrypt=false;`

## Architecture Decisions

1. **React + TypeScript**: Type-safe frontend development
2. **.NET Core**: Cross-platform, performant backend
3. **SQL Server**: Reliable database with good .NET integration
4. **Canvas API**: Optimized game rendering
5. **JWT**: Stateless authentication
6. **Docker**: Easy deployment and scaling
7. **Nginx**: Efficient reverse proxy and static file serving

## Security Considerations

- JWT tokens with 24-hour expiration
- Password hashing with BCrypt
- CORS configuration for API access
- HTTP-only cookies for token storage
- Input validation on both frontend and backend
- SQL injection prevention with parameterized queries

## Troubleshooting

**Database connection error**
```bash
# Check if database container is healthy
docker-compose ps
docker-compose logs db
```

**Port already in use**
```bash
# Change port mappings in docker-compose.yml
```

**Frontend API connection error**
```bash
# Verify REACT_APP_API_URL environment variable
# Check backend is running: curl http://localhost:5000/api/health
```

## Future Enhancements

- Multiplayer mode
- Different game difficulties
- Power-ups and obstacles
- Sound effects and animations
- Mobile app (React Native)
- WebSocket real-time multiplayer
- Admin dashboard
- Game replay system

## License

This project is provided as-is for educational purposes.

## Support

For issues or questions, refer to the API specification in `api_spec.yaml` or check Docker logs:
```bash
docker-compose logs -f
```
