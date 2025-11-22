# Emotion Diary App - Claude Code Agent Prompts

## FRONTEND PROMPTS (React + TypeScript + Brojs)

### Prompt F1: Project Bootstrap
```
I need you to bootstrap a React + TypeScript emotion diary web application.

REQUIREMENTS:
- Framework: React 18 with TypeScript (strict mode)
- State Management: Brojs
- Styling: @emotion/react + @emotion/styled with Emotion CSS library
- Animations: Framer Motion
- HTTP Client: Axios
- Routing: React Router v6
- Build Tool: Vite (for faster development)
- Package Manager: npm

PROJECT STRUCTURE:
Create these directories:
  src/components/{auth,checkin,diary,pet,insights,common,premium}
  src/hooks/
  src/store/
  src/pages/
  src/services/
  src/types/
  src/styles/
  src/utils/

SETUP TASKS:
1. Create vite.config.ts with React plugin
2. Setup TypeScript with strict compiler options
3. Create .env.example with:
   - REACT_APP_API_URL=http://localhost:8080/api/v1
   - REACT_APP_STRIPE_KEY=pk_test_...
   - REACT_APP_ENV=development

4. Install dependencies (generate package.json):
   - react, react-dom, react-router-dom
   - typescript, @types/react, @types/react-dom
   - brojs
   - framer-motion
   - @emotion/react, @emotion/styled
   - axios
   - stripe
   - dotenv

5. Create src/main.tsx as entry point
6. Create src/App.tsx with Router setup (3 routes: /login, /register, /)
7. Create src/index.html with <div id="root"></div>

Generate complete, copy-paste ready code. No explanations, just code.
```

### Prompt F2: Brojs Store Architecture
```
Create complete Brojs store architecture for emotion diary app.

CREATE THESE STORE FILES:
1. src/store/types.ts - Define all state interfaces:
   - User, MoodCheckin, DiaryEntry, Pet, Subscription, UIState, etc.
   - Use TypeScript interfaces with strict typing
   - Include all fields from backend API

2. src/store/index.ts - Initialize Brojs stores:
   - userStore: { user, isAuthenticated, subscription_tier, loading }
   - checkinStore: { checkins, todayCheckin, currentStreak, loading }
   - diaryStore: { entries, selectedEntry, filters, pagination }
   - petStore: { pet, happinessLevel, animationState }
   - uiStore: { notifications, modals, globalLoading }
   
3. For each store, implement:
   - Initial state
   - Reducers (pure functions to update state)
   - Selectors (computed state)
   - Example: userStore.selectors.isPremium(state)

4. src/store/auth-store.ts - Auth state module
   - Actions: setUser, logout, setSubscriptionTier
   - Selector: isAuthenticated, isPremium

5. src/store/ui-store.ts - UI state module
   - addNotification(message, type) → auto-dismiss after 3s
   - openModal(modalId) / closeModal(modalId)
   - setGlobalLoading(boolean)

USE PATTERNS:
- Immutable state updates
- No side effects in reducers (API calls go in hooks/services)
- Selector functions for derived state
- TypeScript generics for store typing

EXAMPLE STORE:
const checkinStore = createStore({
  state: { checkins: [], loading: false, error: null },
  reducers: {
    addCheckin: (state, checkin) => ({ ...state, checkins: [checkin, ...state.checkins] }),
    setLoading: (state, isLoading) => ({ ...state, loading: isLoading }),
  },
  selectors: {
    getAllCheckins: (state) => state.checkins,
    isLoading: (state) => state.loading,
    todayCheckin: (state) => state.checkins[0],
  },
});

Generate complete code ready for import.
```

### Prompt F3: Auth System (Login/Register/Logout)
```
Create complete authentication system with JWT token management.

CREATE:
1. src/services/auth.service.ts
   - login(email: string, password: string) → token + user
   - register(email, password, username) → auto-login
   - logout() → clear token + refresh
   - refreshToken() → new JWT
   - getStoredToken() / setStoredToken() / clearStoredToken()
   - Functions use axios (import from api.client)

2. src/hooks/useAuth.ts
   - useAuth() hook returning: { user, isAuth, login(), register(), logout() }
   - On mount: check localStorage for token, validate, refresh if needed
   - Auto-logout on 401 response

3. src/components/auth/LoginForm.tsx
   - Form with email + password inputs
   - Validation: email format, password 8+ chars
   - Loading state during submit
   - Error display below submit button
   - "Sign up" link
   - Submit calls useAuth().login()

4. src/components/auth/RegisterForm.tsx
   - Form with email, password, password_confirm, username
   - Validation: username 3-20 chars, passwords match
   - Submit calls useAuth().register()
   - Auto-redirect to dashboard on success

5. src/components/auth/ProtectedRoute.tsx
   - Wrapper component checking useAuth().isAuth
   - If not authenticated → <Navigate to="/login" />
   - If authenticated → render children
   - Also check userStore.subscription_tier for premium routes

6. src/pages/LoginPage.tsx
   - Centered card layout with logo
   - LoginForm component
   - Emotion styling: gradient background

7. src/pages/RegisterPage.tsx
   - Similar to LoginPage
   - RegisterForm component

TOKEN STORAGE:
- Store JWT in localStorage as 'auth_token'
- Include token in all API requests: Authorization: Bearer {token}
- Implement auto-refresh 5 min before expiry

ERROR HANDLING:
- 401 Unauthorized → logout + redirect to /login
- 400 Bad Request → show validation errors
- 500 Server Error → show generic error message

Generate complete, production-ready code.
```

