# Personal Diary & Emotional Tracking System - 2-Week Implementation Roadmap

## EXECUTIVE OVERVIEW

This document outlines the complete specification for a gamified personal diary application built with React (frontend), Golang (backend), and powered by Sberbank Gigachat AI. Designed to launch in 2 weeks with Claude Code + AI agents.

---

## SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                           │
│                   (React 18 + TypeScript)                        │
├─────────────────────────────────────────────────────────────────┤
│  Components:                                                     │
│  ├─ Auth: LoginForm, RegisterForm, ProtectedRoute              │
│  ├─ CheckIn: EmotionSelector, IntensitySlider, QuickCheckIn    │
│  ├─ Pet: PetDisplay, PetAnimation, PetInteraction, Customizer  │
│  ├─ Diary: DiaryTimeline, DiaryEntry, MonthlyHeatmap, Editor   │
│  ├─ Insights: WeeklyInsight, MoodTriggers, Recommendations      │
│  └─ Premium: UpgradeCard, SubscriptionManager, ExportModal      │
│                                                                  │
│  State (Brojs):                                                  │
│  ├─ userStore: Auth, subscription tier, profile                │
│  ├─ checkinStore: Moods, streaks, today's data                 │
│  ├─ diaryStore: Entries, filters, pagination                   │
│  ├─ petStore: Pet state, happiness, dialogue                   │
│  └─ uiStore: Modals, notifications, loading states             │
│                                                                  │
│  Styling: Emotion CSS-in-JS + Framer Motion animations         │
└────────────┬─────────────────────────────────────────────────────┘
             │ HTTP/HTTPS (Axios)
             ↓
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY (CORS)                          │
├─────────────────────────────────────────────────────────────────┤
│  Port: 8080 | Base: /api/v1 | JWT Auth | Rate Limiting         │
└────────────┬─────────────────────────────────────────────────────┘
             │
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND LAYER                               │
│                   (Golang + Gin Framework)                       │
├─────────────────────────────────────────────────────────────────┤
│  API Routes:                                                     │
│  ├─ /auth: {register, login, refresh, logout}                   │
│  ├─ /checkins: {POST, GET, GET/:date, GET:/stats}              │
│  ├─ /diary: {POST, GET, PUT/:id, DELETE/:id, GET:/monthly}     │
│  ├─ /pet: {GET, POST:/feed, POST:/pet, POST:/talk, PUT:/name}  │
│  ├─ /insights: {GET:/weekly, GET:/triggers, GET:/recommendations}
│  ├─ /prompts: {GET:/daily, POST/:id/response, GET:/responses}  │
│  └─ /subscriptions: {POST:/create, GET:/status, POST:/cancel}  │
│                                                                  │
│  Services:                                                       │
│  ├─ auth: JWT generation, password hashing, token refresh      │
│  ├─ checkin: Mood logging, streak tracking, statistics         │
│  ├─ diary: Entry creation, compilation, tag management         │
│  ├─ pet: State management, happiness calculations, interactions│
│  ├─ ai: Gigachat integration, insights generation              │
│  └─ subscription: Stripe integration, tier management          │
│                                                                  │
│  Middleware:                                                     │
│  ├─ CORS: localhost:3000, production domain                    │
│  ├─ Auth: JWT validation & extraction                          │
│  ├─ RateLimit: Redis-backed (100 req/min per user)             │
│  ├─ Logging: Structured JSON logs (zap)                        │
│  └─ Recovery: Panic recovery & error handling                  │
└────────────┬──────────────────┬────────────┬──────────────────────┘
             │                  │            │
    ┌────────↓────────┐  ┌──────↓──────┐  ┌─────↓────────┐
    │   PostgreSQL    │  │   Redis     │  │  Gigachat    │
    │   Database      │  │   Cache     │  │  (Sberbank)  │
    │   :5432         │  │   :6379     │  │  (OAuth 2.0) │
    └─────────────────┘  └─────────────┘  └──────────────┘
             │
    Tables:  │ ├─ users
             │ ├─ emotions
             │ ├─ mood_checkins
             │ ├─ diary_entries
             │ ├─ diary_entry_tags
             │ ├─ tags
             │ ├─ pets
             │ ├─ pet_interactions
             │ ├─ user_streaks
             │ ├─ subscriptions
             │ ├─ emotional_insights
             │ ├─ reflection_prompts
             │ ├─ reflection_responses
             │ └─ user_preferences
