# Personal Diary & Emotional Tracking System - Technical Specification

## 1. EXECUTIVE SUMMARY

A gamified personal diary application that combines mood tracking with narrative storytelling. Users log emotions through quick check-ins (emoji/slider), which feed into a persistent "Life Diary" system where daily entries build a visual story arc. Features AI-driven insights via Gigachat for personalized emotional analysis, with unobtrusive pet-based gamification.

**Tech Stack:**
- **Frontend:** React + TypeScript + Brojs (state management) + Framer Motion (animations)
- **Backend:** Golang + Gin/Fiber (API framework) + PostgreSQL/SQLite (database)
- **AI Integration:** Sberbank Gigachat API (context-aware dialogue, mood insights)
- **Styling:** Emotion (CSS-in-JS)

**Monetization Model:** Freemium (basic mood tracking free) → Premium ($4.99/month for analytics, AI coaching, export)

---

## 2. FUNCTIONAL REQUIREMENTS

### 2.1 Core Features

#### A. Quick Mood Check-In (MVP)
- Single-tap emotion logging: 6 core emotions (happy, sad, angry, calm, stressed, excited)
- Optional slider intensity (1-10 scale)
- Timestamp auto-capture
- Optional text reflection (50-500 chars)
- Quick save notification with haptic feedback

#### B. Mood Pet Companion (Gamification Layer)
- Virtual pet whose state mirrors user's emotional patterns
- Pet displays mood 2-3x daily based on last check-in
- Visual states: happy, sad, contemplative, energized
- Pet responds to streak consistency (emotional tracking streaks earn badges)
- Cosmetic unlocks: pet skins, accessories based on milestones

#### C. Personal Diary/Life Journal (Narrative Core)
- Entries auto-compile from mood check-ins + reflections
- Weekly digest: "This week's emotional arc" summary
- Monthly story view: calendar heat map showing emotional density
- Tag system: #stress, #productivity, #relationships, #health, #creative
- Free-form journaling option for deeper reflection

#### D. Emotional Insights (AI-Powered, Premium)
- Gigachat-generated weekly summaries: "You've been stressed 5x this week, here's why based on patterns"
- Mood trigger identification: correlates emotions with activities/times
- Personalized wellness recommendations
- Trend analysis: 30/90/365 day emotion charts

#### E. Reflection Prompts (Engagement)
- Context-aware daily prompts: "What challenged you today?" "What are you grateful for?"
- Prompt responses build narrative journal entries
- Premium: custom prompt creation based on goals

#### F. Export & Social (Premium)
- Export diary as personal story document (PDF/JSON)
- Share emotional journey (anonymized) as art
- Leaderboard: "Mood Consistency Streaks" (social competition, not comparison)

---

## 3. NON-FUNCTIONAL REQUIREMENTS

| Requirement | Specification |
|--|--|
| **Performance** | API response <200ms, diary page load <1s |
| **Availability** | 99.9% uptime, offline-first mobile sync |
| **Scalability** | Support 50k concurrent users, horizontal scaling ready |
| **Security** | End-to-end encryption for diary entries, OAuth 2.0 auth, GDPR-compliant data retention |
| **Accessibility** | WCAG 2.1 AA, keyboard navigation, screen reader support |
| **Localization** | English + Russian (Gigachat native Russian support) |
| **Data Retention** | Entries never auto-delete; user controls export/deletion |
| **Analytics** | Anonymous emotion trends (no personal data), Mixpanel/PostHog integration |

---

## 4. DATABASE SCHEMA (PostgreSQL)

```sql
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  subscription_tier VARCHAR(20) DEFAULT 'free', -- 'free' | 'premium' | 'premium_annual'
  subscription_expires_at TIMESTAMP,
  avatar_url VARCHAR(500),
  pet_id UUID REFERENCES pets(id)
);

-- Emotions Table (Enum-like, immutable)
CREATE TABLE emotions (
  id SMALLINT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL, -- 'happy', 'sad', 'angry', 'calm', 'stressed', 'excited'
  emoji VARCHAR(10) NOT NULL,
  color_hex VARCHAR(7) NOT NULL
);

-- Mood Check-ins (Core data)
CREATE TABLE mood_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emotion_id SMALLINT NOT NULL REFERENCES emotions(id),
  intensity INT CHECK (intensity >= 1 AND intensity <= 10), -- 1-10 scale
  reflection_text TEXT, -- Optional: 50-500 chars
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_date DATE DEFAULT CURRENT_DATE, -- For efficient daily queries
  source VARCHAR(20) DEFAULT 'web', -- 'web' | 'mobile' | 'widget'
  INDEX idx_user_created (user_id, created_at DESC),
  INDEX idx_user_date (user_id, created_date DESC)
);

-- Diary Entries (Narrative journal)
CREATE TABLE diary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200),
  content TEXT NOT NULL,
  source_checkin_ids UUID[] DEFAULT '{}', -- References to checkins that generated this entry
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  entry_date DATE DEFAULT CURRENT_DATE,
  is_private BOOLEAN DEFAULT FALSE, -- For sharing features
  ai_summary TEXT, -- Generated by Gigachat
  INDEX idx_user_date (user_id, entry_date DESC)
);

-- Tags Table
CREATE TABLE tags (
  id SMALLINT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL, -- '#stress', '#productivity', etc.
  category VARCHAR(30), -- 'life_domain' | 'activity' | 'custom'
  emoji VARCHAR(10)
);

-- Entry-Tag Junction
CREATE TABLE diary_entry_tags (
  entry_id UUID NOT NULL REFERENCES diary_entries(id) ON DELETE CASCADE,
  tag_id SMALLINT NOT NULL REFERENCES tags(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (entry_id, tag_id),
  INDEX idx_tag (tag_id)
);

-- Emotional Patterns (AI-generated insights)
CREATE TABLE emotional_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  insight_type VARCHAR(50), -- 'weekly_summary' | 'mood_trigger' | 'recommendation'
  content TEXT NOT NULL,
  period_start_date DATE NOT NULL,
  period_end_date DATE NOT NULL,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_premium_only BOOLEAN DEFAULT TRUE
);

-- Streaks & Achievements (Gamification)
CREATE TABLE user_streaks (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current_checkin_streak INT DEFAULT 0,
  longest_checkin_streak INT DEFAULT 0,
  streak_start_date DATE,
  last_checkin_date DATE,
  streak_broken_count INT DEFAULT 0
);

-- Pet Data (Virtual companion)
CREATE TABLE pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  pet_type VARCHAR(50) DEFAULT 'mood_cat', -- Pet species
  happiness_level INT DEFAULT 50, -- 0-100
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_fed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  cosmetic_skin VARCHAR(100) DEFAULT 'default',
  UNIQUE (user_id) -- One pet per user
);

-- Pet Interactions (For tracking actions)
CREATE TABLE pet_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  interaction_type VARCHAR(50), -- 'fed' | 'petted' | 'talked_to'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reflection Prompts
CREATE TABLE reflection_prompts (
  id SMALLINT PRIMARY KEY,
  prompt_text VARCHAR(255) NOT NULL,
  category VARCHAR(50), -- 'challenge' | 'gratitude' | 'goal' | 'reflection'
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Reflection Responses
CREATE TABLE reflection_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prompt_id SMALLINT NOT NULL REFERENCES reflection_prompts(id),
  response_text TEXT NOT NULL,
  response_date DATE DEFAULT CURRENT_DATE,
  associated_diary_entry_id UUID REFERENCES diary_entries(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_date (user_id, response_date DESC)
);

-- Subscriptions & Payments (Freemium tracking)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier VARCHAR(20) NOT NULL, -- 'free' | 'premium' | 'premium_annual'
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  payment_method VARCHAR(50), -- 'stripe' | 'paypal'
  stripe_subscription_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Settings & Preferences
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  notification_enabled BOOLEAN DEFAULT TRUE,
  notification_time TIME DEFAULT '09:00',
  theme VARCHAR(20) DEFAULT 'light', -- 'light' | 'dark' | 'auto'
  language VARCHAR(10) DEFAULT 'en', -- 'en' | 'ru'
  data_export_enabled BOOLEAN DEFAULT TRUE,
  ai_insights_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. BACKEND ARCHITECTURE (Golang)

### 5.1 Project Structure

```
emotion-diary-backend/
├── cmd/
│   └── api/
│       └── main.go                 # Entry point
├── internal/
│   ├── auth/
│   │   ├── service.go              # JWT, OAuth logic
│   │   ├── middleware.go           # Auth middleware
│   │   └── types.go
│   ├── checkin/
│   │   ├── handler.go              # POST /checkins endpoint
│   │   ├── service.go              # Business logic
│   │   ├── repository.go           # Database queries
│   │   └── types.go
│   ├── diary/
│   │   ├── handler.go              # GET /diary, POST /entries
│   │   ├── service.go              # Entry aggregation, tag logic
│   │   ├── repository.go
│   │   └── types.go
│   ├── pet/
│   │   ├── handler.go              # GET/POST /pet
│   │   ├── service.go              # Pet state logic
│   │   └── repository.go
│   ├── ai/
│   │   ├── gigachat.go             # Gigachat API integration
│   │   ├── insights.go             # Emotion analysis service
│   │   └── prompts.go              # Reflection prompt generation
│   ├── subscription/
│   │   ├── handler.go
│   │   ├── service.go              # Stripe integration
│   │   └── repository.go
│   ├── config/
│   │   └── config.go               # Environment variables
│   ├── db/
│   │   ├── postgres.go             # DB connection
│   │   ├── migrations/             # SQL migration files
│   │   └── fixtures.go             # Test data
│   ├── middleware/
│   │   ├── cors.go
│   │   ├── logging.go
│   │   ├── recovery.go
│   │   └── ratelimit.go            # Redis rate limiting
│   └── models/
│       └── types.go                # Shared TypeScript-compatible types
├── pkg/
│   ├── logger/
│   │   └── logger.go               # Structured logging (zap)
│   ├── validator/
│   │   └── validator.go            # Input validation
│   ├── errors/
│   │   └── errors.go               # Custom error types
│   └── utils/
│       └── utils.go                # Utility functions
├── go.mod
├── go.sum
├── .env.example
└── docker-compose.yml              # Local dev setup
```

### 5.2 Core API Endpoints

```
Authentication:
  POST   /api/v1/auth/register              # Create account
  POST   /api/v1/auth/login                 # JWT token
  POST   /api/v1/auth/refresh               # Refresh token
  POST   /api/v1/auth/logout                # Revoke token