### Prompt F4: Quick Check-in Component
```
Create the mood check-in UI component with animations.

CREATE:
1. src/components/checkin/EmotionSelector.tsx
   - 6 emotion buttons: happy, sad, angry, calm, stressed, excited
   - Grid layout: 3x2
   - Each button shows: emoji (large) + name below
   - Emotion colors:
     * happy: #fbbf24 (yellow)
     * sad: #60a5fa (blue)
     * angry: #ef5350 (red)
     * calm: #a78bfa (purple)
     * stressed: #fb7185 (pink)
     * excited: #ec4899 (magenta)
   - Selected button: scale(1.1) + box-shadow glow
   - onClick: pass emotion_id to parent
   - Framer Motion: staggerContainer on mount, animate each button

2. src/components/checkin/IntensitySlider.tsx
   - HTML range input: min=1, max=10
   - Styled slider with custom thumb
   - Color gradient: green (1) → red (10)
   - Display current value: "Intensity: 7/10"
   - onChange: pass value to parent
   - Emotion CSS styling

3. src/components/checkin/ReflectionInput.tsx
   - Textarea: placeholder="What's on your mind?"
   - Max 500 chars, show counter "123/500"
   - Float label animation on focus
   - Clear button (X) to reset
   - onChange: pass text to parent

4. src/components/checkin/CheckinConfirmation.tsx
   - Modal that appears after successful POST
   - Shows: large emoji checkmark ✓, "Mood logged!", emotion name
   - Display streak: "7-day streak! 🔥"
   - Auto-dismiss after 2 seconds
   - Framer Motion: scale + fade in animation

5. src/components/checkin/QuickCheckIn.tsx (MAIN COMPONENT)
   - State: selectedEmotion (number|null), intensity (5-10), reflection (string), submitting (bool)
   - Layout: centered card, vertical flex
   - Header: "How are you feeling?"
   - EmotionSelector component
   - IntensitySlider component
   - ReflectionInput component
   - Submit button: disabled until emotion selected
   - Loading spinner on button during submit
   - On submit:
     * Validate (emotion must be selected)
     * Call useCheckin().submit({ emotion_id, intensity, reflection_text })
     * On success: show CheckinConfirmation, reset form, add toast notification
     * On error: show error message in alert

6. src/hooks/useCheckin.ts
   - useCheckin() returning: { submit(), isLoading, error }
   - submit() function calls API: POST /api/v1/checkins
   - On success: update checkinStore + petStore (happiness +5)
   - Handle errors gracefully

STYLING (Emotion):
- Main card: gradient background (purple to pink)
- Container: max-width 400px, centered
- Buttons: hover effects, transitions
- Responsive: full width on mobile (<640px)

ANIMATIONS:
- EmotionSelector: stagger animation (delay each button 50ms)
- Confirmation: scale(0.8) → scale(1), opacity 0 → 1
- Failure toast: slide in from bottom-left

Generate production-ready code.
```

### Prompt F5: Pet Companion Display & Interaction
```
Create virtual pet component with gamification.

CREATE:
1. src/components/pet/PetAnimation.tsx
   - Render pet SVG or canvas-based animation
   - Accept props: { happinessLevel: 0-100, petType: string, cosmeticSkin: string }
   - 3 animation states:
     * Sad (0-30): droopy ears, slow bobbing, opacity flicker
     * Neutral (31-60): standing still, blink animation, gentle sway
     * Happy (61-100): bounce effect, spin, playful rotation
   - Framer Motion variants for each state
   - SVG structure: head, ears, eyes, mouth, body
   - Color by happinessLevel: gradient from gray → vibrant

2. src/components/pet/PetDisplay.tsx
   - Container component showing pet
   - Header: pet name (editable via icon click)
   - Center: PetAnimation component
   - Below: happiness level display (5 heart indicators ❤️)
   - Streak badge: circular gold/silver/bronze badge with number
   - Button row: Feed 🍖 | Pet 🤚 | Talk 💬
   - Layout: 300x300px square, centered

3. src/components/pet/PetInteraction.tsx
   - Handle feed/pet/talk button clicks
   - Each click: POST /api/v1/pet/{feed|pet|talk}
   - Show loading spinner on button
   - Display Gigachat-generated dialogue in speech bubble
   - Dialogue appears above pet, auto-dismisses after 3 seconds
   - Speech bubble: white background, pointer, animation: fadeIn + slideUp

4. src/components/pet/PetCustomizer.tsx
   - Modal showing available cosmetic skins
   - Grid layout: 3x3 for 9 skins
   - Locked skins: grayscale + lock icon + "Unlock at X-day streak"
   - Unlocked skins: colored, clickable
   - Preview: show selected skin on mini pet preview
   - Save button: POST /api/v1/pet/customize
   - Cancel/Close button

5. src/components/common/StreakBadge.tsx
   - Circular badge with streak number
   - Colors: gold (#fbbf24) for 7+, silver (#e5e7eb) for 3-6, bronze (#d4af37) for 1-2
   - Animation: pulse effect every time streak increments
   - Size: 60x60px, positioned bottom-right
   - Display emoji: 🔥 for hot streaks

6. src/store/pet.store.ts
   - State: { pet: Pet|null, happinessLevel: 0-100, dialogue: string, dialogueVisible: bool }
   - Actions: setPet, updateHappiness, setDialogue
   - Selectors: getPetAnimationState, getUnlockedCosmetics, getNextUnlockStreak

7. src/hooks/usePet.ts
   - usePet() returning: { pet, happinessLevel, feed(), pet(), talk() }
   - Each function: POST to API, update store, show dialogue from response
   - Handle errors

ANIMATIONS (Framer Motion):
- Sad state:
  ```
  animate: { y: [0, 5, 0], opacity: [1, 0.7, 1] },
  transition: { duration: 1.5, repeat: Infinity }
  ```
- Happy state:
  ```
  animate: { y: [0, -15, 0], rotateZ: [-2, 2, -2] },
  transition: { duration: 0.8, repeat: Infinity }
  ```
- Dialogue bubble: scale(0) → scale(1), opacity 0 → 1

Generate complete code.
```

