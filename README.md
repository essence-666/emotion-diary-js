# 📔 Emotion Diary

> A modern web application for tracking emotions, mental health journaling, and personal growth with AI-powered insights and a virtual pet companion.

[![Tests](https://img.shields.io/badge/tests-69%2F69-brightgreen)](./PROGRESS.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-blue)](https://react.dev/)
[![License](https://img.shields.io/badge/license-ISC-green)](./LICENSE)

## 📖 Project Overview

**Emotion Diary** is a comprehensive mental health and wellness application that helps users:

- 🎯 **Track Emotions**: Quick daily check-ins with intensity levels and reflections
- 📝 **Keep a Diary**: Write detailed journal entries with tags and search capabilities
- 🐾 **Grow a Virtual Pet**: Gamified companion that responds to your consistency and mood
- 📊 **Get AI Insights**: Receive personalized weekly summaries and mood pattern analysis powered by Gigachat
- 🔒 **Premium Features**: Advanced analytics, PDF export, and unlimited history

The app uses modern React patterns, Redux Toolkit for state management, and Chakra UI for a responsive, accessible interface that works seamlessly on desktop and mobile devices.

---

## ✨ Key Features

### Core Features (Free Tier)
- ✅ Daily mood check-ins with 6 emotions (happy, sad, angry, calm, stressed, excited)
- ✅ Intensity slider (1-10) and reflection notes
- ✅ Diary entries with markdown support
- ✅ Virtual pet companion with animations
- ✅ Streak tracking and gamification
- ✅ Monthly mood heatmap calendar
- ✅ Tag-based filtering and search
- ✅ Responsive design (mobile + desktop)

### Premium Features
- 🌟 AI-powered weekly insights (Gigachat integration)
- 🌟 Mood trigger detection and pattern analysis
- 🌟 Personalized recommendations
- 🌟 Export diary to PDF/JSON/CSV
- 🌟 Unlimited diary history
- 🌟 Advanced analytics dashboard
- 🌟 Pet cosmetic skins and customization

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 18.3.1](https://react.dev/) with TypeScript (strict mode)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) + [RTK Query](https://redux-toolkit.js.org/rtk-query/overview) for API caching
- **UI Library**: [Chakra UI](https://chakra-ui.com/) v2.10.8
- **Styling**: [@emotion/react](https://emotion.sh/) + [@emotion/styled](https://emotion.sh/docs/styled)
- **Animations**: [Framer Motion](https://www.framer.com/motion/) v10.18
- **Routing**: [React Router](https://reactrouter.com/) v6
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/) + [@chakra-ui/icons](https://chakra-ui.com/docs/components/icon)

### Backend
- **Build Tool**: [@brojs/cli](https://www.npmjs.com/package/@brojs/cli) v1.9.4
- **API**: Express.js with stub endpoints (stubs/api/)
- **AI Integration**: [LangChain](https://js.langchain.com/) with Gigachat, DeepSeek, Ollama
- **Database**: PostgreSQL (via [pg](https://node-postgres.com/))
- **Authentication**: JWT tokens with [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
- **API Documentation**: [Swagger UI](https://swagger.io/tools/swagger-ui/) at `/api/api-docs`

### Testing
- **Test Framework**: [Jest](https://jestjs.io/) v30.2
- **React Testing**: [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro/) v16.3
- **Environment**: [jest-environment-jsdom](https://jestjs.io/docs/configuration#testenvironment-string) for DOM testing
- **Type Support**: [ts-jest](https://kulshekhar.github.io/ts-jest/) v29.4

---

## 🚀 Local Development

### Prerequisites

- **Node.js**: v18+ (recommended: v20.x LTS)
- **npm**: v9+
- **Git**: Latest version

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/essence-666/emotion-diary-js.git
   cd emotion-diary-js
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory:
   ```bash
   # API Configuration (automatically runs on port 8099)
   REACT_APP_API_URL=http://localhost:8099/api
   REACT_APP_ENV=development

   # Stripe (for premium subscriptions)
   REACT_APP_STRIPE_KEY=pk_test_...

   # Optional: AI Services
   GIGACHAT_API_KEY=your_gigachat_key
   DEEPSEEK_API_KEY=your_deepseek_key
   ```

4. **Start the development server**:
   ```bash
   npm start
   ```
   The app will open automatically at `http://localhost:8099/emotion-diary`

   **Important**: The app is served at the `/emotion-diary` base path:
   - **Home/Dashboard**: `http://localhost:8099/emotion-diary/`
   - **Login**: `http://localhost:8099/emotion-diary/login`
   - **Check-in**: `http://localhost:8099/emotion-diary/checkin`
   - **API**: `http://localhost:8099/api`

   **Note**: Don't navigate to `http://localhost:8099/login` directly - always include the `/emotion-diary` prefix.

### API & Swagger Documentation

The project includes a fully functional Express.js API that runs automatically when you start the dev server.

**API Base URL**: `http://localhost:8099/api`

**Swagger UI**: `http://localhost:8099/api/api-docs`

Available endpoints:
- `/api/auth` - Authentication (login, register, refresh token)
- `/api/checkins` - Mood check-ins
- `/api/diary` - Diary entries (CRUD)
- `/api/pet` - Virtual pet interactions
- `/api/insights` - AI-powered insights (Gigachat)
- `/api/prompts` - AI prompt management
- `/api/subscriptions` - Premium subscriptions

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed API usage examples.

### Development Scripts

```bash
# Start dev server with hot reload
npm start

# Run tests in watch mode
npm test:watch

# Run tests with coverage report
npm test:coverage

# Run all tests once
npm test

# Build for development (with source maps)
npm run build

# Build for production (minified, optimized)
npm run build:prod

# Lint code
npm run eslint

# Auto-fix linting issues
npm run eslint:fix

# Clean build artifacts
npm run clean

# Start LangGraph dev server (for AI features)
npm run langgraph
```

### Mock Authentication (Development Mode)

The app includes a **mock authentication system** for rapid development without a backend:

#### Auto-Enabled in Development

Mock auth is automatically enabled when `NODE_ENV=development`. You'll see:

```
🔓 Mock auth enabled
👤 Mock User Tier: free
📧 Email: dev@example.com
🛠️  Mock auth utilities available: window.mockAuth
```

#### Console Utilities

Open browser DevTools console and use:

```javascript
// Check current mock auth status
window.mockAuth.status()

// Toggle between free and premium tiers
window.mockAuth.toggleTier()
// Returns: 'premium' or 'free'

// Manually disable mock auth (use real backend)
window.mockAuth.disable()

// Re-enable mock auth
window.mockAuth.enable()
```

#### Manual Control via localStorage

```javascript
// Enable/disable mock auth
localStorage.setItem('MOCK_AUTH_ENABLED', 'true')  // or 'false'

// Set user tier
localStorage.setItem('MOCK_USER_TIER', 'premium')  // or 'free'

// Check settings
localStorage.getItem('MOCK_AUTH_ENABLED')
localStorage.getItem('MOCK_USER_TIER')
```

#### Mock User Details

When mock auth is enabled, you're automatically logged in as:

- **Email**: `dev@example.com`
- **Username**: `Developer`
- **User ID**: `1`
- **Tier**: `free` (or `premium` if toggled)
- **Token**: Valid mock JWT with 24-hour expiry

#### How It Works

Mock auth prevents the redirect loop during development:

1. **On App Mount**: The `useAuth` hook sets `loading: true` immediately
2. **Auth Check**: Detects `NODE_ENV=development` and mock auth enabled
3. **Auto-Login**: Creates mock user, stores tokens, updates Redux state
4. **Loading Complete**: Sets `loading: false`, allowing protected routes to render

**Before the Fix**: `ProtectedRoute` checked auth before the `useAuth` effect ran, causing immediate redirect to `/login`.

**After the Fix**: `ProtectedRoute` shows a loading spinner while `useAuth` completes the auth check, then renders protected content once authenticated.

If you experience redirects to `/login` despite mock auth being enabled:
1. Clear localStorage: `localStorage.clear()` and refresh
2. Check console for "🔓 Mock auth: Auto-logged in as dev@example.com"
3. Verify `window.mockAuth.status()` shows enabled
4. If issue persists, restart the dev server

### Theme System (Light/Dark Mode)

The app includes automatic theme detection that syncs with your system preferences:

#### Automatic Theme Detection

- **System Detection**: On first load, the app detects your OS theme (light/dark)
- **Auto-Sync**: Theme automatically updates when you change your OS theme
- **Persistence**: Manual theme changes are saved to localStorage

#### Changing Theme

1. **Using the Theme Toggle**:
   - Desktop: Click the sun/moon icon in the sidebar footer
   - Mobile: Tap the "Theme" button in the bottom navigation

2. **Console Commands**:
   ```javascript
   // Get current theme
   localStorage.getItem('chakra-ui-color-mode')  // 'light' or 'dark'

   // Manually set theme
   localStorage.setItem('chakra-ui-color-mode', 'dark')  // or 'light'
   localStorage.removeItem('chakra-ui-color-mode')  // Reset to system default

   // Refresh page to apply
   location.reload()
   ```

3. **System Theme**: If you haven't manually set a theme, it will follow your OS settings:
   - macOS: System Preferences → General → Appearance
   - Windows: Settings → Personalization → Colors
   - Linux: Depends on your desktop environment

**Note**: If the app starts in the wrong theme, manually toggle it once. Your preference will be saved for future visits.

### SPA Routing (404 Fix)

The app uses **React Router** for client-side navigation. The dev server is configured with `historyApiFallback: true` to handle page refreshes correctly.

If you experience 404 errors when refreshing pages:

1. **Restart the dev server** after pulling updates:
   ```bash
   npm start
   ```

2. **Check bro.config.js** has the devServer configuration:
   ```javascript
   webpackConfig: {
     devServer: {
       historyApiFallback: true  // This should be present
     }
   }
   ```

3. **For production**: Configure your web server (nginx/Apache) to serve `index.html` for all routes:
   ```nginx
   # nginx example
   location / {
     try_files $uri $uri/ /index.html;
   }
   ```

---

## 📁 Project Structure

```
emotion-diary-js/
├── src/
│   ├── __data__/                  # Redux Toolkit state management
│   │   ├── api.ts                 # RTK Query API configuration
│   │   ├── store.ts               # Redux store setup
│   │   └── slices/
│   │       ├── authSlice.ts       # Authentication state
│   │       ├── checkinSlice.ts    # Mood check-ins state
│   │       ├── diarySlice.ts      # Diary entries state
│   │       ├── petSlice.ts        # Virtual pet state
│   │       └── uiSlice.ts         # UI state (modals, notifications)
│   │
│   ├── __tests__/                 # Test utilities and fixtures
│   │   └── utils/
│   │       ├── test-utils.tsx     # Custom render with providers
│   │       └── mock-data.ts       # Mock data fixtures
│   │
│   ├── components/                # React components
│   │   ├── auth/                  # Authentication components
│   │   │   ├── LoginForm.tsx      # Login form with validation
│   │   │   ├── RegisterForm.tsx   # Registration form
│   │   │   └── ProtectedRoute.tsx # Route guard with tier checking
│   │   │
│   │   ├── layout/                # Layout components
│   │   │   ├── AppLayout.tsx      # Main layout wrapper
│   │   │   ├── Sidebar.tsx        # Desktop sidebar navigation
│   │   │   └── BottomNav.tsx      # Mobile bottom navigation
│   │   │
│   │   ├── checkin/               # Mood check-in components
│   │   │   ├── EmotionSelector.tsx
│   │   │   ├── IntensitySlider.tsx
│   │   │   ├── ReflectionInput.tsx
│   │   │   └── QuickCheckIn.tsx
│   │   │
│   │   ├── diary/                 # Diary components
│   │   │   ├── DiaryEntry.tsx
│   │   │   ├── DiaryTimeline.tsx
│   │   │   ├── EntryEditor.tsx
│   │   │   └── MonthlyHeatmap.tsx
│   │   │
│   │   ├── pet/                   # Virtual pet components
│   │   │   ├── PetAnimation.tsx
│   │   │   ├── PetDisplay.tsx
│   │   │   └── PetCustomizer.tsx
│   │   │
│   │   ├── insights/              # AI insights components (Premium)
│   │   │   ├── WeeklyInsight.tsx
│   │   │   └── MoodTriggers.tsx
│   │   │
│   │   └── premium/               # Premium subscription components
│   │       ├── PremiumUpgradeCard.tsx
│   │       └── SubscriptionManager.tsx
│   │
│   ├── hooks/                     # Custom React hooks
│   │   ├── useAuth.ts             # Authentication hook
│   │   ├── useCheckin.ts          # Mood check-in hook
│   │   ├── useDiary.ts            # Diary entries hook
│   │   ├── usePet.ts              # Virtual pet hook
│   │   └── useInsights.ts         # AI insights hook
│   │
│   ├── pages/                     # Page components
│   │   ├── LoginPage.tsx          # Login page
│   │   ├── RegisterPage.tsx       # Registration page
│   │   ├── Dashboard.tsx          # Main dashboard
│   │   ├── CheckInPage.tsx        # Check-in page
│   │   ├── DiaryPage.tsx          # Diary timeline page
│   │   ├── PetPage.tsx            # Pet interaction page
│   │   └── SettingsPage.tsx       # User settings page
│   │
│   ├── service/                   # API service layer
│   │   ├── api.client.ts          # Axios client setup
│   │   ├── auth.service.ts        # Auth API calls
│   │   ├── checkin.service.ts     # Check-in API calls
│   │   ├── diary.service.ts       # Diary API calls
│   │   └── pet.service.ts         # Pet API calls
│   │
│   ├── types/                     # TypeScript type definitions
│   │   └── index.ts               # Shared types (User, Checkin, etc.)
│   │
│   ├── utils/                     # Utility functions
│   │   └── mockAuth.ts            # Mock authentication for development
│   │
│   ├── app.tsx                    # Main app component with routing
│   ├── index.tsx                  # Entry point
│   └── setupTests.ts              # Jest test setup
│
├── .env                           # Environment variables (local)
├── .env.example                   # Example environment variables
├── jest.config.js                 # Jest configuration
├── tsconfig.json                  # TypeScript configuration
├── package.json                   # Dependencies and scripts
├── PROGRESS.md                    # Detailed implementation progress
├── DEV_GUIDE.md                   # Quick start development guide
└── README.md                      # This file
```

---

## 🧪 Testing

### Test Coverage

Current test status: **69/69 tests passing (100%)** ✅

| Suite | Status | Coverage |
|-------|--------|----------|
| Auth Service | ✅ 18/18 | 100% |
| useAuth Hook | ✅ 15/15 | 100% |
| ProtectedRoute | ✅ 6/6 | 100% |
| LoginForm | ✅ 10/10 | 100% |
| LoginPage | ✅ 6/6 | 100% |
| ThemeProvider | ✅ 7/7 | 100% |
| ThemeToggle | ✅ 7/7 | 100% |

### Running Tests

```bash
# Run all tests once
npm test

# Watch mode (recommended for development)
npm test:watch

# Generate coverage report
npm test:coverage
```

### Test Structure

Tests are co-located with components using the `__tests__` directory pattern:

```
src/
├── components/auth/
│   ├── LoginForm.tsx
│   └── __tests__/
│       └── LoginForm.test.tsx
├── hooks/
│   ├── useAuth.ts
│   └── __tests__/
│       └── useAuth.test.tsx
└── service/
    ├── auth.service.ts
    └── __tests__/
        └── auth.test.ts
```

### Writing Tests

All tests use:
- **Jest** for test framework
- **React Testing Library** for component testing
- **Custom `renderWithProviders`** utility for Redux + Router + Chakra UI setup

Example:

```typescript
import { render, screen } from '../../../__tests__/utils/test-utils'
import { LoginForm } from '../LoginForm'

test('renders login form', () => {
  render(<LoginForm />)
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
})
```

---

## 🎨 Component Architecture

### Layout System

The app uses a **responsive layout pattern** that adapts to screen size:

- **Desktop (md+)**: Fixed sidebar (250px) on the left + scrollable main content
- **Mobile (base)**: Bottom navigation bar (80px) + full-width content

```typescript
// AppLayout automatically switches between layouts
<AppLayout>
  <YourPage />  {/* Main content here */}
</AppLayout>
```

### State Management

Uses **Redux Toolkit** with the following slices:

| Slice | Purpose | Key State |
|-------|---------|-----------|
| `authSlice` | User authentication | `user`, `token`, `isAuthenticated` |
| `checkinSlice` | Mood check-ins | `checkins[]`, `currentStreak`, `todayCheckin` |
| `diarySlice` | Diary entries | `entries[]`, `filters`, `selectedEntry` |
| `petSlice` | Virtual pet | `pet`, `happinessLevel`, `unlockedCosmetics[]` |
| `uiSlice` | UI state | `notifications[]`, `activeModal`, `isLoading` |

### API Layer (RTK Query)

API calls are handled by **RTK Query** with automatic caching:

```typescript
// Mutation hooks
const [login] = useLoginMutation()
const [createCheckin] = useCreateCheckinMutation()
const [updateDiaryEntry] = useUpdateDiaryEntryMutation()

// Query hooks
const { data: checkins } = useGetCheckinsQuery({ limit: 10 })
const { data: pet } = useGetPetQuery()
```

### Custom Hooks

Business logic is encapsulated in custom hooks:

| Hook | Purpose |
|------|---------|
| `useAuth()` | Authentication state and methods |
| `useCheckin()` | Mood check-in submission |
| `useDiary()` | Diary CRUD operations |
| `usePet()` | Pet interaction (feed, pet, talk) |
| `useInsights()` | AI insights fetching |

### Routing Structure

| Route | Component | Protected | Premium |
|-------|-----------|-----------|---------|
| `/login` | `LoginPage` | ❌ | ❌ |
| `/register` | `RegisterPage` | ❌ | ❌ |
| `/` | `Dashboard` | ✅ | ❌ |
| `/checkin` | `CheckInPage` | ✅ | ❌ |
| `/diary` | `DiaryPage` | ✅ | ❌ |
| `/pet` | `PetPage` | ✅ | ❌ |
| `/settings` | `SettingsPage` | ✅ | ❌ |
| `/analytics` | `AnalyticsPage` | ✅ | ✅ |

---

## 🔒 Authentication Flow

### JWT Token Management

- **Token Storage**: `localStorage` (key: `auth_token`, `refresh_token`)
- **Auto-Refresh**: Tokens are refreshed every 4 minutes (240s interval)
- **Expiry Handling**: Automatic logout on token expiry or 401 responses
- **Protected Routes**: `<ProtectedRoute>` wrapper checks authentication

### Token Structure

```typescript
{
  "sub": 1,                    // User ID
  "email": "user@example.com",
  "tier": "free",              // or "premium"
  "iat": 1640000000,           // Issued at timestamp
  "exp": 1640086400            // Expiry timestamp
}
```

### Login Flow

1. User submits email + password → `useLoginMutation()`
2. Backend returns `{ token, refreshToken, user }`
3. Tokens stored in `localStorage`
4. `authSlice` updated with user data
5. Redirect to dashboard (`/`)

### Auto-Login on Refresh

1. On app mount, `useAuth()` checks for existing token
2. If valid and not expired → auto-login with stored token
3. If expired → attempt refresh with `refreshToken`
4. If refresh fails → redirect to `/login`

---

## 📊 Premium Features

### Subscription Tiers

| Feature | Free | Premium |
|---------|------|---------|
| Daily check-ins | ✅ Unlimited | ✅ Unlimited |
| Diary entries | ✅ 30-day history | ✅ Unlimited history |
| Virtual pet | ✅ Basic | ✅ + Custom skins |
| AI insights | ❌ | ✅ Weekly summaries |
| Mood pattern analysis | ❌ | ✅ Advanced triggers |
| Export diary | ❌ | ✅ PDF/JSON/CSV |
| Analytics dashboard | ❌ | ✅ Full access |

### Upgrading to Premium

1. Click "Upgrade to Premium" button on dashboard
2. `<SubscriptionManager>` modal opens
3. Choose plan: Monthly ($4.99) or Annual ($49.99)
4. Enter payment via Stripe integration
5. Backend creates subscription → updates user tier
6. Frontend receives updated user object → unlocks features

---

## 🐛 Troubleshooting

### Common Issues

**1. "Cannot GET /login" or 404 on any route**

You're likely accessing the wrong URL. The app uses a base path:

❌ **Wrong**: `http://localhost:8099/login`
✅ **Correct**: `http://localhost:8099/emotion-diary/login`

**All routes must include the `/emotion-diary` prefix**:
- Dashboard: `http://localhost:8099/emotion-diary/`
- Login: `http://localhost:8099/emotion-diary/login`
- Checkin: `http://localhost:8099/emotion-diary/checkin`

This is configured in `bro.config.js` (`navigations`) and `app.tsx` (`<BrowserRouter basename="/emotion-diary">`).

**2. Theme doesn't match system theme on first load**

Clear localStorage and refresh:

```javascript
localStorage.removeItem('chakra-ui-color-mode')
location.reload()
```

Or manually toggle the theme once - your preference will be saved.

**3. CSP errors in console about Chrome DevTools**

This is a development-only warning and can be safely ignored. If it's blocking functionality:

- Check `bro.config.js` has relaxed CSP headers for development
- The app includes CSP configuration that allows DevTools connections

**4. 404 error when refreshing pages (after navigating within app)**

The dev server must be restarted to apply the `historyApiFallback` configuration:

```bash
# Stop the server (Ctrl+C) and restart
npm start
```

This is already configured in `bro.config.js` but requires a restart to take effect.

**5. "Cannot find module '@chakra-ui/icons'"**

```bash
npm install @chakra-ui/icons
```

**6. Tests failing with localStorage errors**

Ensure `setupTests.ts` includes localStorage mock:

```typescript
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock as any
```

**7. Redirected to /login despite mock auth enabled**

The app now properly handles mock auth initialization. If you still experience issues:

```javascript
// Clear all stored data and refresh
localStorage.clear()
location.reload()

// Verify mock auth is working
window.mockAuth.status()
```

Check console for "🔓 Mock auth: Auto-logged in as dev@example.com". If you don't see this message, restart the dev server.

**8. Port 8099 already in use**

Change port in `package.json`:

```json
"start": "brojs server --port=3000 --with-open-browser"
```

**9. ESLint errors**

Auto-fix most issues:

```bash
npm run eslint:fix
```

---

## 📚 Additional Documentation

- **[PROGRESS.md](./PROGRESS.md)** - Detailed implementation progress, test coverage, and known issues
- **[DEV_GUIDE.md](./DEV_GUIDE.md)** - Quick start guide with mock auth and troubleshooting
- **[frontend.md](./frontend.md)** - Original feature specifications and prompts

---

## 📝 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history and release notes.

To generate changelog entries, use the provided tools:

```bash
# Generate changelog for a new version
npm run changelog:generate

# View recent changes
npm run changelog:view
```

---

## 👥 Authors

- **Tiomfei Mashenkov** - [GitHub](https://github.com/essence-666)
- **Sergei Knyazkin**
- **Egor Belozerov**

---

## 📄 License

This project is licensed under the **ISC License**.

---

## 🙏 Acknowledgments

- [Chakra UI](https://chakra-ui.com/) for the amazing component library
- [Redux Toolkit](https://redux-toolkit.js.org/) for simplified state management
- [LangChain](https://js.langchain.com/) for AI integration framework
- [Gigachat](https://developers.sber.ru/docs/ru/gigachat/) (Sberbank) for AI-powered insights
- [Framer Motion](https://www.framer.com/motion/) for smooth animations

---

**Happy tracking! 🎯📔✨**
