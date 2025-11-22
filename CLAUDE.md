# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an emotion diary application combining mood tracking with AI-driven insights. The tech stack includes:
- **Frontend**: React + TypeScript with Brojs framework for micro-frontend architecture
- **Backend**: Express.js API with PostgreSQL database
- **AI**: LangChain + Gigachat integration (planned)
- **State Management**: Redux Toolkit with RTK Query for API caching

## Development Commands

### Starting the Application
```bash
# Start PostgreSQL + Redis services
docker-compose up -d

# Start development server (port 8099)
npm start

# Build for development
npm run build

# Build for production
npm run build:prod
```

### Code Quality
```bash
# Run ESLint
npm run eslint

# Auto-fix linting issues
npm run eslint:fix
```

### AI Development
```bash
# Start LangGraph development server
npm run langgraph
```

### Database
```bash
# Initialize database schema
docker-compose exec postgres psql -U emotion_diary -d emotion_diary -f /migrations/00-init.sql

# Access PostgreSQL shell
docker-compose exec postgres psql -U emotion_diary -d emotion_diary
```

## Architecture

### Frontend Structure (`/src`)

**Brojs Framework**: This project uses Brojs CLI, a micro-frontend framework. Key concepts:
- `bro.config.js` defines navigation and configuration values
- Use `getNavigationValue()` and `getConfigValue()` to access runtime config
- Pages are lazy-loaded via React.lazy()
- The app can be embedded in larger platforms

**State Management**:
- Uses Redux Toolkit with RTK Query (no traditional Redux slices needed)
- API state is cached automatically by RTK Query
- Store configuration in `src/__data__/store.ts`
- API endpoints defined in `src/__data__/api.ts`

**Component Organization**:
- `/pages` - Route components with data fetching logic
- `/layout` - Layout wrappers (header, etc.)
- `/components` - Reusable presentational components
- `/service` - Business logic and API services
- `/__data__` - Global state and API configuration

**Custom Hooks Pattern**: The codebase uses custom hooks to encapsulate complex logic (see `useGenerate.ts` for SSE handling)

### Backend Structure (`/stubs/api`)

**Modular Express Router**:
- `index.js` - Main router aggregating all modules
- `auth.js` - JWT authentication (register, login, refresh, logout)
- `checkins.js` - Mood check-in endpoints
- `diary.js` - Diary entry management
- `pet.js` - Virtual pet companion interactions
- `insights.js` - AI-powered analytics (Premium tier)
- `prompts.js` - Daily reflection prompts
- `subsctiptions.js` - Stripe subscription handling
- `swagger.js` - OpenAPI documentation setup

**Authentication**:
- JWT Bearer tokens required for protected endpoints
- Middleware: `authMiddleware` verifies tokens and attaches `req.user`
- User object includes: `{ id, email, tier }` where tier is 'free' or 'premium'
- Token expiry: 24h (refresh token: 7d)

**Premium vs Free Features**:
- Free: Basic mood check-ins, diary entries, pet companion
- Premium: AI insights, emotion statistics, trigger analysis, pet customization

### Database Schema (`/migrations/00-init.sql`)

**Core Tables**:
- `users` - User accounts with subscription tier
- `mood_checkins` - Daily mood tracking entries
- `diary_entries` - Personal journal (auto-compiled from checkins)
- `pets` - Virtual pet state (happiness decays over time)
- `user_streaks` - Tracks consecutive check-in days
- `emotional_insights` - Cached AI analysis results
- `reflection_prompts` / `reflection_responses` - Engagement prompts

**Important**: All queries must filter by `user_id` for data isolation

### AI Integration (In Progress)

**Current State**:
- Dependencies installed: `@langchain/langgraph`, `langchain-gigachat`, `@langchain/core`
- Configuration: `langgraph.json` points to `./stubs/api/agent.js:agent`
- Implementation: Not yet complete - insights endpoints use placeholders

**When Implementing AI**:
- Use LangChain for LLM orchestration
- Gigachat API for context-aware emotional analysis
- Stream responses to frontend via Server-Sent Events (SSE)
- Cache insights in `emotional_insights` table to reduce API calls