### Prompt F6: Diary Timeline & Entries
```
Create diary timeline view with filtering and infinite scroll.

CREATE:
1. src/components/diary/DiaryEntry.tsx
   - Card component showing single diary entry
   - Props: { entry: DiaryEntry, onClick: () => void }
   - Display:
     * Date + day of week (Monday, Jan 5)
     * Entry title or auto-title from first 50 chars
     * Mood heat map: 5 small circles showing emotion breakdown
     * Content preview (first 200 chars + "..." if truncated)
     * Tags as small pills (click to filter)
     * Bottom: metadata (reading time estimate)
   - Hover effect: scale(1.02) + shadow increase
   - Framer Motion: entrance animation

2. src/components/diary/TagManager.tsx
   - Multi-select dropdown for filtering by tags
   - Display popular tags first
   - Checkboxes for tag selection
   - Show tag color indicator
   - Custom tag input (type to add new)
   - Apply/Clear buttons

3. src/components/diary/DiaryTimeline.tsx (MAIN)
   - Vertical timeline layout
   - Top: TagManager filter component
   - Main: InfiniteScroll list of DiaryEntry components
   - State: { entries, loading, hasMore, filters }
   - Fetch entries: GET /api/v1/diary?limit=10&offset=X&tags=...
   - Load next page on scroll near bottom
   - Framer Motion: AnimatePresence for entry animations (stagger)
   - Empty state: "No entries yet. Start by logging a mood!"
   - On entry click: show full entry detail in modal or side panel

4. src/components/diary/EntryEditor.tsx
   - Modal form for create/edit entry
   - Fields:
     * Title (text input)
     * Content (textarea, auto-expand)
     * Tags (TagManager dropdown)
   - Submit button: POST (create) or PUT (update)
   - Cancel button
   - Auto-save indicator: "Saving..." → "Saved ✓"
   - Error display

5. src/components/diary/MonthlyHeatmap.tsx
   - Calendar grid: 7 columns (Mon-Sun) x 5 rows
   - Each cell: day number + background color by emotion density
   - Color scale: white (0 emotions) → deep red (5+ emotions)
   - Hover cell: show tooltip with emotion breakdown
   - Click cell: filter timeline to that day
   - Navigation arrows: prev/next month
   - Header: month + year

6. src/pages/DiaryPage.tsx
   - Full page layout
   - Grid: left sidebar (MonthlyHeatmap) | main (DiaryTimeline) | right sidebar (Stats on desktop)
   - Mobile: stacked layout, tabs to switch between heatmap/timeline
   - Use FlexBox or CSS Grid (Emotion)

7. src/hooks/useDiary.ts
   - useDiaryEntries(filters, pagination) → { entries, loading, hasMore, loadMore() }
   - useCreateEntry(formData) → { submit(), loading, error }
   - useUpdateEntry(entryId, formData) → { submit(), loading, error }
   - useDeleteEntry(entryId) → { submit(), loading, error }
   - useDiaryStats(month) → { heatmapData }

8. src/store/diary.store.ts
   - State: { entries, selectedEntry, filters, pagination, loading }
   - Actions: setEntries, addEntries, setSelectedEntry, updateFilters
   - Selectors: getFilteredEntries, getEntryById

ANIMATIONS:
- Timeline entries: stagger (each entry delays 50ms on load)
- Entry expand: Framer Motion height animation
- Heatmap colors: smooth transition on day change
- Filter apply: entries re-animate with stagger

STYLING (Emotion):
- Entries: white cards, subtle shadow, border-radius 8px
- Tags: small pills (8-12px font), color backgrounds
- Heatmap: CSS Grid, gradient background cells
- Responsive: full on desktop, single-column mobile

Generate complete code.
```