Mood Check-ins:
  POST   /api/v1/checkins                   # Log mood (emotion_id, intensity, reflection)
  GET    /api/v1/checkins                   # Get user's checkins (paginated)
  GET    /api/v1/checkins/daily/:date       # Get specific day
  GET    /api/v1/checkins/stats             # Emotion distribution (premium)

Diary Entries:
  GET    /api/v1/diary                      # Get entries (paginated, with filters)
  POST   /api/v1/diary/entries              # Create/update entry
  GET    /api/v1/diary/entries/:id          # Get single entry
  DELETE /api/v1/diary/entries/:id          # Delete entry
  GET    /api/v1/diary/monthly              # Heat map data
  GET    /api/v1/diary/weekly               # Weekly summary

Emotional Insights (Premium):
  GET    /api/v1/insights/weekly            # AI-generated weekly insight
  GET    /api/v1/insights/triggers          # Mood trigger analysis
  POST   /api/v1/insights/recommendations   # Generate personalized advice

Pet:
  GET    /api/v1/pet                        # Get pet state
  POST   /api/v1/pet/feed                   # Interact with pet
  POST   /api/v1/pet/customize              # Update cosmetics
  PUT    /api/v1/pet/name                   # Rename pet

Reflection Prompts:
  GET    /api/v1/prompts/daily              # Get today's prompt
  POST   /api/v1/prompts/:id/response       # Submit response
  GET    /api/v1/prompts/responses          # Get user's responses

Subscriptions (Stripe):
  POST   /api/v1/subscriptions/create       # Create subscription
  GET    /api/v1/subscriptions/status       # Check tier
  POST   /api/v1/subscriptions/cancel       # Cancel subscription
  POST   /api/v1/subscriptions/webhook      # Stripe webhook

Export:
  GET    /api/v1/export/diary               # Export as JSON
  GET    /api/v1/export/pdf                 # Export as PDF (premium)
```

### 5.3 Key Implementation Details

#### Authentication (JWT-based)
```go
// Bearer token format
Authorization: Bearer <jwt_token>

// JWT claims structure
{
  "sub": "user_uuid",
  "email": "user@example.com",
  "tier": "premium",
  "exp": 1700000000,
  "iat": 1699999999
}
```

#### Gigachat AI Integration
- **OAuth 2.0 Authorization Flow:** Get bearer token every 30 minutes
- **Endpoints Used:**
  - `POST /api/v1/completions` (generate weekly summaries, advice)
  - `POST /api/v1/chat` (streaming mood insights)
- **Request Example:**
```json
{
  "model": "GigaChat",
  "messages": [
    {
      "role": "user",
      "content": "Analyze this week's emotions: [happy: 3x, stressed: 5x, calm: 2x]. Give personalized insights."
    }
  ],
  "temperature": 0.7,
  "max_tokens": 500
}
```

#### Database Connection Pool
```go
sqlc.Config{
  Db: pgx.ConnPoolConfig{
    MaxConnLifetime: 15 * time.Minute,
    MaxConnIdleTime: 3 * time.Minute,
    HealthCheckPeriod: 1 * time.Minute,
  },
}
```

#### Rate Limiting (Redis)
```
- 100 requests/minute per authenticated user
- 20 requests/minute for Gigachat AI calls (cost optimization)
- 10 POST requests/minute for check-ins (prevent spam)
```

### 5.4 Error Handling

```go
type APIError struct {
  Code    string `json:"code"`
  Message string `json:"message"`
  Status  int    `json:"status"`
}

