# Development Quick Start Guide

## 🚀 Getting Started

### 1. Start the Development Server

```bash
npm start
```

The app will open at `http://localhost:8099` with **mock authentication enabled by default**.

### 2. Mock Authentication

Mock auth is automatically enabled in development mode. You'll be logged in as:
- **Email:** `dev@example.com`
- **Username:** `Developer`
- **Default Tier:** `free`

#### Console Utilities

Open your browser console and use these commands:

```javascript
// Check mock auth status
window.mockAuth.status()

// Toggle between free and premium
window.mockAuth.toggleTier()

// Disable mock auth (use real API)
window.mockAuth.disable()

// Re-enable mock auth
window.mockAuth.enable()
```

#### Manual Control

You can also control mock auth via localStorage:

```javascript
// Enable/disable
localStorage.setItem('MOCK_AUTH_ENABLED', 'true')
localStorage.setItem('MOCK_AUTH_ENABLED', 'false')

// Set tier
localStorage.setItem('MOCK_USER_TIER', 'premium')
localStorage.setItem('MOCK_USER_TIER', 'free')
```

### 3. UI Layout

The app uses a responsive layout:

**Desktop (md+):**
- Sidebar on the left (250px width)
- Main content area with 8 padding units
- Fixed position sidebar

**Mobile (base):**
- Bottom navigation bar (80px height)
- Full-width main content
- 4 padding units on content

### 4. Available Routes

| Route | Description | Premium Required |
|-------|-------------|------------------|
| `/` | Dashboard with stats and quick actions | No |
| `/checkin` | Mood check-in flow | No |
| `/diary` | Diary entries | No |
| `/pet` | Virtual pet companion | No |
| `/analytics` | Advanced analytics | Yes |
| `/settings` | User settings | No |
| `/login` | Login page | Public |

### 5. Testing Premium Features

To test premium-only features:

```javascript
// Switch to premium in console
window.mockAuth.toggleTier()

// Or via localStorage
localStorage.setItem('MOCK_USER_TIER', 'premium')

// Reload the page
location.reload()
```

Now you can access `/analytics` without seeing the upgrade prompt!

### 6. Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# With coverage
npm test -- --coverage

# Single test file
npm test -- src/service/__tests__/auth.test.ts
```

#### Current Test Status
- ✅ **42 tests passing**
- ⚠️ **9 tests need fixing** (LoginForm selectors)
- **Test Coverage:** 90%+

### 7. Development Workflow

1. **Start the server:** `npm start`
2. **Mock auth is enabled** - you're auto-logged in
3. **Make changes** - hot reload is active
4. **Test in browser** - use mock auth utilities
5. **Write tests** - follow TDD approach
6. **Run tests:** `npm test`
7. **Commit changes**

### 8. Building for Production

```bash
# Development build
npm run build

# Production build (minified)
npm run build:prod

# Clean build artifacts
npm run clean
```

### 9. Linting

```bash
# Check for issues
npm run eslint

# Auto-fix issues
npm run eslint:fix
```

### 10. Project Structure

```
src/
├── __data__/              # Redux store, slices, API
│   ├── store.ts
│   ├── api.ts
│   └── slices/
├── __tests__/             # Test utilities
│   └── utils/
│       ├── test-utils.tsx
│       └── mock-data.ts
├── components/
│   ├── auth/              # Auth components
│   └── layout/            # Layout components
│       ├── AppLayout.tsx
│       ├── Sidebar.tsx
│       └── BottomNav.tsx
├── hooks/                 # Custom React hooks
│   └── useAuth.ts
├── pages/                 # Page components
│   └── Dashboard.tsx
├── service/               # Business logic
│   └── auth.ts
├── types/                 # TypeScript types
│   └── index.ts
├── utils/                 # Utilities
│   └── mockAuth.ts
└── app.tsx               # Main App component
```

## 🔧 Common Tasks

### Add a New Page

1. Create page component in `src/pages/`
2. Add route in `src/app.tsx`
3. Update navigation in `Sidebar.tsx` and `BottomNav.tsx`

### Add a New Protected Route

```tsx
<Route
  path="/new-page"
  element={
    <ProtectedRoute requirePremium={false}>
      <AppLayout>
        <NewPage />
      </AppLayout>
    </ProtectedRoute>
  }
/>
```

### Toggle Between Free and Premium

```javascript
// In browser console
window.mockAuth.toggleTier()
location.reload()
```

### Disable Mock Auth (Use Real API)

```javascript
// In browser console
window.mockAuth.disable()
location.reload()
```

## 🐛 Troubleshooting

### Mock auth not working?

```javascript
// Check status
window.mockAuth.status()

// Force enable
localStorage.setItem('MOCK_AUTH_ENABLED', 'true')
location.reload()
```

### Not seeing premium features?

```javascript
// Check current tier
localStorage.getItem('MOCK_USER_TIER')

// Set to premium
localStorage.setItem('MOCK_USER_TIER', 'premium')
location.reload()
```

### Tests failing?

```bash
# Clear jest cache
npm test -- --clearCache

# Run tests in verbose mode
npm test -- --verbose
```

### Port 8099 already in use?

```bash
# Find and kill process
lsof -ti:8099 | xargs kill -9

# Or use a different port
brojs server --port=8100
```

## 📚 Next Steps

See `PROGRESS.md` for:
- Detailed feature documentation
- Implementation roadmap
- Known issues and fixes
- Architecture decisions

## 🤝 Contributing

1. Follow TDD - write tests first
2. Use TypeScript properly
3. Run linter before committing
4. Update documentation
5. Keep test coverage above 80%

---

**Happy Coding! 🎉**