### Prompt F7: AI Insights & Premium Features
```
Create insights display and premium subscription components.

CREATE:
1. src/components/insights/WeeklyInsight.tsx
   - Card displaying AI-generated weekly summary (from Gigachat)
   - Display:
     * "This Week" header with date range
     * Summary text (200-300 chars)
     * Key findings (bullet list, 3-5 items)
     * Recommendations section
   - Loading state: skeleton loader
   - Refresh button: regenerate insight (POST /api/v1/insights/weekly)
   - Helpful/Not helpful buttons: send feedback
   - Framer Motion: fade in + slide up on load

2. src/components/insights/MoodTriggers.tsx
   - Display detected mood triggers
   - Table layout: Trigger | Frequency | Recommendation
   - Example: "Stressed on Mondays | 4x/month | Try weekend planning"
   - Sortable: click column header to sort
   - No data state: "No patterns detected yet. Log more moods!"

3. src/components/insights/RecommendationCard.tsx
   - Individual recommendation with icon (emoji)
   - Example: "🚶 Morning walks reduce stress"
   - CTA button: "Learn more" (opens external link or modal)
   - Colors: varied per recommendation type

4. src/pages/InsightsPage.tsx
   - Grid layout: WeeklyInsight (2 cols) | MoodTriggers (1 col)
   - Below: RecommendationCards in horizontal scroll (3-5 visible)
   - Footer: "Powered by Sberbank Gigachat" with link
   - If free tier: overlay with PremiumUpgradeCard

5. src/components/premium/PremiumUpgradeCard.tsx
   - Featured card (prominent background color)
   - Title: "Unlock Premium Insights"
   - Benefits list (checkmarks):
     * "AI-powered emotion analysis"
     * "Weekly mood trends"
     * "Personalized recommendations"
     * "Export to PDF/JSON"
     * "All features premium"
   - "Upgrade Now" button → opens SubscriptionManager modal
   - Price: "$4.99/month"

6. src/components/premium/SubscriptionManager.tsx
   - Modal form for subscription
   - If free tier:
     * Show pricing options: Monthly ($4.99) | Annual ($49.99, show "17% savings")
     * Radio buttons to select plan
     * Stripe payment form (embedded or redirect)
     * Submit button: POST /api/v1/subscriptions/create
   - If premium:
     * Show current plan: "Premium - Renews Jan 5, 2025"
     * "Manage billing" button (Stripe portal)
     * "Cancel subscription" button → confirm modal
   - Loading/error states

7. src/components/premium/ExportModal.tsx
   - Modal for exporting diary
   - Format options: PDF, JSON, CSV (radio buttons)
   - Date range: datepicker (start/end) or presets (Last 30/90/365 days)
   - Preview: "You're about to export 47 entries from Jan 1 - Jan 31"
   - Download button: GET /api/v1/export/{diary|pdf}
   - Animated progress bar during export
   - Success message: "Download started!"

8. src/hooks/useInsights.ts
   - useInsights() → { weeklyInsight, triggers, loading, refresh() }
   - useSubscription() → { subscription, loading, upgrade(), cancel() }
   - useExport(format, dateRange) → { download(), progress, loading }

9. src/services/insights.service.ts
   - getWeeklyInsight() → GET /api/v1/insights/weekly
   - getMoodTriggers() → GET /api/v1/insights/triggers
   - getRecommendations() → GET /api/v1/insights/recommendations

10. src/services/subscription.service.ts
    - createSubscription(tier, paymentMethodId) → POST /api/v1/subscriptions/create
    - getSubscriptionStatus() → GET /api/v1/subscriptions/status
    - cancelSubscription() → POST /api/v1/subscriptions/cancel
    - Handle Stripe integration (load Stripe.js, create token)

PREMIUM GATE:
- Check userStore.subscription_tier === 'premium'
- If free: show "Premium only" overlay on insights components
- If free: show PremiumUpgradeCard nudge

ANIMATIONS:
- Insights: fade in + slide up on load
- Recommendations: horizontal carousel with arrow controls
- Upgrade card: pulse/glow effect (attention-grabbing)
- Subscription modal: scale + fade in

STYLING (Emotion):
- Upgrade card: gradient background (gold/purple)
- Premium badge: gold color (#fbbf24)
- Export card: clean form layout
- Responsive: full width on mobile

Generate complete code.
```

---

## BACKEND PROMPTS (Golang + Gin)