// Examples:
// {code: "INVALID_EMOTION_ID", message: "Emotion ID not found", status: 400}
// {code: "UNAUTHORIZED", message: "Invalid token", status: 401}
// {code: "PREMIUM_REQUIRED", message: "This feature requires premium", status: 403}
```

---

## 6. FRONTEND ARCHITECTURE (React + TypeScript)

### 6.1 Project Structure

```
emotion-diary-frontend/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── checkin/
│   │   │   ├── QuickCheckIn.tsx          # Main mood input component
│   │   │   ├── EmotionSelector.tsx       # 6 emotion buttons
│   │   │   ├── IntensitySlider.tsx       # 1-10 scale
│   │   │   ├── ReflectionInput.tsx       # Optional text
│   │   │   └── CheckinConfirmation.tsx   # Success animation
│   │   ├── pet/
│   │   │   ├── PetDisplay.tsx            # Animated pet container
│   │   │   ├── PetAnimation.tsx          # Framer Motion animations
│   │   │   ├── PetInteraction.tsx        # Feed/pet buttons
│   │   │   └── PetCustomizer.tsx         # Skin selector
│   │   ├── diary/
│   │   │   ├── DiaryTimeline.tsx         # Chronological entries
│   │   │   ├── DiaryEntry.tsx            # Single entry card
│   │   │   ├── MonthlyHeatmap.tsx        # Calendar heat map
│   │   │   ├── EntryEditor.tsx           # Create/edit entry
│   │   │   └── TagManager.tsx            # Tag UI
│   │   ├── insights/
│   │   │   ├── WeeklyInsight.tsx         # AI summary (premium)
│   │   │   ├── MoodTriggers.tsx          # Trigger analysis
│   │   │   └── RecommendationCard.tsx    # Personalized advice
│   │   ├── prompts/
│   │   │   ├── DailyPrompt.tsx           # Prompt card
│   │   │   ├── PromptInput.tsx           # Response form
│   │   │   └── PromptHistory.tsx         # Past responses
│   │   ├── common/
│   │   │   ├── Header.tsx
│   │   │   ├── Navigation.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── Toast.tsx                 # Notifications
│   │   │   └── StreakBadge.tsx           # Gamification badge
│   │   └── premium/
│   │       ├── PremiumUpgradeCard.tsx
│   │       ├── SubscriptionManager.tsx
│   │       └── ExportModal.tsx
│   ├── hooks/
│   │   ├── useAuth.ts                    # Auth context hook
│   │   ├── useCheckin.ts                 # Checkin mutations
│   │   ├── useDiary.ts                   # Diary queries
│   │   ├── usePet.ts                     # Pet state
│   │   ├── useInsights.ts                # AI insights
│   │   ├── useLocalStorage.ts            # Offline support
│   │   └── usePagination.ts              # Pagination logic
│   ├── store/
│   │   ├── index.ts                      # Brojs store setup
│   │   ├── auth.store.ts                 # Auth state
│   │   ├── checkin.store.ts              # Checkin state
│   │   ├── diary.store.ts                # Diary entries
│   │   ├── pet.store.ts                  # Pet state
│   │   ├── ui.store.ts                   # Modal/toast state
│   │   └── subscription.store.ts         # Premium status
│   ├── pages/
│   │   ├── Dashboard.tsx                 # Main page
│   │   ├── DiaryPage.tsx                 # Full diary view
│   │   ├── InsightsPage.tsx              # Analytics (premium)
│   │   ├── SettingsPage.tsx
│   │   ├── PrivacyPage.tsx
│   │   └── 404.tsx
│   ├── services/
│   │   ├── api.client.ts                 # Axios instance
│   │   ├── auth.service.ts               # Login/register
│   │   ├── checkin.service.ts            # API calls
│   │   ├── diary.service.ts
│   │   ├── pet.service.ts
│   │   ├── insights.service.ts           # AI API
│   │   ├── subscription.service.ts       # Stripe
│   │   └── storage.service.ts            # LocalStorage
│   ├── types/
│   │   ├── index.ts                      # Core types
│   │   ├── api.types.ts                  # API response types
│   │   ├── models.types.ts               # Domain models
│   │   └── ui.types.ts                   # UI state types
│   ├── styles/
│   │   ├── global.css
│   │   ├── theme.ts                      # Emotion theme
│   │   ├── animations.ts                 # Framer Motion presets
│   │   └── colors.ts                     # Design tokens
│   ├── utils/
│   │   ├── formatters.ts                 # Date/time formatting
│   │   ├── validators.ts                 # Form validation
│   │   ├── api-error-handler.ts
│   │   ├── emotion-colors.ts             # Emotion hex codes
│   │   └── constants.ts
│   ├── App.tsx
│   └── index.tsx
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── pet-sprites/                      # Pet SVG assets
├── .env.example
├── tsconfig.json
└── package.json
```

### 6.2 State Management (Brojs)

```typescript
// store/index.ts
import { createStore } from 'brojs';

// User store
export const userStore = createStore({
  state: {
    user: null as User | null,
    isAuthenticated: false,
    tier: 'free' as SubscriptionTier,
  },
  reducers: {
    setUser: (state, user: User) => ({ ...state, user, isAuthenticated: true }),
    logout: () => ({ user: null, isAuthenticated: false, tier: 'free' }),
  },
  selectors: {
    isAuth: (state) => state.isAuthenticated,
    isPremium: (state) => state.tier === 'premium' || state.tier === 'premium_annual',
  },
});

// Checkin store
export const checkinStore = createStore({
  state: {
    checkins: [] as MoodCheckin[],
    selectedDate: new Date(),
    streak: 0,
    loading: false,
    error: null as string | null,
  },
  reducers: {
    addCheckin: (state, checkin: MoodCheckin) => ({
      ...state,
      checkins: [checkin, ...state.checkins],
      streak: checkin.created_date === yesterday ? state.streak + 1 : 1,
    }),
    setLoading: (state, loading: boolean) => ({ ...state, loading }),
  },
  selectors: {
    todayCheckin: (state) => state.checkins[0], // Latest
    thisWeekCheckins: (state) => state.checkins.slice(0, 7),
  },
});

// Pet store
export const petStore = createStore({
  state: {
    pet: null as Pet | null,
    happinessLevel: 50,
  },
  reducers: {
    setPet: (state, pet: Pet) => ({ ...state, pet, happinessLevel: pet.happiness_level }),
    updateHappiness: (state, delta: number) => ({
      ...state,
      happinessLevel: Math.min(100, Math.max(0, state.happinessLevel + delta)),
    }),
  },
});
```

### 6.3 Key Components

#### QuickCheckIn.tsx (Core Interaction)
```typescript
export const QuickCheckIn: React.FC = () => {
  const [selectedEmotion, setSelectedEmotion] = useState<number | null>(null);
  const [intensity, setIntensity] = useState(5);
  const [reflection, setReflection] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { mutate: submitCheckin } = useCheckin();
  const { addNotification } = useUI();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await submitCheckin({
      emotion_id: selectedEmotion!,
      intensity,
      reflection_text: reflection || undefined,
    });
    // Animation + success toast
    addNotification('Mood logged! 🎉', 'success');
    setIsSubmitting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="checkin-container"
    >
      <h2>How are you feeling?</h2>
      <EmotionSelector 
        selected={selectedEmotion}
        onSelect={setSelectedEmotion}
      />
      <IntensitySlider value={intensity} onChange={setIntensity} />
      <ReflectionInput value={reflection} onChange={setReflection} />
      <motion.button
        onClick={handleSubmit}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Log Mood
      </motion.button>
    </motion.div>
  );
};
```

#### PetDisplay.tsx (Gamification)
```typescript
export const PetDisplay: React.FC = () => {
  const { pet, happinessLevel } = petStore.getState();
  const animations = usePetAnimations(happinessLevel);

  return (
    <motion.div className="pet-container" {...animations.container}>
      <svg className="pet" width={200} height={200}>
        {/* Pet SVG rendering based on pet.cosmetic_skin */}
        <PetSvg skin={pet?.cosmetic_skin} />
      </svg>
      <StreakBadge streak={streak} />
      <HappinessMeter level={happinessLevel} />
    </motion.div>
  );
};
```

#### DiaryTimeline.tsx (Content Display)
```typescript
export const DiaryTimeline: React.FC = () => {
  const { entries, loading, hasMore } = useDiaryEntries();
  const [filter, setFilter] = useState<TagFilter | null>(null);

  const filtered = filter 
    ? entries.filter(e => e.tags.includes(filter))
    : entries;

  return (
    <div className="timeline">
      <TagFilter onSelect={setFilter} />
      <AnimatePresence>
        {filtered.map(entry => (
          <motion.div key={entry.id} layout>
            <DiaryEntry entry={entry} />
          </motion.div>
        ))}
      </AnimatePresence>
      {hasMore && <LoadMore />}
    </div>
  );
};
```

### 6.4 Styling with Emotion

```typescript
// styles/theme.ts
import { css } from '@emotion/react';