```

---

## PHASE 1: FOUNDATION (Days 1-2)

### Day 1 Morning: Backend Bootstrap
- [ ] Use Prompt B1 with Claude Code to generate:
  - `cmd/api/main.go` - Server entry point
  - `internal/config/config.go` - Environment setup
  - `internal/db/postgres.go` - Database connection
  - `internal/auth/service.go` - JWT + password hashing
  - `pkg/logger/logger.go` - Structured logging
  - `pkg/errors/errors.go` - Error types

**Time: 2-3 hours**

### Day 1 Afternoon: Database & Auth API
- [ ] Use Prompt B4 with Claude Code to generate database migrations
- [ ] Use Prompt B1 auth handler to create `/auth/*` endpoints
- [ ] Test with curl: `POST /api/v1/auth/register`

**Time: 2-3 hours**

### Day 2 Morning: Frontend Bootstrap
- [ ] Use Prompt F1 with Claude Code to generate React app structure
- [ ] Use Prompt F2 to set up Brojs store architecture
- [ ] Create `/src/components`, `/src/hooks`, `/src/store` directories

**Time: 2-3 hours**

### Day 2 Afternoon: Authentication UI
- [ ] Use Prompt F3 with Claude Code to generate auth components
- [ ] Implement `LoginForm`, `RegisterForm`, `ProtectedRoute`
- [ ] Test auth flow: register → login → redirect to dashboard

**Time: 2-3 hours**

**Deliverable End of Day 2:**
- ✓ Backend running on :8080 with auth endpoints
- ✓ Frontend running on :3000 with login/register pages
- ✓ JWT tokens issued and stored in localStorage
- ✓ Protected routes working

---

## PHASE 2: CORE FEATURES (Days 3-7)

### Days 3-4: Mood Check-in & Database
- [ ] Use Prompt B2 with Claude Code to generate check-in endpoints
- [ ] Use Prompt B3 to implement Gigachat integration
- [ ] Use Prompt F4 to generate QuickCheckIn component
- [ ] Connect frontend to backend API

**Features:**
- POST `/api/v1/checkins` - Log mood
- GET `/api/v1/checkins` - Fetch user's moods
- Emotion selector UI with 6 emotions
- Intensity slider (1-10)
- Optional reflection text

**Time: 3-4 hours**

### Days 5-6: Diary & Pet System
- [ ] Use Prompt B5 to generate diary endpoints
- [ ] Use Prompt F5 to generate PetDisplay component
- [ ] Use Prompt F6 to generate DiaryTimeline component
- [ ] Connect diary frontend to API

**Features:**
- POST `/api/v1/diary/entries` - Create entry
- GET `/api/v1/diary` - Fetch entries with pagination
- Virtual pet display with mood states
- Diary timeline with filter/search
- Monthly heat map view

**Time: 4-5 hours**

### Days 7: Gamification & Streaks
- [ ] Implement streak logic in checkinStore
- [ ] Add pet happiness decay (background job)
- [ ] Create achievement badge system
- [ ] Test end-to-end: check-in → pet reaction → streak update

**Time: 2-3 hours**

**Deliverable End of Day 7:**
- ✓ Complete mood tracking workflow
- ✓ Pet responds to user actions
- ✓ Diary entries auto-compile from moods
- ✓ 7-day streaks tracked and rewarded

---

## PHASE 3: AI & PREMIUM (Days 8-10)

### Day 8: Gigachat Integration
- [ ] Use Prompt B3 fully to implement AI service
- [ ] Generate weekly insights via Gigachat
- [ ] Generate pet dialogue contextually
- [ ] Use Prompt F7 to create InsightsPage component

**Features:**
- Weekly mood summary from AI
- Mood trigger analysis
- Personalized wellness recommendations
- Cute pet responses via AI

**Time: 3-4 hours**

### Day 9: Premium Subscription
- [ ] Use Prompt B5 to implement subscription endpoints
- [ ] Integrate Stripe payment processing
- [ ] Use Prompt F7 to create SubscriptionManager component
- [ ] Implement premium feature gating

**Features:**
- `/api/v1/subscriptions/create` - Create subscription
- Premium tier display
- Insights locked behind paywall
- Export functionality (premium only)

**Time: 3-4 hours**

### Day 10: Reflection Prompts
- [ ] Create reflection prompts endpoints in backend
- [ ] Generate daily prompts (contextual or random)
- [ ] Create prompt response UI
- [ ] Link responses to diary entries

**Features:**
- Daily reflection prompt (e.g., "What challenged you?")
- User responses stored
- Responses auto-link to diary entries
- Prompt history browsable

**Time: 2-3 hours**

**Deliverable End of Day 10:**
- ✓ AI-powered insights operational
- ✓ Premium subscription flow working
- ✓ Stripe webhook handling payments
- ✓ Reflection prompts generate narrative depth

---

## PHASE 4: POLISH & DEPLOYMENT (Days 11-14)

### Days 11-12: Testing & Bug Fixes
- [ ] Test authentication flow (register, login, token refresh)
- [ ] Test mood logging (offline sync, online sync)
- [ ] Test diary entry creation and viewing
- [ ] Test pet interactions
- [ ] Test AI insight generation
- [ ] Test premium features (require subscription)
- [ ] Performance: ensure API response <200ms
- [ ] UI: test mobile responsiveness

**Tools:**
- Postman/Insomnia for API testing
- Playwright/Cypress for UI tests
- Lighthouse for performance

**Time: 4-6 hours**

### Days 13: Docker & Deployment
- [ ] Use Prompt D1 to generate Docker setup
- [ ] Create docker-compose.yml for local dev
- [ ] Build backend Dockerfile (multi-stage)
- [ ] Build frontend Dockerfile (Vite + nginx)
- [ ] Test docker-compose up locally
- [ ] Deploy to cloud (AWS/DigitalOcean/Render)

**Time: 3-4 hours**

### Day 14: Monitoring & Documentation
- [ ] Set up error tracking (Sentry)
- [ ] Set up analytics (Mixpanel/PostHog)
- [ ] Create API documentation (Swagger/OpenAPI)
- [ ] Document deployment process
- [ ] Create user guide/FAQ
- [ ] Security review: HTTPS, CORS, GDPR compliance

**Time: 2-3 hours**

**Deliverable End of Day 14:**
- ✓ Production-ready application
- ✓ Deployed and accessible
- ✓ Monitored and logged
- ✓ Documented for future development

---

## TECHNOLOGY STACK SUMMARY

### Frontend
```
React 18 + TypeScript (strict mode)
├─ State: Brojs (lightweight Redux-like)
├─ Animations: Framer Motion
├─ Styling: Emotion (CSS-in-JS)
├─ HTTP: Axios
├─ Routing: React Router v6
├─ Build: Vite
└─ Runtime: Node 20 LTS
```

### Backend
```
Golang 1.21
├─ Framework: Gin v1.9+ (REST API)
├─ Database: PostgreSQL 15 (pgx driver)
├─ Cache: Redis 7 (rate limiting, token refresh)
├─ Logging: zap (structured JSON logging)
├─ Auth: JWT (golang-jwt)
├─ Password: bcrypt
├─ Config: dotenv
└─ Deploy: Docker + docker-compose
```

### External Services
```
├─ AI: Sberbank Gigachat API (OAuth 2.0)
├─ Payments: Stripe API
├─ Monitoring: Sentry (error tracking)
├─ Analytics: Mixpanel or PostHog
└─ Hosting: AWS/DigitalOcean/Render
```

---

## API ENDPOINTS CHECKLIST

### Authentication
- [ ] `POST /api/v1/auth/register` - Create account
- [ ] `POST /api/v1/auth/login` - Get JWT token
- [ ] `POST /api/v1/auth/refresh` - Refresh token (30-min expiry)
- [ ] `POST /api/v1/auth/logout` - Revoke token

### Mood Check-ins
- [ ] `POST /api/v1/checkins` - Log mood (emotion_id, intensity, reflection)
- [ ] `GET /api/v1/checkins` - Get user's moods (paginated)
- [ ] `GET /api/v1/checkins/daily/:date` - Get specific day's moods
- [ ] `GET /api/v1/checkins/stats?days=7` - Emotion distribution (premium)

### Diary Entries
- [ ] `POST /api/v1/diary/entries` - Create/update entry
- [ ] `GET /api/v1/diary?tags=1,2,3` - Get entries with filters
- [ ] `PUT /api/v1/diary/entries/:id` - Update entry
- [ ] `DELETE /api/v1/diary/entries/:id` - Delete entry
- [ ] `GET /api/v1/diary/monthly?year=2025&month=1` - Heat map data

### Pet
- [ ] `GET /api/v1/pet` - Get pet state
- [ ] `POST /api/v1/pet/feed` - Feed pet, get response
- [ ] `POST /api/v1/pet/talk` - Talk to pet
- [ ] `POST /api/v1/pet/pet` - Pet it
- [ ] `PUT /api/v1/pet/name` - Rename pet
- [ ] `POST /api/v1/pet/customize` - Apply cosmetic skin

### Insights (Premium)
- [ ] `GET /api/v1/insights/weekly` - AI-generated summary
- [ ] `GET /api/v1/insights/triggers` - Mood trigger analysis
- [ ] `GET /api/v1/insights/recommendations` - Personalized advice

### Prompts
- [ ] `GET /api/v1/prompts/daily` - Get today's prompt
- [ ] `POST /api/v1/prompts/:id/response` - Submit response
- [ ] `GET /api/v1/prompts/responses` - Get user's responses

### Subscriptions
- [ ] `POST /api/v1/subscriptions/create` - Create subscription (Stripe)
- [ ] `GET /api/v1/subscriptions/status` - Get current tier
- [ ] `POST /api/v1/subscriptions/cancel` - Cancel subscription
- [ ] `POST /api/v1/subscriptions/webhook` - Stripe webhook handler

### Export
- [ ] `GET /api/v1/export/diary` - Export as JSON
- [ ] `GET /api/v1/export/pdf` - Export as PDF (premium)

---

## CLAUDE CODE PROMPT EXECUTION ORDER

### Backend Prompts (Sequential)
```
1. Prompt B1 → Basic server scaffold + auth service
2. Prompt B4 → Database migrations + schema
3. Prompt B2 → Check-in endpoints + service
4. Prompt B3 → Gigachat AI integration
5. Prompt B5 → Diary + Pet endpoints
6. Prompt D1 → Docker setup
```

### Frontend Prompts (Sequential)
```
1. Prompt F1 → React bootstrap + Vite config
2. Prompt F2 → Brojs store architecture
3. Prompt F3 → Auth UI components
4. Prompt F4 → Quick check-in component
5. Prompt F5 → Pet companion component
6. Prompt F6 → Diary timeline + entries
7. Prompt F7 → Insights + premium features
```

### Integration & Deployment (Sequential)
```
1. Prompt D1 → Docker compose
2. Manual: docker-compose up, test health checks
3. Manual: Deploy frontend + backend to cloud
4. Manual: Configure CI/CD pipeline (GitHub Actions)
```

---

## KEY METRICS & SUCCESS CRITERIA

### Performance
- API response time: <200ms (p95)
- Frontend first paint: <1s
- Database query time: <100ms
- Gigachat API calls: <5s timeout

### Scalability
- Support 50k concurrent users (via horizontal scaling)
- 1 billion moods tracked (via PostgreSQL + archival)
- 10k requests/sec capacity (via load balancing)

### Reliability
- 99.9% uptime (platform SLA)
- Automatic failover for database
- Error tracking + alerting (Sentry)
- Log retention: 30 days

### User Engagement
- 7-day retention: >60%
- Daily active users: >30% of registered
- Average session: >5 minutes
- Premium conversion: >5%

---

## MONETIZATION MODEL

### Freemium Tier (Free)
- Unlimited mood logging
- Basic diary entries
- Pet companion with limited cosmetics
- 7-day analytics

### Premium Tier ($4.99/month)
- AI-generated weekly insights
- Mood trigger analysis
- Personalized recommendations
- Export to PDF/JSON
- Unlimited pet cosmetics
- Remove ads (if applicable)

### Premium Annual ($49.99/year)
- 17% discount vs. monthly
- Everything in Premium

---

## FUTURE ENHANCEMENTS (Phase 2)

1. **Social Features**
   - Share emotional journey (anonymized)
   - Mood challenges with friends
   - Group diary (couples, families, teams)

2. **Mobile Apps**
   - React Native or Flutter version
   - Push notifications
   - Wearable integration (Apple Watch, Fitbit)

3. **Advanced AI**
   - Real-time mood interventions
   - Therapist recommendations
   - Medication tracking correlation

4. **Integrations**
   - Calendar sync (events → moods correlation)
   - Weather API (weather → mood correlation)
   - Spotify (music → mood)

5. **Gamification Extensions**
   - Multiplayer challenges
   - Achievements system (badges, trophies)
   - Leaderboards (privacy-respecting)

---

## SUPPORT & RESOURCES

### Documentation
- [Backend Architecture](./emotion-diary-spec.md)
- [Frontend Components](./emotion-diary-spec.md#6-frontend-architecture)
- [Database Schema](./emotion-diary-spec.md#4-database-schema)
- [API Endpoints](./emotion-diary-spec.md#5-backend-architecture)

### Claude Code Prompts
- [All Prompts](./claude-prompts.md)
- Copy prompt text verbatim to Claude Code
- Claude will generate complete, production-ready code
- No modifications needed for basic setup

### Getting Help
- GitHub Issues for bugs/features
- Discord community for questions
- Email: support@emotion-diary.app

---

## FINAL CHECKLIST

Before launching:
- [ ] All API endpoints tested with Postman
- [ ] Frontend components tested in Storybook
- [ ] User authentication flow tested end-to-end
- [ ] Mood check-in complete flow tested
- [ ] Diary entry creation tested
- [ ] Pet interactions tested
- [ ] AI insights generated successfully
- [ ] Stripe payments tested in test mode
- [ ] Error handling verified (all error codes)
- [ ] Loading states visible and working
- [ ] Mobile responsive design verified
- [ ] Accessibility check (WCAG 2.1 AA)
- [ ] Performance benchmarks met
- [ ] Security review completed
- [ ] Privacy policy written + displayed
- [ ] Terms of service written + displayed
- [ ] GDPR compliance verified
- [ ] Data backup strategy documented
- [ ] Monitoring alerts configured
- [ ] Deployment tested on staging
- [ ] Production secrets secured in vault

---

**Status:** Ready for implementation  
**Estimated Time:** 2 weeks (40-50 hours)  
**Team Size:** 1-2 developers  
**Complexity:** Medium (gamification + AI)  
**Market Opportunity:** High (growing wellness app market, $3B+ TAM)

---

This specification is production-ready. Begin with Prompt B1 to start backend development.