### Prompt B1: Golang Server Bootstrap & Auth
```
Create production-grade Golang REST API backend for emotion diary app.

REQUIREMENTS:
- Framework: Gin (v1.9+)
- Database: PostgreSQL with pgx driver
- Authentication: JWT (golang-jwt/jwt)
- Logging: Structured logging (zap)
- Configuration: dotenv
- Middleware: CORS, rate limiting, recovery, logging
- Port: 8080 (configurable)

PROJECT STRUCTURE:
emotion-diary-backend/
├── cmd/api/main.go
├── internal/
│   ├── auth/
│   │   ├── service.go (JWT, password hash)
│   │   ├── handler.go (routes)
│   │   ├── middleware.go (auth guard)
│   │   └── types.go
│   ├── config/
│   │   └── config.go (load .env)
│   ├── db/
│   │   └── postgres.go (connection pool)
│   └── middleware/
│       ├── cors.go
│       ├── logging.go
│       ├── recovery.go
│       └── ratelimit.go
├── pkg/
│   ├── logger/
│   │   └── logger.go (zap setup)
│   └── errors/
│       └── errors.go (custom error types)
├── go.mod
├── go.sum
├── .env.example
└── docker-compose.yml

SETUP TASKS:
1. Create cmd/api/main.go:
   - Load config from .env (DB_URL, JWT_SECRET, PORT, GIGACHAT_CLIENT_ID, STRIPE_KEY)
   - Initialize logger (zap structured logging)
   - Connect to PostgreSQL
   - Setup Gin router with middleware
   - Register routes (auth routes first)
   - Graceful shutdown on SIGTERM

2. Create internal/config/config.go:
   - Parse .env variables using os.Getenv()
   - Validate required vars (panic if missing)
   - Return config struct

3. Create internal/db/postgres.go:
   - pgx.ConnConfig with pool settings (MaxConnLifetime, MaxConnIdleTime)
   - Ping to verify connection
   - Return *pgx.Conn for use in handlers

4. Create internal/auth/service.go:
   - GenerateJWT(userID, email, tier) → token string, error
   - VerifyJWT(token) → claims, error
   - HashPassword(password) → hash, error (bcrypt)
   - CheckPassword(hash, password) → bool

5. Create internal/auth/handler.go:
   - POST /api/v1/auth/register → { email, password, username }
   - POST /api/v1/auth/login → { email, password }
   - POST /api/v1/auth/refresh → requires valid token
   - Each endpoint returns JWT + user data or error

6. Create internal/auth/middleware.go:
   - AuthMiddleware() → extract JWT from Authorization header
   - Validate token signature + expiry
   - Pass claims via c.Set("user_id", userID)
   - Return 401 if invalid

7. Create pkg/logger/logger.go:
   - Initialize zap logger (JSON format)
   - Expose functions: Info, Error, Debug, Fatal
   - Include requestID in logs (UUID per request)

8. Create pkg/errors/errors.go:
   - Define error types: InvalidCredentials, Unauthorized, ValidationError, InternalError, PremiumRequired
   - Each error has Code + Message + HTTPStatus

9. Create docker-compose.yml:
   - PostgreSQL service (postgres:15)
   - Redis service (redis:7)
   - Volumes for data persistence
   - Environment variables

10. Create .env.example:
    DATABASE_URL=postgres://user:password@localhost:5432/emotion_diary
    JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
    PORT=8080
    GIGACHAT_CLIENT_ID=your_gigachat_client_id
    GIGACHAT_CLIENT_SECRET=your_gigachat_client_secret
    STRIPE_API_KEY=sk_test_...
    ENVIRONMENT=development

RESPONSE FORMAT (all endpoints):
{
  "success": boolean,
  "data": <T> | null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  } | null,
  "timestamp": "2025-01-15T10:30:00Z"
}

Generate complete, production-ready code.
```