## Key Patterns & Conventions

### Server-Sent Events (SSE)
The codebase uses SSE for streaming content generation:
```typescript
// Service factory pattern
const SSEService = (resolveUrl) =>
  ({ onUpdate, onClose, onError }) =>
    (params) => { /* EventSource setup */ }
```

### Error Handling
**Frontend**: Use RTK Query loading/error states
```typescript
const { data, isLoading, error } = useGetAnalyticsQuery()
if (isLoading) return <Loader/>
if (error) return <Alert status='error'>...</Alert>
```

**Backend**: Use try/catch with Express error middleware
```javascript
router.get('/', async (req, res, next) => {
  try { /* logic */ }
  catch (err) { next(err) }
})
```

### API Documentation
- Swagger/OpenAPI specs via JSDoc annotations
- Access at `/api/api-docs` when server is running
- Tag endpoints by domain: Auth, Checkins, Diary, Pet, Insights, etc.

## Important Configuration

### Environment Variables
Required in production:
```
DATABASE_URL=postgresql://user:pass@localhost:5432/emotion_diary
JWT_SECRET=<strong-random-secret>
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
STRIPE_SECRET_KEY=sk_live_...
GIGACHAT_API_KEY=<sberbank-gigachat-key>
```

### Ports
- Frontend dev server: 8099 (Brojs)
- PostgreSQL: 5432
- Redis: 6379

### TypeScript Configuration
- `noImplicitAny: false` - Not using strict typing
- JSX mode: `react` (not react-jsx)
- Module resolution: node

## Frontend-Backend Communication

### API Base URL
Configured in `bro.config.js`:
```javascript
config: {
  'ui-sample-project.api': '/api',
  'ui-sample-project.analytic-api': '/api/analytics'
}
```

Access via `getConfigValue('ui-sample-project.api')`

### Authentication Flow
1. POST `/api/auth/register` or `/api/auth/login` to get JWT
2. Store token in localStorage/sessionStorage
3. Include in subsequent requests: `Authorization: Bearer <token>`
4. Refresh before expiry via `/api/auth/refresh`

## Common Development Tasks

### Adding a New API Endpoint
1. Create route in appropriate module (`/stubs/api/`)
2. Add authentication middleware if needed: `router.get('/', authMiddleware, ...)`
3. Add Swagger JSDoc annotations for documentation
4. Test with curl or Postman before frontend integration

### Adding a New Frontend Page
1. Create component in `/src/pages/`
2. Add route in `app.tsx` with lazy loading
3. Add navigation URL in `bro.config.js` navigations array
4. Update header links if needed

### Working with Mood Check-ins
- Emotion types are predefined in `emotions` table
- Check-ins automatically update `user_streaks` for gamification
- Pet happiness responds to check-in consistency
- Weekly insights are generated from past 7 days of check-ins

### Testing the API
Use the Swagger UI at `http://localhost:8099/api/api-docs` or:
```bash
# Register
curl -X POST http://localhost:8099/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","username":"test","password":"pass123"}'

# Login
curl -X POST http://localhost:8099/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123"}'

# Create check-in (use token from login)
curl -X POST http://localhost:8099/api/checkins \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"emotion_id":1,"intensity":7,"reflection_text":"Had a good day"}'
```

## Known TODOs & Gaps

1. **AI Integration**: LangGraph agent implementation needed (see `langgraph.json`)
2. **Gigachat API**: Connect actual Sberbank Gigachat in insights module
3. **Frontend Chat**: Backend integration pending (see TODO in `chat.tsx`)
4. **Stripe Integration**: Placeholder code needs actual Stripe SDK connection
5. **Testing**: No test files present - consider adding Jest/React Testing Library
6. **Error Boundaries**: React error handling not implemented
7. **Offline Support**: No service worker or offline-first sync

## Git Workflow

Main branch: `master`
Current branch: `feature/front-bootstrap`

When creating PRs, ensure:
- All ESLint errors are fixed (`npm run eslint:fix`)
- Database migrations are included if schema changed
- API documentation (Swagger) is updated for new endpoints
