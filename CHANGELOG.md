# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive README.md with project overview, setup instructions, and component architecture
- Changelog system with automated tools for version management
- Mock authentication system for development mode (src/utils/mockAuth.ts)
- Responsive UI layout with desktop sidebar and mobile bottom navigation
- AppLayout component for automatic responsive switching
- Sidebar component for desktop navigation (250px fixed width)
- BottomNav component for mobile navigation (80px fixed height)
- Dashboard page with quick stats and action buttons
- Development guide (DEV_GUIDE.md) with mock auth instructions
- Comprehensive progress tracking (PROGRESS.md) with test coverage

### Changed
- Updated test utilities to use MemoryRouter instead of BrowserRouter
- Improved localStorage mocking in tests using jest.spyOn
- Enhanced useAuth hook to integrate mock authentication in development mode
- Updated routing in app.tsx to use new layout system with protected routes

### Fixed
- localStorage mock issues in auth service tests
- JSX syntax errors in test files (renamed .ts to .tsx)
- Module resolution paths in component tests
- React import missing in test files
- Redux store initialization error with API reducer mock
- Routing issues in tests by switching to MemoryRouter
- Token expiry validation in authentication tests
- ESLint errors with auto-fix (extra semicolons, code style)

### Security
- JWT token validation with proper expiry checking
- Auto-refresh tokens every 4 minutes (240s)
- Protected routes with authentication and premium tier checks

## [1.1.4] - 2025-11-22

### Added
- Initial project setup with React 18.3.1 + TypeScript
- Redux Toolkit for state management
- RTK Query for API caching
- Chakra UI component library
- Authentication system with JWT tokens
- Auth service with login, register, logout, and refresh token functionality
- useAuth custom hook for authentication state
- LoginForm and RegisterForm components
- ProtectedRoute component with tier checking
- Test infrastructure with Jest + React Testing Library
- Redux slices: auth, checkin, diary, pet, ui
- API service layer with axios client
- Type definitions for User, MoodCheckin, DiaryEntry, Pet, Subscription

### Changed
- N/A

### Fixed
- N/A

### Security
- JWT token-based authentication
- localStorage for secure token storage
- Auto-logout on 401 responses

---

## Version History

- **[1.1.4]** - 2025-11-22 - Initial implementation with auth system
- **[Unreleased]** - Current development version

---

## How to Update This Changelog

### For Developers

When making changes, add entries under the `[Unreleased]` section in the appropriate category:

- **Added** - New features or functionality
- **Changed** - Changes to existing functionality
- **Deprecated** - Features marked for removal in future versions
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Security improvements or patches

### Release Process

When cutting a new release:

1. Change `[Unreleased]` to `[X.Y.Z] - YYYY-MM-DD`
2. Add a new `[Unreleased]` section at the top
3. Update the version in `package.json`
4. Update the version history at the bottom
5. Commit: `git commit -m "Release version X.Y.Z"`
6. Tag: `git tag -a vX.Y.Z -m "Version X.Y.Z"`

### Using Changelog Scripts

```bash
# Generate changelog entry interactively
npm run changelog:generate

# View recent changes
npm run changelog:view

# Validate changelog format
npm run changelog:validate
```

---

## Semantic Versioning Guide

Given a version number `MAJOR.MINOR.PATCH` (e.g., `1.2.3`):

- **MAJOR** version (1.x.x) - Incompatible API changes
- **MINOR** version (x.2.x) - New functionality in a backwards-compatible manner
- **PATCH** version (x.x.3) - Backwards-compatible bug fixes

### Examples

- `1.0.0` → `1.0.1` - Bug fix only
- `1.0.0` → `1.1.0` - New feature added
- `1.0.0` → `2.0.0` - Breaking change (API redesign, removed feature, etc.)

---

## Links

- [Keep a Changelog](https://keepachangelog.com/)
- [Semantic Versioning](https://semver.org/)
- [Project Repository](https://github.com/essence-666/emotion-diary-js)