### Prompt B2: Mood Check-in API Endpoints
```
Implement mood check-in endpoints in Golang/Gin.

CREATE:
1. internal/checkin/types.go
   - MoodCheckin struct: { ID, UserID, EmotionID, Intensity, ReflectionText, CreatedAt, Source }
   - CreateCheckinRequest struct: { EmotionID, Intensity, ReflectionText }
   - CreateCheckinResponse struct: { CheckinID, Streak, PetHappinessDelta, CreatedAt }
   - Emotion enum: 1=happy, 2=sad, 3=angry, 4=calm, 5=stressed, 6=excited

2. internal/checkin/repository.go
   - CreateCheckin(ctx, userID, emotionID, intensity, reflection) → CheckinID, error
   - GetUserCheckins(ctx, userID, limit, offset) → []MoodCheckin, totalCount, error
   - GetDayCheckins(ctx, userID, date) → []MoodCheckin, error
   - GetStats(ctx, userID, days) → emotionDistribution map[int]int, intensityAvg float64, error
   - All queries use prepared statements (pgx)
   - Include proper error handling

3. internal/checkin/service.go
   - SubmitCheckin(ctx, userID, req) → response, error
     * Validate emotionID in [1,6]
     * Validate intensity in [1,10]
     * Create checkin in DB
     * Check/update streak:
       - Get user's last_checkin_date from user_streaks table
       - If yesterday → increment current_checkin_streak
       - Else → reset current_checkin_streak to 1
     * Update pet.happiness_level += 5 (if not at 100)
     * Return: checkinID, streak, +5 happiness delta
   - GetUserCheckins(userID, limit, offset) → with pagination
   - GetEmotionStats(userID, days) → analyze emotions

4. internal/checkin/handler.go
   - POST /api/v1/checkins
     * Parse request body
     * Extract userID from JWT (via middleware)
     * Call service.SubmitCheckin()
     * Return 201 Created + response
     * Rate limit: 10/min per user
   
   - GET /api/v1/checkins?limit=50&offset=0
     * Extract userID from JWT
     * Parse query params
     * Call service.GetUserCheckins()
     * Return 200 + checkins array with emotion details (JOIN emotions table)
   
   - GET /api/v1/checkins/daily/:date
     * Validate date format (YYYY-MM-DD)
     * Call service.GetDayCheckins()
     * Return 200 + day's checkins + mood breakdown
   
   - GET /api/v1/checkins/stats?days=7
     * Check premium tier (401 if free)
     * Call service.GetEmotionStats(days)
     * Return 200 + { emotion_dist, intensity_avg, streak_info }

MIDDLEWARE:
- AuthMiddleware on all POST/GET endpoints (except /auth routes)
- RateLimit middleware: 10 POST/min per user (Redis key: user_id:checkin:post)

DATABASE:
- Use prepared statements for all queries
- Handle transactions for streak updates
- Index on (user_id, created_at DESC) for fast retrieval

ERROR HANDLING:
- Validation errors → 400 Bad Request
- Unauthorized → 401 (missing/invalid JWT)
- Emotion not found → 400 with code INVALID_EMOTION_ID
- Database error → 500 with code INTERNAL_ERROR

Generate complete, copy-paste ready code.
```

### Prompt B3: Gigachat AI Integration Service
```
Implement Sberbank Gigachat API integration for emotion analysis.

CREATE:
1. internal/ai/types.go
   - GigachatTokenResponse: { AccessToken, ExpiresAt }
   - CompletionRequest: { Model, Messages, Temperature, MaxTokens }
   - CompletionResponse: { Choices: [{ Message: { Content } }] }
   - InsightResponse: { InsightText, Recommendations: [], GeneratedAt }

2. internal/ai/gigachat.go
   - GigachatClient struct: { accessToken, expiresAt, clientID, clientSecret, httpClient }
   - NewGigachatClient(clientID, clientSecret) → *GigachatClient, error
   - getAccessToken() → token, error
     * POST https://ngw.devices.sberbank.ru:9443/api/v2/oauth
     * Headers: Authorization: Basic {base64(clientID:clientSecret)}, RqUID: {uuid4}
     * Body: scope=GIGACHAT_API_PERS
     * Handle token caching (refresh 5 min before expiry)
     * Exponential backoff on failure (retry 3x)
   
   - generateCompletion(ctx, model, messages) → response text, error
     * POST https://gigachat.devices.sberbank.ru/api/v1/completions
     * Headers: Authorization: Bearer {token}
     * Body: { model, messages, temperature: 0.7, max_tokens: 500 }
     * Parse JSON response
     * Handle rate limits (429 → retry with backoff)
   
   - GenerateWeeklyInsight(ctx, userID, checkins) → InsightResponse, error
     * Format checkins into prompt:
       "User logged emotions this week: [happy 3x, stressed 5x, calm 2x]"
       "Reflection texts: [...]"
       "Generate weekly summary (max 200 words) with mood triggers and wellness advice"
     * Call generateCompletion()
     * Parse response
     * Return { text, recommendations: [...] }
   
   - GeneratePetDialogue(ctx, petName, streak, lastEmotion) → string, error
     * Prompt: "Pet name: {petName}, user streak: {streak} days, last emotion: {lastEmotion}. Generate 1 cute sentence (max 100 chars) encouraging check-in."
     * Call generateCompletion()
     * Return dialogue string
   
   - GenerateMoodTriggers(ctx, userID, days) → []TriggerAnalysis, error
     * Fetch user's checkins for last N days
     * Format as prompt with emotions + reflections
     * Call generateCompletion()
     * Parse structured response (JSON format)
     * Return trigger list with recommendations

3. internal/ai/config.go
   - Store Gigachat credentials in config (from .env)
   - Initialize client on app startup
   - Handle OAuth token refresh in background goroutine

RATE LIMITING:
- 20 Gigachat calls/minute per user (Redis key: user_id:gigachat:calls)
- Return 429 Too Many Requests if exceeded

FALLBACK:
- If Gigachat API fails: return hardcoded friendly message
- Log error for monitoring
- Retry failed requests with exponential backoff

ERROR HANDLING:
- OAuth token refresh failure → fallback to previous token or error
- Gigachat API errors → log + return generic error to client
- Invalid token → refresh and retry request

TIMEOUT:
- All Gigachat requests: 10s timeout
- Total backoff time: max 30s per request

Generate complete code with no TODOs.
```