export const theme = {
  colors: {
    primary: '#7c3aed',    // Purple
    success: '#10b981',    // Green
    warning: '#f59e0b',    // Amber
    danger: '#ef4444',     // Red
    mood: {
      happy: '#fbbf24',
      sad: '#60a5fa',
      angry: '#ef5350',
      calm: '#a78bfa',
      stressed: '#fb7185',
      excited: '#ec4899',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  transitions: {
    fast: 'all 0.15s ease-in-out',
    base: 'all 0.3s ease-in-out',
    slow: 'all 0.5s ease-in-out',
  },
};

// Component styling
const checkinContainer = css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
  padding: ${theme.spacing.xl};
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  transition: ${theme.transitions.base};

  @media (max-width: 640px) {
    padding: ${theme.spacing.md};
  }
`;
```

### 6.5 Animations with Framer Motion

```typescript
// styles/animations.ts
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 },
};

export const petHappy = {
  animate: {
    y: [0, -10, 0],
    rotateZ: [-2, 2, -2],
    transition: { duration: 0.6, repeat: Infinity },
  },
};

export const petSad = {
  animate: {
    y: [0, 2, 0],
    opacity: [1, 0.7, 1],
    transition: { duration: 1, repeat: Infinity },
  },
};
```

---

## 7. USER STORIES & INTERACTION FLOW

### User Story 1: Quick Daily Check-in
```
As a user,
I want to log my mood with a single tap and optional reflection,
so that I can effortlessly track my emotions without friction.

Acceptance Criteria:
✓ Can select emotion from 6 preset options within 5 seconds
✓ Can adjust intensity slider (1-10) intuitively
✓ Can add optional reflection text (50-500 chars)
✓ Receives haptic feedback + success animation
✓ Mood persists offline and syncs when online
✓ Mood becomes accessible to pet AI logic immediately

Flow:
1. User opens app → Dashboard shows quick check-in widget
2. User taps emotion (happy face emoji)
3. Intensity slider appears (default: 5)
4. Optional: user adds text "Great day at work!"
5. User taps "Log Mood" button
6. Confirmation animation: pet reacts with joy
7. Entry saved to local cache, sent to backend
8. Toast notification: "Mood logged! 🎉"
9. Pet's happiness increases by 10 points
10. Streak counter increments (or resets if broken)
```

### User Story 2: Emotional Insights (Premium)
```
As a premium user,
I want to receive AI-generated insights about my emotional patterns,
so that I can understand my mood triggers and improve my wellbeing.

Acceptance Criteria:
✓ Weekly summary generated every Sunday at 6 PM
✓ Summary identifies trends: "stressed 5x this week"
✓ Includes personalized recommendations via Gigachat
✓ Actionable advice tied to detected patterns
✓ User can dismiss/save insight
✓ Insights accessible in dedicated tab

Flow:
1. Backend scheduler triggers at week end
2. Queries user's last 7 days of checkins
3. Calls Gigachat API with emotion data + reflection text
4. Receives: summary + triggers + recommendations
5. Stores in emotional_insights table
6. Frontend displays in "Insights" page
7. User reads: "You've been stressed when..."
8. User can expand for recommendations
9. User marks insight as "helpful" → improves AI context
```

### User Story 3: Personal Diary Entry Creation
```
As a user,
I want my mood check-ins to automatically compile into narrative diary entries,
so that I can see my emotional journey as a coherent story.

Acceptance Criteria:
✓ Daily entries auto-generate from day's check-ins
✓ Can manually edit/add to auto-generated entry
✓ Tags auto-suggested based on reflection text
✓ Can add custom tags
✓ Entries show creation date + mood heat map
✓ Can export individual entry as story

Flow:
1. User logs 3 mood check-ins throughout day
2. Backend's nightly job aggregates them
3. Creates diary_entry with checkin IDs stored
4. Frontend detects new entry, shows preview
5. User views entry: "Today was mixed - stressed in AM, happy in PM"
6. User adds manual reflection: "Resolved conflict with colleague"
7. System suggests tag: #relationships
8. User accepts tag (or adds custom #career)
9. Entry saved with tags + AI summary
10. Entry appears in "Life Diary" timeline
```

### User Story 4: Pet Companion Engagement
```
As a user,
I want a virtual pet that mirrors my emotional consistency,
so that I'm motivated to maintain a daily check-in streak.

Acceptance Criteria:
✓ Pet's mood reflects user's recent emotional patterns
✓ Consistent check-in streaks increase pet happiness
✓ Visual state changes based on streak (happy → sad → concerned)
✓ Pet responds to user interactions (feed, pet, talk)
✓ Cosmetic unlocks every 10-day streak
✓ Broken streak shows pet "worried" state

Flow:
1. User completes Week 1 with 7/7 check-ins
2. Pet reaches "Very Happy" state (90+ happiness)
3. User unlocks "space_cat" cosmetic skin
4. Pet displays new skin by default
5. Day 8: User forgets to check in
6. Pet shows "Concerned" animation + dialogue from Gigachat
7. Gigachat-generated message: "I miss you! Come back tomorrow?"
8. User taps pet: "I'm sorry, I'm back"
9. Submits check-in → pet happiness recovers 50%
10. Streak resets to 1, but can rebuild
```

### User Story 5: Monthly Reflection & Goal Tracking
```
As a user,
I want to see my emotional journey visualized over a month,
so that I can identify patterns and celebrate progress.

Acceptance Criteria:
✓ Monthly heat map shows emotion density by day
✓ Color intensity = emotion frequency (darker = more emotions logged)
✓ Can click day → view entries
✓ Weekly summaries embedded in month view
✓ Can set emotion-related goals
✓ Goals show progress toward target (e.g., "reduce stress")

Flow:
1. User navigates to "Monthly" view
2. Calendar shows heat map: reds for stressed days, greens for happy
3. User clicks dense red day
4. Sidebar shows 5 check-ins + reflections from that day
5. User notices stress pattern on Mondays
6. Sets goal: "Reduce Monday stress by 20%"
7. Frontend tracks following Mondays' stress intensity
8. Month-end: shows "20% improvement ✓"
9. Pet celebrates with achievement animation
```

### User Story 6: Reflection Prompts & Narrative Building
```
As a user,
I want daily guided reflection prompts,
so that my diary entries develop deeper narrative meaning.

Acceptance Criteria:
✓ One prompt delivered daily at user's chosen time
✓ Prompt types: challenge, gratitude, goal, reflection
✓ Responses link to diary entries automatically
✓ Response history accessible (browsable timeline)
✓ Premium: custom prompts based on mood patterns
✓ Responses become part of entry narrative

Flow:
1. User receives notification at 8 PM: "What challenged you today?"
2. User taps notification → responds in 1-2 sentences
3. Response stored + auto-linked to today's diary entry
4. Tonight's diary entry now includes both:
   - Mood timeline (happy → stressed → calm)
   - Reflection: "Challenge was conflict resolution"
5. Diary reads as mini-narrative
6. User browses past prompts → sees 6-month journey
7. System detects pattern: "grateful entries → less stress next day"
8. Recommends: "Try morning gratitude practice"
```

---

## 8. DETAILED AI/CLAUDE CODE PROMPTS

### PART A: BACKEND IMPLEMENTATION PROMPTS

#### Prompt A1: API Foundation & Authentication
```
Create a production-grade Golang REST API backend for an emotion diary app using Gin framework.

Requirements:
- JWT-based authentication with refresh tokens (30-min expiry, 24-hr refresh)
- PostgreSQL integration with pgx connection pool (max 20 connections)
- Structured logging with zap (JSON format for stacktrace)
- CORS middleware configured for localhost:3000 and production domain
- Rate limiter: 100 req/min per user via redis (or in-memory for MVP)
- Custom error handling with standardized API error responses
- Graceful shutdown on SIGTERM

Deliverables:
1. main.go: Server initialization, middleware setup, route registration
2. internal/auth/service.go: JWT generation, password hashing (bcrypt), OAuth refresh logic
3. internal/auth/middleware.go: Auth guard middleware, token validation
4. internal/config/config.go: Load .env variables (DB_URL, JWT_SECRET, PORT)
5. pkg/errors/errors.go: Custom error types matching React error handler expectations
6. docker-compose.yml: PostgreSQL + Redis local dev setup

API Response Format (all endpoints):
{
  "success": boolean,
  "data": <T>,
  "error": { code, message } | null
}

Error Codes: INVALID_CREDENTIALS, UNAUTHORIZED, VALIDATION_ERROR, INTERNAL_SERVER_ERROR, PREMIUM_REQUIRED

Generate complete, copy-paste ready code with no TODOs.
```

#### Prompt A2: Mood Check-in Endpoints
```
Implement mood check-in endpoints in Golang/Gin with full business logic.

Endpoints:
1. POST /api/v1/checkins
   - Body: { emotion_id: int, intensity: 1-10, reflection_text?: string }
   - Auth: Required
   - Logic:
     a. Validate emotion_id exists in emotions table
     b. Create mood_checkin record with auto-timestamp
     c. Trigger pet happiness update (+5 for consistency)
     d. Check streak: if last_checkin_date = yesterday, increment; else reset to 1
     e. Return: { checkin_id, streak, pet_happiness_delta, created_at }
   - Rate limit: 10 POST/min per user

2. GET /api/v1/checkins?limit=50&offset=0
   - Auth: Required
   - Query: user's checkins, paginated, newest first
   - Include emotion emoji + color from emotions table JOIN
   - Return: { checkins: [{ id, emotion_id, emotion: { name, emoji, color }, intensity, reflection_text, created_at }], total_count, has_more }

3. GET /api/v1/checkins/daily/:date
   - Auth: Required
   - Get all checkins for specific date (YYYY-MM-DD)
   - Sort by created_at ascending
   - Return: { checkins: [...], date_summary: { total_emotions: {emotion: count} } }

4. GET /api/v1/checkins/stats?days=7
   - Auth: Required + Premium check
   - Emotion distribution last N days: { happy: 3, stressed: 5, ...}
   - Intensity average: 6.2
   - Streak info: { current: 7, longest: 15 }
   - Return: { emotion_stats, intensity_avg, streak_info }

Handlers: internal/checkin/handler.go
Service: internal/checkin/service.go (business logic)
Repository: internal/checkin/repository.go (database queries with pgx prepared statements)

Include database transaction handling, proper error messages, TypeScript-compatible types.
```

#### Prompt A3: Diary Entry Management
```
Implement diary entry CRUD operations with tag system and narrative compilation.

Endpoints:
1. POST /api/v1/diary/entries
   - Auth: Required
   - Body: { title?: string, content: string, tags: [tag_ids], is_private: boolean }
   - Logic:
     a. Create diary_entry record
     b. Link tags via diary_entry_tags junction table
     c. Store in entries (user_id, content, tags, created_at, entry_date)
     d. Return: { entry_id, created_at, tags }

2. GET /api/v1/diary?limit=20&offset=0&tags=stress,productivity
   - Auth: Required
   - Query entries with optional tag filter (comma-separated)
   - Include associated tags, emotion summary for that day
   - Return: { entries: [...], total_count }

3. PUT /api/v1/diary/entries/:id
   - Auth: Required (user must own entry)
   - Body: { title, content, tags }
   - Update entry + regenerate ai_summary

4. DELETE /api/v1/diary/entries/:id
   - Auth: Required + owner check
   - Soft delete or hard delete (spec decision)

5. GET /api/v1/diary/monthly?year=2025&month=1
   - Auth: Required
   - Return heat map: { day: 1, emotion_density: 5, emotions: {happy: 2, stressed: 1, ...} }
   - Used for calendar visualization

Service: internal/diary/service.go
- Aggregates checkins → auto-generates daily entry if none exists
- Compiles entry narrative from checkins + reflections
- Tag suggestion via keyword extraction (simple NLP or hardcoded patterns)

Database transactions + error handling for concurrent updates.
```

#### Prompt A4: Gigachat AI Integration
```
Integrate Sberbank Gigachat API for emotion analysis and personalized insights.

Service: internal/ai/gigachat.go

Requirements:
1. OAuth 2.0 token management
   - POST https://ngw.devices.sberbank.ru:9443/api/v2/oauth
   - Body: {scope: "GIGACHAT_API_PERS"}
   - Headers: Authorization: Basic {base64(client_id:client_secret)}, RqUID: {uuid4}
   - Cache token in memory, refresh 5 min before expiry
   - Implement exponential backoff for token refresh failures

2. Completions endpoint: POST https://gigachat.devices.sberbank.ru/api/v1/completions
   - Models available: GigaChat, GigaChat-Pro
   - Used for weekly insight generation

3. Chat endpoint: POST https://gigachat.devices.sberbank.ru/api/v1/chat
   - Used for streaming real-time pet dialogue

Functions:
1. GenerateWeeklyInsight(userID string, checkins []MoodCheckin) -> InsightResponse
   - Prompt: "User logged emotions: [happy 3x, stressed 5x, calm 2x]. Reflection texts: [...]. 
     Generate personalized weekly summary (max 150 words) identifying mood triggers and wellness advice."
   - Parse response JSON
   - Store in emotional_insights table
   - Return: { insight_text, recommendations: [...], generated_at }

2. GeneratePetDialogue(petName, userStreak, lastEmotion) -> string
   - Prompt: "Pet name: {petName}. User streak: {userStreak} days. Last emotion: {lastEmotion}. 
     Generate 1-sentence cute response (max 100 chars) encouraging check-in consistency."
   - Return dialogue string for pet interaction

3. GenerateMoodTriggers(userID, days=30) -> TriggerAnalysis
   - Analyze last N days of emotions + reflections
   - Identify patterns: "Stressed on Mondays" or "Happy after exercise"
   - Return: { trigger: string, frequency: int, recommendation: string }[]

Error handling:
- Retry failed requests with exponential backoff (max 3 retries)
- Log Gigachat errors for monitoring
- Fallback to hardcoded messages if AI unavailable
- Rate limit: 20 Gigachat calls/minute per user (cost optimization)

Client: Implement using net/http with custom headers + timeout (10s).
Config: Store CLIENT_ID, CLIENT_SECRET in .env (never hardcode).
```

#### Prompt A5: Pet System & Gamification
```
Implement virtual pet system with state management and gamification logic.

Endpoints:
1. GET /api/v1/pet
   - Auth: Required
   - Return: { pet_id, user_id, name, pet_type, happiness_level, cosmetic_skin, created_at, last_fed_at }

2. POST /api/v1/pet/feed
   - Auth: Required
   - Logic:
     a. Update pet.happiness_level += 10 (cap at 100)
     b. Update last_fed_at to now
     c. Get Gigachat dialogue for this interaction
     d. Return: { happiness_level, dialogue: string }

3. POST /api/v1/pet/customize
   - Auth: Required
   - Body: { cosmetic_skin: string, name?: string }
   - Validate skin is unlocked (based on streaks/milestones)
   - Return: { cosmetic_skin, message: "Customized!" }

4. PUT /api/v1/pet/name
   - Body: { name: string }
   - Update pet.name

Service: internal/pet/service.go
- UpdatePetHappiness(petID, delta int) -> error
- GetPetAnimationState(happiness int) -> PetState
  - 0-30: Sad (droopy ears, slow animation)
  - 31-60: Neutral (normal animation)
  - 61-100: Happy (bouncy, playful animation)

- UnlockCosmetic(userID, cosmeticID) 
  - Called when streak milestones reached (10, 30, 100 days)
  - Logic: if current_streak % 10 == 0, unlock next cosmetic

Database:
- pets table: { id, user_id, name, pet_type, happiness_level, cosmetic_skin, last_fed_at }
- pet_cosmetics table: { id, name, unlock_requirement, price_premium_currency? }
- pet_interactions table: { id, pet_id, interaction_type, created_at }

Happiness decay: Nightly batch job: if last_fed_at > 24h, decrement happiness by 5.
```

#### Prompt A6: Subscription & Premium Features
```
Implement Stripe integration for premium subscription management.

Endpoints:
1. POST /api/v1/subscriptions/create
   - Auth: Required
   - Body: { tier: "premium" | "premium_annual", payment_method_id: string }
   - Create Stripe customer if not exists
   - Create subscription with Stripe API
   - Store stripe_subscription_id in subscriptions table
   - Update users.subscription_tier = "premium", expires_at = now + 30 days
   - Return: { subscription_id, tier, expires_at, payment_status }

2. GET /api/v1/subscriptions/status
   - Auth: Required
   - Return current user's subscription tier + expiry + usage stats (if applicable)

3. POST /api/v1/subscriptions/cancel
   - Auth: Required
   - Cancel Stripe subscription
   - Set users.subscription_tier = "free"
   - Schedule data retention (keep data for 30 days, then archive)

4. POST /api/v1/subscriptions/webhook
   - Stripe webhook for payment.succeeded, customer.subscription.deleted, etc.
   - No auth required (verify Stripe signature in middleware)
   - Update users table based on event type

Premium feature gates:
- GET /api/v1/insights/* → Check users.subscription_tier, return 403 PREMIUM_REQUIRED if free
- GET /api/v1/checkins/stats → Premium only
- Export endpoints → Premium only

Service: internal/subscription/service.go
- Initialize Stripe client with API key from .env
- Implement webhook signature verification
- Handle idempotency for payment processing

Database:
- subscriptions table: { id, user_id, tier, start_date, end_date, stripe_subscription_id, created_at }
```

---

### PART B: FRONTEND IMPLEMENTATION PROMPTS

#### Prompt B1: React App Setup & State Management
```
Set up a production-grade React + TypeScript app with Brojs state management.

Deliverables:
1. src/App.tsx
   - Root component with routing (React Router v6)
   - Theme provider (Emotion)
   - Auth context wrapper
   - Error boundary
   - Global notification/toast system

2. src/store/index.ts
   - Brojs store initialization
   - State structures:
     a. userStore: { user, isAuthenticated, subscription_tier }
     b. checkinStore: { checkins, today_checkin, streak, loading }
     c. diaryStore: { entries, selected_entry, filters }
     d. petStore: { pet, happiness_level, animation_state }
     e. uiStore: { notifications, modal_state, loading_modals }

3. src/hooks/
   - useAuth(): Access auth state + login/logout/register
   - useStoreState(): Generic hook for any Brojs store
   - useLocalStorage(): Offline sync for checkins
   - usePagination(): Handle diary pagination

4. src/services/api.client.ts
   - Axios instance with:
     a. Base URL: process.env.REACT_APP_API_URL
     b. Auto token injection from localStorage
     c. Error interceptor: 401 → logout, 403 → show premium modal
     d. Request/response logging (non-production)
   - Export API client singleton

5. .env.example
   - REACT_APP_API_URL=http://localhost:8080/api/v1
   - REACT_APP_STRIPE_KEY=pk_test_...
   - REACT_APP_ENV=development

6. tsconfig.json
   - Strict mode enabled
   - Path aliases: @components, @hooks, @services, etc.

7. package.json with dependencies:
   - react, react-dom, react-router-dom
   - typescript, @types/react
   - brojs for state management
   - framer-motion for animations
   - @emotion/react, @emotion/styled for styling
   - axios for HTTP
   - stripe for payments
   - react-query or swr for data fetching (optional, can use hooks + services)

Generate complete setup code with no npm install needed beyond initial step.
```

#### Prompt B2: Authentication UI Components
```
Create authentication forms and protected routes.

Components:
1. src/components/auth/LoginForm.tsx
   - Form fields: email, password
   - Validation: email format, password min 8 chars
   - Submit handler calls authService.login()
   - Loading spinner during submit
   - Error message display
   - "Forgot password?" link (no backend, but UI ready)
   - "Sign up" link to register form
   - Framer Motion: fade in animation

2. src/components/auth/RegisterForm.tsx
   - Form fields: email, password, password_confirm, username
   - Validation: username 3-20 chars, password match
   - Submit handler calls authService.register()
   - Success → auto login → redirect to dashboard
   - Error handling for duplicate email/username

3. src/components/auth/ProtectedRoute.tsx
   - Check isAuthenticated from userStore
   - If not auth → redirect to /login
   - If auth but free tier + premium route → show modal
   - Pass through if all checks pass

4. src/pages/LoginPage.tsx
   - Center card layout
   - Emotion theming: gradient background
   - Logo + app title
   - LoginForm component
   - Social login buttons (UI only, backend not required yet)

5. src/pages/RegisterPage.tsx
   - Similar layout to LoginPage
   - RegisterForm component

Service: src/services/auth.service.ts
- login(email, password): POST /api/v1/auth/login → store token + user
- register(email, password, username): POST /api/v1/auth/register
- logout(): Clear token + userStore.logout()
- refreshToken(): POST /api/v1/auth/refresh
- auto-refresh token on app load if exists

Use useNavigate() for redirects.
Emotion CSS for styling.
Framer Motion for form entrance animations.
```

#### Prompt B3: Quick Check-in Component
```
Build the core mood check-in interface with animations.

Components:
1. src/components/checkin/EmotionSelector.tsx
   - 6 emotion buttons in 2x3 grid
   - Each button: emoji (large), name, color background
   - Selected button: scale up + glow effect
   - onClick → pass emotion_id to parent
   - Framer Motion: stagger animation on mount

   Emotions: happy, sad, angry, calm, stressed, excited

2. src/components/checkin/IntensitySlider.tsx
   - Horizontal slider (1-10 scale)
   - Labels: "Mild" (1) to "Intense" (10)
   - Visual feedback: color changes from green → red
   - Displays current value
   - onChange handler

3. src/components/checkin/ReflectionInput.tsx
   - Textarea: max 500 chars, placeholder: "What's on your mind? (optional)"
   - Char counter: "123/500"
   - Floating label animation
   - Clean, minimal style

4. src/components/checkin/CheckinConfirmation.tsx
   - Modal that appears after successful submit
   - Shows: "✓ Mood logged!", emotion emoji large, streak counter
   - Animated pet reaction (calls petStore to display happy animation)
   - Auto-closes after 2 seconds

5. src/components/checkin/QuickCheckIn.tsx (Main container)
   - State: selectedEmotion, intensity, reflection, isSubmitting
   - Layout: centered card, vertical stack
   - Submit button: disabled until emotion selected
   - Loading spinner on button during submit
   - Call useCheckin() hook to submit via API
   - Show toast notification on success/error
   - On success: reset form + show CheckinConfirmation modal

Hook: src/hooks/useCheckin.ts
- Mutation function to POST /api/v1/checkins
- Handle loading/error states
- Auto-update checkinStore on success
- Trigger pet happiness update in petStore

Animations:
- EmotionSelector buttons: staggered entrance
- IntensitySlider: smooth color transition on value change
- Confirmation modal: scale + fade in
- Success toast: slide in from bottom

Styling with Emotion:
- Theme colors for each emotion
- Gradient background for card
- Responsive layout (mobile-first)
```

#### Prompt B4: Pet Companion Display & Interactions
```
Create animated pet display with interaction mechanics.

Components:
1. src/components/pet/PetDisplay.tsx
   - Container with animated SVG pet
   - Displays pet name + type
   - Shows happiness level (emoji indicators: 😢 😐 😊 😄)
   - Streak badge below pet
   - Interaction buttons (feed, pet, talk)
   - Pet animates based on happiness state
   - Layout: centered, takes up 40% of screen on desktop

2. src/components/pet/PetAnimation.tsx
   - SVG-based pet rendering (or canvas if more complex)
   - 3 animation states:
     a. Sad (0-30): droopy ears, slow bobbing motion
     b. Neutral (31-60): standing still, occasional blink
     c. Happy (61-100): bouncy, playful rotation, frequent animations
   - Framer Motion: drive all animations
   - Customize skin: change SVG fill colors based on cosmetic_skin prop

3. src/components/pet/PetInteraction.tsx
   - 3 buttons in row: Feed, Pet, Talk
   - Each button calls respective API endpoint
   - Shows loading spinner while request pending
   - Displays Gigachat-generated dialogue in speech bubble above pet
   - Dialogue animates in + out

4. src/components/pet/PetCustomizer.tsx
   - Modal with cosmetic skin options
   - Show unlocked skins (enabled buttons)
   - Show locked skins with "Unlock at X-day streak" label
   - Preview selected skin before applying
   - Save button → POST /api/v1/pet/customize

5. src/components/common/StreakBadge.tsx
   - Circular badge showing current streak number
   - Color: gold for 7+, silver for 3-6, bronze for 1-2
   - Position: bottom-right of pet container
   - Animated pulse effect every checkin

Store: src/store/pet.store.ts
- State: { pet, happiness_level, animation_state, dialogue }
- Actions: setPet, updateHappiness, setDialogue
- Selectors: getPetAnimationState, getUnlockedCosmetics

Hooks: src/hooks/usePet.ts
- usePetInteraction(interaction_type): POST to /api/v1/pet/{feed|pet|talk}
- Returns: happiness_level, dialogue, animation_state

Animations:
- Sad pet: droopy ears (rotateZ), slow vertical bobbing
- Happy pet: bouncy motion (y: [0, -20, 0]), playful rotation
- Dialogue: fade in + slide up, display 3 seconds, fade out
- Streak badge: pulse effect (scale) every time incremented

Styling:
- Pet container: glass-morphism card effect (semi-transparent)
- Dialogue bubble: positioned above pet, white with shadow
- Buttons: emoji-based (🍖 for feed, 🤚 for pet, 💬 for talk)
```

#### Prompt B5: Diary Timeline & Entry Display
```
Create diary entry timeline with filtering and visualization.

Components:
1. src/components/diary/DiaryTimeline.tsx
   - Vertical timeline layout (newest → oldest)
   - Each entry as card
   - Infinite scroll pagination: load 10 entries, load more on scroll
   - Tag filter bar at top: click tag to filter entries
   - Search by date range: datepicker for start/end
   - Framer Motion: stagger animation on initial load

2. src/components/diary/DiaryEntry.tsx
   - Card layout with:
     a. Entry title (or auto-generated title from date)
     b. Entry date + time
     c. Mood heat map for that day (5 small circles showing emotions)
     d. Content preview (first 150 chars)
     e. Tags as small pills
     f. Click → expand full entry
   - Hover effect: subtle shadow + scale

3. src/components/diary/EntryEditor.tsx
   - Modal form for create/edit entry
   - Fields: title, content (rich text or textarea), tags
   - Tag selector: autocomplete from existing + create new
   - Save/Cancel buttons
   - Submit: POST (create) or PUT (edit) /api/v1/diary/entries

4. src/components/diary/MonthlyHeatmap.tsx
   - Calendar grid (7 cols x 5 rows for month)
   - Each day box: colored by emotion density
   - Color scale: white (0 emotions) → red (5+ emotions)
   - Hover shows emotion breakdown for day
   - Click → navigate to day view in timeline
   - Navigation arrows for prev/next month

5. src/components/diary/TagManager.tsx
   - Multi-select dropdown for tags
   - Show popular tags first
   - Custom tag input
   - Show tag count + color indicator

Store: src/store/diary.store.ts
- State: { entries, selected_entry, filters: { tag_ids, date_range }, loading }
- Actions: setEntries, setSelectedEntry, updateFilter
- Selectors: getFilteredEntries, getEntryById

Hooks: src/hooks/useDiary.ts
- useDiaryEntries(filters, pagination): GET /api/v1/diary
- useCreateEntry(formData): POST /api/v1/diary/entries
- useUpdateEntry(entryId, formData): PUT /api/v1/diary/entries/:id
- useDeleteEntry(entryId): DELETE /api/v1/diary/entries/:id
- useDiaryStats(month): GET /api/v1/diary/monthly for heatmap

Animations:
- Timeline entries: stagger animation on load
- Entry expand: height animation from collapsed to expanded
- Heatmap cells: color transition on day change
- Filter bar: slide in from top

Styling with Emotion:
- Entry cards: white with subtle shadow + border-radius
- Tags: small pills with color backgrounds
- Heatmap: CSS grid with gradient colors
- Responsive: single column on mobile, full layout on desktop
```

#### Prompt B6: AI Insights & Premium Features
```
Create insights display and premium feature components.

Components:
1. src/components/insights/WeeklyInsight.tsx
   - Card displaying AI-generated weekly summary (Gigachat)
   - Shows: summary text + key findings
   - Recommendations section (bulleted list)
   - "This Week" header with date range
   - Loading skeleton if still generating
   - Refresh button to regenerate
   - Helpful/Not helpful buttons for feedback

2. src/components/insights/MoodTriggers.tsx
   - Table/list showing detected mood triggers
   - Columns: Trigger | Frequency | Recommendation
   - Examples: "Stressed on Mondays", "Happy after exercise"
   - Sortable by frequency

3. src/components/insights/RecommendationCard.tsx
   - Individual recommendation with icon
   - Examples: "Try morning walk", "Practice breathing exercises"
   - CTA button: "Learn more" → external resource

4. src/components/premium/PremiumUpgradeCard.tsx
   - Featured card on free tier dashboard
   - Shows premium benefits (checkmarks)
   - "Upgrade to Premium" button → calls SubscriptionModal
   - Pricing: $4.99/month or annual discount

5. src/components/premium/SubscriptionManager.tsx
   - Modal for subscription management
   - If free: show upgrade options (monthly/annual)
   - If premium: show current plan + expiry + cancel button
   - Stripe payment form for checkout
   - Success confirmation

6. src/components/premium/ExportModal.tsx
   - Export options: PDF, JSON, CSV
   - Date range selector (export last 30/90/365 days)
   - Preview: "You're about to export X entries"
   - Export button → triggers download
   - Animated progress bar during export

Hooks:
- useInsights(): GET /api/v1/insights/weekly, triggers
- useSubscription(): GET /api/v1/subscriptions/status
- useExport(format, dateRange): GET /api/v1/export/{diary|pdf}

Services:
- src/services/insights.service.ts: AI insight fetching
- src/services/subscription.service.ts: Stripe integration
- src/services/export.service.ts: File generation

Premium gate:
- Check userStore.subscription_tier
- Show "Premium only" overlay on insights
- Nudge toward upgrade with CTA button

Animations:
- WeeklyInsight: fade in + slide up when loaded
- Recommendations: staggered list animation
- UpgradeCard: attention-grabbing pulse/glow effect
- Subscription modal: scale + fade in

Styling:
- Insight cards: gradient background (subtle)
- Premium CTA: eye-catching color (purple/gold)
- Export progress: animated progress bar
```

#### Prompt B7: Pages & Navigation
```
Create main app pages and navigation structure.

Pages:
1. src/pages/Dashboard.tsx
   - Main app landing after login
   - Layout: 3 columns (desktop) or tabs (mobile)
     Column 1: Quick Check-in widget (QuickCheckIn component)
     Column 2: Pet Companion (PetDisplay + PetInteraction)
     Column 3: Today's Summary (mood timeline + top emotion)
   - Top: Header with user avatar + settings link
   - Bottom: Navigation tabs (Dashboard, Diary, Insights, Settings)

2. src/pages/DiaryPage.tsx
   - Full page for diary exploration
   - Left sidebar: MonthlyHeatmap
   - Main: DiaryTimeline
   - Right sidebar (desktop): selected entry full view or stats
   - Mobile: stacked layout

3. src/pages/InsightsPage.tsx
   - Grid layout: 2 columns
     Left: WeeklyInsight large card
     Right: MoodTriggers list
   - Below: RecommendationCards (horizontal scroll)
   - "Powered by Gigachat" footer
   - If free tier: overlay with upgrade CTA

4. src/pages/SettingsPage.tsx
   - Form sections:
     a. Profile: username, avatar, bio
     b. Preferences: notification time, theme, language
     c. Privacy: data export, analytics consent
     d. Subscription: current tier, billing
   - Save button per section

5. src/pages/LoginPage.tsx & RegisterPage.tsx
   - (Already described in B2, but finalize layout here)

Components:
1. src/components/common/Header.tsx
   - Logo + app name (left)
   - User menu (right): avatar → dropdown with settings/logout
   - Mobile: hamburger menu
   - Fixed at top

2. src/components/common/Navigation.tsx
   - Bottom nav bar (mobile) or side nav (desktop)
   - 4 tabs: Home, Diary, Insights, Settings
   - Active tab highlight
   - Icons + labels

3. src/components/common/Sidebar.tsx (optional)
   - Desktop-only left sidebar
   - User info card at top
   - Quick stats: streak, total entries
   - Premium badge if applicable
   - Collapse/expand toggle

Router: src/App.tsx
Routes:
  /login → LoginPage (public)
  /register → RegisterPage (public)
  / → Dashboard (protected)
  /diary → DiaryPage (protected)
  /insights → InsightsPage (protected)
  /settings → SettingsPage (protected)
  /premium → SubscriptionManager (protected)
  * → 404 page

Layout wrapper:
- ProtectedRoute guards all private routes
- Header + Navigation on all private pages
- No header/nav on login/register

State management integration:
- userStore to check authentication
- Check subscription_tier for premium features
- Display premium prompts on free tier

Responsive design:
- Desktop: full layout with all components
- Tablet: 2-column layout
- Mobile: stacked + bottom nav
```

---

## 9. INTEGRATION CHECKLIST & DEPLOYMENT

### Development Environment Setup
```bash
# Backend
go mod init emotion-diary-backend
go get github.com/gin-gonic/gin
go get github.com/jackc/pgx/v4
go get github.com/golang-jwt/jwt/v5
go get github.com/sirupsen/logrus
docker-compose up -d postgres redis

# Frontend
npx create-react-app emotion-diary-frontend --template typescript
npm install brojs framer-motion @emotion/react stripe axios react-router-dom
npm start
```

### Pre-Launch Checklist
- [ ] Gigachat API credentials configured
- [ ] PostgreSQL migrations tested
- [ ] Stripe test keys set in .env
- [ ] CORS configured correctly
- [ ] JWT refresh token logic tested
- [ ] Rate limiting verified
- [ ] Offline support (localStorage sync) working
- [ ] Error boundaries catching crashes
- [ ] Analytics (Mixpanel/PostHog) integrated
- [ ] GDPR compliance reviewed
- [ ] Security headers (CSP, X-Frame-Options) added

### Monitoring & Analytics
- Server logs: Structured logging (JSON) sent to Datadog/LogRocket
- Frontend: Sentry error tracking + Mixpanel event tracking
- Gigachat usage: Monitor token consumption, alert if >80% monthly quota

---

## 10. FUTURE ENHANCEMENTS (Phase 2)

1. **Social Features:** Share emotional journey anonymously, mood challenges with friends
2. **Mobile App:** React Native or Flutter version
3. **Voice Journaling:** Record mood + reflection via audio, transcribed via speech-to-text
4. **Calendar Sync:** Integrate Google Calendar to correlate moods with events
5. **Wearable Integration:** Apple Watch/Fitbit stress data correlation
6. **Personalized AI Coaching:** Real-time mood interventions via Gigachat (not just insights)
7. **Family/Couple Version:** Share diary with trusted people (privacy-controlled)
8. **Therapist Integration:** Export for mental health professionals (HIPAA-compliant)

---

## END OF SPECIFICATION

This document provides complete technical guidance for Claude Code and AI agents to generate production-ready code with minimal manual intervention. All components, API endpoints, database schemas, and prompts are specified in sufficient detail for autonomous code generation.