### Prompt B4: Database Migrations & Schema
```
Create PostgreSQL database migrations for emotion diary app.

CREATE:
1. Database schema file: internal/db/migrations/001_initial_schema.sql
   - All tables defined in spec (users, emotions, mood_checkins, diary_entries, etc.)
   - Primary keys, foreign keys, constraints, indexes
   - Use proper data types (UUID, TIMESTAMP, INT, TEXT, BOOLEAN)
   - Cascade delete for foreign keys where appropriate

2. Migration runner: internal/db/migrations.go
   - RunMigrations(db *pgx.Conn) → error
   - Read .sql files from migrations/ directory
   - Execute in order (001_, 002_, etc.)
   - Idempotent: use CREATE TABLE IF NOT EXISTS
   - Log each migration execution

3. Seed data (optional): internal/db/fixtures.go
   - Seed emotions table with 6 emotions + emojis + colors
   - Seed reflection_prompts table with sample prompts
   - Seed tags table with common tags

SCHEMA INCLUDES:
- users: id, email, username, password_hash, subscription_tier, etc.
- emotions: id, name, emoji, color_hex (6 rows: happy, sad, angry, calm, stressed, excited)
- mood_checkins: id, user_id, emotion_id, intensity, reflection_text, created_at, created_date
- diary_entries: id, user_id, title, content, created_at, updated_at, entry_date, is_private, ai_summary
- diary_entry_tags: entry_id, tag_id (junction table)
- tags: id, name, category, emoji
- pets: id, user_id, name, pet_type, happiness_level, cosmetic_skin, last_fed_at
- pet_interactions: id, pet_id, interaction_type, created_at
- user_streaks: user_id, current_streak, longest_streak, streak_start_date, last_checkin_date
- subscriptions: id, user_id, tier, start_date, end_date, stripe_subscription_id
- user_preferences: user_id, notification_enabled, theme, language, etc.
- emotional_insights: id, user_id, insight_type, content, period_start_date, period_end_date
- reflection_prompts: id, prompt_text, category, is_premium
- reflection_responses: id, user_id, prompt_id, response_text, response_date, associated_diary_entry_id

INDEXES:
- (user_id, created_at DESC) on mood_checkins for fast timeline queries
- (user_id, entry_date DESC) on diary_entries
- (user_id, tag_id) on diary_entry_tags
- (name) on emotions (for lookups)
- (stripe_subscription_id) on subscriptions

Generate complete SQL + Go migration code.
```

### Prompt B5: Diary Entry & Pet Management APIs
```
Implement diary entry CRUD and pet management endpoints.

CREATE:
1. internal/diary/types.go
   - DiaryEntry: { ID, UserID, Title, Content, Tags, CreatedAt, UpdatedAt, EntryDate, IPrivate, AISummary }
   - CreateEntryRequest: { Title, Content, Tags: []int, IsPrivate }
   - DiaryStats: { HeatmapData: map[day]{ emotionDensity, emotions } }

2. internal/diary/repository.go
   - CreateEntry(ctx, userID, title, content, tagIDs) → entryID, error
   - GetUserEntries(ctx, userID, limit, offset, tagFilter) → []DiaryEntry, totalCount, error
   - UpdateEntry(ctx, entryID, userID, title, content, tagIDs) → error
   - DeleteEntry(ctx, entryID, userID) → error (soft or hard delete)
   - GetMonthlyStats(ctx, userID, year, month) → heatmap data, error

3. internal/diary/service.go
   - AutoGenerateDailyEntry(ctx, userID, date) → entryID, error
     * Fetch user's checkins for that date
     * Generate title: "Day Summary - {date}"
     * Compile content from checkins + reflections
     * AI summary via Gigachat (separate goroutine)
     * Create diary_entry record
   - AggregateCheckins(checkins) → compiled narrative text
   - ExtractTags(content) → suggested tag IDs
     * Pattern match or keyword extraction
     * Return list of tag IDs

4. internal/diary/handler.go
   - POST /api/v1/diary/entries
     * Parse { title, content, tags, is_private }
     * Call service.CreateEntry()
     * Return 201 + entryID
   
   - GET /api/v1/diary?limit=20&offset=0&tags=1,2,3
     * Parse filters
     * Call repository.GetUserEntries()
     * Return 200 + entries with tags
   
   - PUT /api/v1/diary/entries/:id
     * Verify owner (userID from JWT matches entry.userID)
     * Parse request body
     * Call repository.UpdateEntry()
     * Return 200 + updated entry
   
   - DELETE /api/v1/diary/entries/:id
     * Verify owner
     * Call repository.DeleteEntry()
     * Return 204 No Content
   
   - GET /api/v1/diary/monthly?year=2025&month=1
     * Parse year/month
     * Call repository.GetMonthlyStats()
     * Return 200 + heatmap data

5. internal/pet/types.go
   - Pet: { ID, UserID, Name, PetType, HappinessLevel, CosmeticSkin, LastFedAt, CreatedAt }
   - PetInteraction: { ID, PetID, InteractionType, CreatedAt }

6. internal/pet/repository.go
   - GetPet(ctx, userID) → *Pet, error
   - CreatePet(ctx, userID, name, petType) → petID, error
   - UpdateHappiness(ctx, petID, delta int) → new level, error
   - UpdateCosmetic(ctx, petID, skinID) → error
   - RecordInteraction(ctx, petID, interactionType) → error
   - GetUnlockedCosmetics(ctx, userID) → []string, error

7. internal/pet/service.go
   - GetPetAnimationState(happiness int) → "sad" | "neutral" | "happy"
   - CheckUnlockMilestone(streak int) → cosmeticID if unlockable, else -1
   - DecayHappiness(ctx) → batch job (nightly)
     * Query all pets where last_fed_at < 24h ago
     * Decrement happiness by 5
     * Update last_fed_at

8. internal/pet/handler.go
   - GET /api/v1/pet
     * Return current pet data
   
   - POST /api/v1/pet/feed
     * Update pet.happiness += 10
     * Call Gigachat for dialogue
     * Return { happiness_level, dialogue }
   
   - POST /api/v1/pet/talk
     * Call Gigachat with user streak + last emotion
     * Return { dialogue }
   
   - POST /api/v1/pet/customize
     * Body: { cosmetic_skin }
     * Verify user has unlocked skin
     * Update pet.cosmetic_skin
     * Return 200
   
   - PUT /api/v1/pet/name
     * Body: { name }
     * Update pet.name
     * Return 200

MIDDLEWARE:
- Auth required on all endpoints
- Rate limit: 20 requests/min per user

BACKGROUND JOBS:
- Nightly decay: DecayHappiness at 2 AM UTC
- Daily entry generation: AutoGenerateDailyEntry for all users at 11:55 PM in their timezone

Generate complete code.
```

---

## INTEGRATION & DEPLOYMENT

### Prompt D1: Environment & Docker Setup
```
Create Docker setup for local development + deployment.

CREATE:
1. docker-compose.yml
   - PostgreSQL service (postgres:15)
     * Environment: POSTGRES_USER=emotion_diary, POSTGRES_PASSWORD=dev_password
     * Volume: postgres_data
     * Port: 5432
   
   - Redis service (redis:7)
     * Port: 6379
   
   - Backend service (Dockerfile)
     * Go 1.21 image
     * Build stage: compile main.go to binary
     * Runtime stage: alpine image, copy binary
     * Environment: DB_URL, JWT_SECRET, PORT, etc.
     * Port: 8080
   
   - Frontend service (Dockerfile)
     * Node 20 image
     * Build: npm install, npm run build
     * Serve with nginx
     * Port: 3000

2. Dockerfile (backend)
   - Multi-stage build
   - Build stage: FROM golang:1.21, RUN go mod download, RUN go build
   - Runtime stage: FROM alpine:latest, COPY binary from build, CMD ./main

3. Dockerfile (frontend)
   - Multi-stage build
   - Build stage: FROM node:20, npm install, npm run build (output in dist/)
   - Runtime stage: FROM nginx:alpine, COPY dist/ to /usr/share/nginx/html

4. nginx.conf (for frontend)
   - Serve static files from dist/
   - Proxy API requests to backend:8080
   - Enable gzip compression
   - Set cache headers

5. .env.example (both projects)
   Backend:
     DATABASE_URL=postgres://emotion_diary:dev_password@postgres:5432/emotion_diary
     JWT_SECRET=dev_secret_key_change_in_production
     PORT=8080
     GIGACHAT_CLIENT_ID=...
     GIGACHAT_CLIENT_SECRET=...
     STRIPE_API_KEY=sk_test_...
     ENVIRONMENT=development
   
   Frontend:
     REACT_APP_API_URL=http://localhost:8080/api/v1
     REACT_APP_STRIPE_KEY=pk_test_...
     REACT_APP_ENV=development

6. Makefile (optional but useful)
   - make up → docker-compose up
   - make down → docker-compose down
   - make logs-backend → tail backend logs
   - make migrate → run DB migrations

STARTUP:
1. docker-compose up
2. Wait for PostgreSQL to be ready (~5s)
3. Backend runs migrations on startup
4. Frontend compiled and served on port 3000
5. API available at http://localhost:8080/api/v1
6. UI available at http://localhost:3000

Generate complete configuration files.
```

---

## QUICK START SUMMARY

To use these prompts:

1. **Backend:**
   - Use Prompt B1 in Claude Code for initial server setup
   - Use B2, B3, B4, B5 sequentially to build each feature
   - Use D1 for Docker setup

2. **Frontend:**
   - Use Prompt F1 for React bootstrap
   - Use F2 for Brojs store setup
   - Use F3-F7 for individual components/features
   - Reference shared types from backend

3. **Integration:**
   - Ensure .env files match between projects
   - Test authentication flow end-to-end
   - Verify Gigachat API integration before shipping
   - Load test with 50-100 concurrent users

4. **Time Estimate (2 weeks):**
   - Days 1-2: Backend foundation (auth, DB, API scaffold)
   - Days 3-4: Frontend setup + UI components
   - Days 5-7: Core features (check-in, diary, pet)
   - Days 8-10: AI integration + premium features
   - Days 11-14: Testing, deployment, bug fixes
