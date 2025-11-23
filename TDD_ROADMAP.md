# TDD Implementation Roadmap

**Project**: Emotion Diary - Frontend Implementation
**Methodology**: Test-Driven Development (TDD)
---

## TDD Workflow

For each component, follow this process:

```
1. ✍️  WRITE TESTS - Define expected behavior
2. 🔴 RED - Run tests (they should fail)
3. 💚 GREEN - Implement minimum code to pass tests
4. ♻️  REFACTOR - Clean up code while keeping tests green
5. ✅ VERIFY - Run full test suite
```

---

## Phase 5: Pet Companion Components (PRIORITY: MEDIUM)

**Total Estimated Time**: 5 hours

### 5.1 PetAnimation Component

**File**: `src/components/pet/PetAnimation.tsx`
**Status**: ❌ NOT STARTED
**Estimated Time**: 1 hour

#### Step 1: Write Tests (15 min)

```typescript
describe('PetAnimation', () => {
  test('renders SVG pet with correct structure')
  test('applies sad animation when happiness 0-30')
  test('applies neutral animation when happiness 31-60')
  test('applies happy animation when happiness 61-100')
  test('applies color gradient based on happiness')
  test('renders different pet types (dog, cat, etc.)')
  test('applies cosmetic skin when provided')
})
```

#### Step 2: Run Tests - Should FAIL (2 min)

#### Step 3: Implement Component (40 min)

**Requirements from frontend.md**:

- SVG or canvas animation
- Props: happinessLevel (0-100), petType, cosmeticSkin
- 3 animation states (sad, neutral, happy)
- Framer Motion variants
- Color gradient by happiness

**Implementation checklist**:

- [ ] Create SVG pet structure (head, ears, eyes, mouth, body)
- [ ] Define Framer Motion variants for 3 states
- [ ] Calculate animation state from happinessLevel
- [ ] Apply color gradient (gray → vibrant)
- [ ] Add motion.svg wrapper
- [ ] Implement sad animation (droopy, slow bob)
- [ ] Implement neutral animation (blink, gentle sway)
- [ ] Implement happy animation (bounce, spin)
- [ ] Add support for different pet types
- [ ] Apply cosmetic skin colors

#### Step 4: Refactor (2 min)

#### Step 5: Verify (1 min)

**Acceptance Criteria**:

- ✅ 7/7 tests passing
- ✅ Smooth animations
- ✅ Correct state transitions

---

### 5.2 PetDisplay Component

**File**: `src/components/pet/PetDisplay.tsx`
**Status**: ❌ NOT STARTED
**Estimated Time**: 45 minutes

#### Step 1: Write Tests (15 min)

```typescript
describe('PetDisplay', () => {
  test('renders PetAnimation component')
  test('displays pet name (editable)')
  test('shows happiness hearts (5 indicators)')
  test('renders StreakBadge component')
  test('shows Feed, Pet, Talk buttons')
  test('calls interaction handlers on button click')
  test('has 300x300px square layout')
})
```

#### Step 2: Run Tests - Should FAIL

#### Step 3: Implement Component (25 min)

**Requirements from frontend.md**:

- Container showing pet
- Editable pet name
- PetAnimation component
- 5 heart indicators
- Streak badge
- Feed/Pet/Talk buttons
- 300x300px layout

**Implementation checklist**:

- [ ] Create Box container (300x300px)
- [ ] Add editable Heading for pet name
- [ ] Render PetAnimation in center
- [ ] Add happiness hearts with Icon
- [ ] Render StreakBadge component
- [ ] Add Button row (Feed, Pet, Talk)
- [ ] Connect buttons to handlers
- [ ] Style with Chakra UI

#### Step 4: Refactor (3 min)

#### Step 5: Verify (2 min)

**Acceptance Criteria**:

- ✅ 7/7 tests passing
- ✅ Layout correct
- ✅ All interactions work

---

### 5.3 PetInteraction Component

**File**: `src/components/pet/PetInteraction.tsx`
**Status**: ❌ NOT STARTED
**Estimated Time**: 45 minutes

#### Step 1: Write Tests (15 min)

```typescript
describe('PetInteraction', () => {
  test('handles feed button click')
  test('handles pet button click')
  test('handles talk button click')
  test('shows loading spinner during API call')
  test('displays dialogue in speech bubble')
  test('auto-dismisses dialogue after 3 seconds')
  test('animates speech bubble (fadeIn + slideUp)')
})
```

#### Step 2: Run Tests - Should FAIL

#### Step 3: Implement Component (25 min)

**Requirements from frontend.md**:

- Handle feed/pet/talk clicks
- POST /api/v1/pet/{action}
- Show loading spinner
- Display Gigachat dialogue
- Speech bubble above pet
- Auto-dismiss after 3s
- Animation: fadeIn + slideUp

**Implementation checklist**:

- [ ] Create component wrapping PetDisplay
- [ ] Use usePet hook
- [ ] Add loading state
- [ ] Add dialogue state
- [ ] Implement feed/pet/talk handlers
- [ ] Call API for each action
- [ ] Display dialogue in speech bubble
- [ ] Add Framer Motion for animation
- [ ] Use setTimeout for auto-dismiss
- [ ] Style speech bubble with pointer

#### Step 4: Refactor (3 min)

#### Step 5: Verify (2 min)

**Acceptance Criteria**:

- ✅ 7/7 tests passing
- ✅ Dialogue displays correctly
- ✅ Auto-dismisses

---

### 5.4 StreakBadge Component

**File**: `src/components/common/StreakBadge.tsx`
**Status**: ❌ NOT STARTED
**Estimated Time**: 30 minutes

#### Step 1: Write Tests (10 min)

```typescript
describe('StreakBadge', () => {
  test('renders circular badge with streak number')
  test('applies gold color for 7+ days')
  test('applies silver color for 3-6 days')
  test('applies bronze color for 1-2 days')
  test('displays fire emoji for hot streaks')
  test('animates with pulse on increment')
  test('has 60x60px size')
})
```

#### Step 2: Run Tests - Should FAIL

#### Step 3: Implement Component (15 min)

**Requirements from frontend.md**:

- Circular badge
- Colors: gold (7+), silver (3-6), bronze (1-2)
- Pulse animation
- 60x60px size
- Fire emoji

**Implementation checklist**:

- [ ] Create Circle component from Chakra
- [ ] Accept streak prop
- [ ] Calculate color based on streak
- [ ] Add fire emoji for streak >= 7
- [ ] Add pulse animation with Framer Motion
- [ ] Set size to 60x60px
- [ ] Position bottom-right

#### Step 4: Refactor (3 min)

#### Step 5: Verify (2 min)

**Acceptance Criteria**:

- ✅ 7/7 tests passing
- ✅ Colors correct
- ✅ Pulse animation works

---

### 5.5 PetCustomizer Component

**File**: `src/components/pet/PetCustomizer.tsx`
**Status**: ❌ NOT STARTED
**Estimated Time**: 1 hour

#### Step 1: Write Tests (20 min)

```typescript
describe('PetCustomizer', () => {
  test('renders modal with skin grid')
  test('displays 9 skins in 3x3 grid')
  test('shows locked skins with lock icon')
  test('shows unlock requirement text')
  test('allows selection of unlocked skins')
  test('shows preview of selected skin')
  test('calls save API on Save button')
  test('closes modal on Cancel')
})
```

#### Step 2: Run Tests - Should FAIL

#### Step 3: Implement Component (35 min)

**Requirements from frontend.md**:

- Modal with skins
- 3x3 grid
- Locked skins (grayscale + lock icon)
- Unlocked skins (colored, clickable)
- Preview
- Save/Cancel buttons

**Implementation checklist**:

- [ ] Create Modal component
- [ ] Add Grid (3x3) for skins
- [ ] Map skins data
- [ ] Check if skin is unlocked (by streak)
- [ ] Render locked skins (grayscale, LockIcon)
- [ ] Render unlocked skins (colored)
- [ ] Add selection state
- [ ] Show preview with mini PetAnimation
- [ ] Add Save button (POST /api/v1/pet/customize)
- [ ] Add Cancel button
- [ ] Close modal after save

#### Step 4: Refactor (3 min)

#### Step 5: Verify (2 min)

**Acceptance Criteria**:

- ✅ 8/8 tests passing
- ✅ Skin selection works
- ✅ Preview updates

---

### 5.6 usePet Hook

**File**: `src/hooks/usePet.ts`
**Status**: ❌ NOT STARTED
**Estimated Time**: 45 minutes

#### Step 1: Write Tests (15 min)

```typescript
describe('usePet', () => {
  test('returns pet, happinessLevel, feed, pet, talk')
  test('feed() calls POST /api/v1/pet/feed')
  test('pet() calls POST /api/v1/pet/pet')
  test('talk() calls POST /api/v1/pet/talk')
  test('updates petStore on success')
  test('shows dialogue from API response')
  test('handles errors gracefully')
})
```

#### Step 2: Run Tests - Should FAIL

#### Step 3: Implement Hook (25 min)

**Requirements from frontend.md**:

- Return pet, happinessLevel, feed(), pet(), talk()
- POST to API
- Update store
- Show dialogue

**Implementation checklist**:

- [ ] Create hook with RTK Query mutations
- [ ] Get pet from petStore
- [ ] Define feed mutation
- [ ] Define pet mutation
- [ ] Define talk mutation
- [ ] Update petStore on success
- [ ] Set dialogue from API response
- [ ] Handle errors
- [ ] Return all functions and state

#### Step 4: Refactor (3 min)

#### Step 5: Verify (2 min)

**Acceptance Criteria**:

- ✅ 7/7 tests passing
- ✅ All mutations work

---

## Phase 6: Diary Components (PRIORITY: HIGH)

**Total Estimated Time**: 6 hours

### 6.1 DiaryEntry Component

**File**: `src/components/diary/DiaryEntry.tsx`
**Status**: ✅ COMPLETE
**Estimated Time**: 45 minutes
**Actual Time**: 45 minutes
**Tests**: 10/10 passing

#### Completed Steps:

**✅ Step 1: Write Tests (15 min)**

- Created comprehensive test suite with 10 tests
- Tests cover: card rendering, date/day display, title/auto-title, mood heat map, content preview, tags, reading time, hover effects, onClick handler, mount animation

**✅ Step 2: Run Tests - FAILED as expected (2 min)**

```bash
npm test DiaryEntry
# Result: 0/10 passing (component doesn't exist yet) ✓
```

**✅ Step 3: Implement Component (25 min)**

- Created DiaryEntry component with:
  - Chakra Card component with proper styling
  - Date formatting utility (formatDate) showing date and day of week
  - Auto-title generation from first 50 chars if no title
  - Mood heat map with 5 circles (default colors if no mood data)
  - Content preview truncated to 200 characters
  - Tags displayed as Badge pills with custom colors
  - Reading time calculation (200 words per minute)
  - Framer Motion animations (fade in + slide up on mount)
  - Hover effects (scale 1.02 + shadow)
  - onClick handler with keyboard support (Enter/Space)
  - Dark mode support with useColorModeValue

**✅ Step 4: Refactor (3 min)**

- Extracted utility functions: formatDate, calculateReadingTime, truncateContent, getAutoTitle
- Added proper TypeScript types
- Optimized hover animations
- Improved accessibility (role, tabIndex, keyboard support)

**✅ Step 5: Verify (2 min)**

```bash
npm test DiaryEntry
# Result: 10/10 passing ✓
npm test
# Result: 129/129 total passing ✓
```

**Acceptance Criteria**:

- ✅ 10/10 tests passing
- ✅ Hover animation smooth
- ✅ Data displays correctly
- ✅ Date formatting works
- ✅ Reading time calculated correctly
- ✅ Tags display with custom colors
- ✅ Mood heat map renders
- ✅ Keyboard accessible

---

### 6.2 TagManager Component

**File**: `src/components/diary/TagManager.tsx`
**Status**: ✅ COMPLETE
**Estimated Time**: 1 hour
**Actual Time**: 1 hour
**Tests**: 8/8 passing

#### Completed Steps:

**✅ Step 1: Write Tests (20 min)**

- Created comprehensive test suite with 8 tests
- Tests cover: dropdown rendering, popular tags display, checkboxes, color indicators, custom tag input, onApply callback, clear functionality, filtering

**✅ Step 2: Run Tests - FAILED as expected (2 min)**

```bash
npm test TagManager
# Result: 0/8 passing (component doesn't exist yet) ✓
```

**✅ Step 3: Implement Component (35 min)**

- Created TagManager component with:
  - Chakra Menu component for dropdown
  - MenuButton with "Filter by Tags" label (shows count when selected)
  - MenuList with scrollable content
  - Popular tags section displayed first
  - Checkboxes for each tag with color Badge indicators
  - Custom tags section (shown when custom tags exist)
  - Custom tag input with Add button (Enter key support)
  - Apply and Clear buttons
  - State management for selected tags and custom tags
  - onApply callback with selected tag IDs
  - Dark mode support with useColorModeValue

**✅ Step 4: Refactor (3 min)**

- Extracted tag toggle logic
- Added proper TypeScript types
- Optimized state updates
- Improved accessibility (aria-labels, keyboard support)

**✅ Step 5: Verify (2 min)**

```bash
npm test TagManager
# Result: 8/8 passing ✓
npm test
# Result: 137/137 total passing ✓
```

**Acceptance Criteria**:

- ✅ 8/8 tests passing
- ✅ Tag selection works
- ✅ Custom tags can be added
- ✅ Apply/Clear buttons work correctly
- ✅ Color indicators display properly
- ✅ Dark mode support

---

### 6.3 DiaryTimeline Component (Main)

**File**: `src/components/diary/DiaryTimeline.tsx`
**Status**: ✅ COMPLETE
**Estimated Time**: 1.5 hours
**Actual Time**: 1.5 hours
**Tests**: 10/10 passing

#### Completed Steps:

**✅ Step 1: Write Tests (30 min)**

- Created comprehensive test suite with 10 tests
- Tests cover: timeline layout, TagManager display, API fetching, entry rendering, infinite scroll, loading states, empty state, animations, click handling, tag filtering

**✅ Step 2: Run Tests - FAILED as expected (2 min)**

```bash
npm test DiaryTimeline
# Result: 0/10 passing (component doesn't exist yet) ✓
```

**✅ Step 3: Implement Component (55 min)**

- Created DiaryTimeline component with:
  - VStack layout for vertical timeline
  - TagManager at top with filter functionality
  - RTK Query integration using `useGetDiaryEntriesQuery`
  - Entry mapping to DiaryEntry components
  - IntersectionObserver for infinite scroll
  - Loading spinner during fetch
  - Empty state with helpful message
  - AnimatePresence wrapper with stagger animations
  - Entry click handler (onEntryClick callback)
  - Tag filter application with state management
  - Pagination support with offset/limit
  - Dark mode support with useColorModeValue

**✅ Step 4: Refactor (3 min)**

- Added IntersectionObserver check for test environment compatibility
- Optimized state updates to prevent unnecessary re-renders
- Added duplicate entry prevention in pagination
- Improved filter change detection with refs

**✅ Step 5: Verify (2 min)**

```bash
npm test DiaryTimeline
# Result: 10/10 passing ✓
npm test
# Result: 147/147 total passing ✓
```

**Acceptance Criteria**:

- ✅ 10/10 tests passing
- ✅ Vertical timeline layout works
- ✅ TagManager filter integration works
- ✅ Infinite scroll with IntersectionObserver
- ✅ Loading and empty states display correctly
- ✅ Stagger animations applied
- ✅ Entry click handling works
- ✅ Tag filtering applies correctly
- ✅ Infinite scroll works
- ✅ Stagger animation smooth

---

### 6.4 EntryEditor Component

**File**: `src/components/diary/EntryEditor.tsx`
**Status**: ✅ COMPLETE
**Estimated Time**: 1 hour
**Actual Time**: 1 hour
**Tests**: 9/9 passing

#### Completed Steps:

**✅ Step 1: Write Tests (20 min)**

- Created comprehensive test suite with 9 tests
- Tests cover: modal rendering, form fields, tag selector, create/update API calls, auto-save indicator, cancel functionality, validation

**✅ Step 2: Run Tests - FAILED as expected (2 min)**

```bash
npm test EntryEditor
# Result: 0/9 passing (component doesn't exist yet) ✓
```

**✅ Step 3: Implement Component (35 min)**

- Created EntryEditor component with:
  - Chakra Modal component for form dialog
  - FormControl with Input for title (optional)
  - Textarea for content (required, auto-resize with minH)
  - TagManager integration for tag selection
  - State management for title, content, and selected tags
  - Auto-save with 2-second debounce delay
  - Save status indicator ("Saving...", "Saved ✓", "Error saving")
  - RTK Query mutations (useCreateDiaryEntryMutation, useUpdateDiaryEntryMutation)
  - Form validation (content required)
  - Cancel button with form reset
  - onSave callback for parent component integration
  - Edit mode support (pre-fills form when entry prop provided)
  - Dark mode support with useColorModeValue

**✅ Step 4: Refactor (3 min)**

- Extracted save status text logic into helper function
- Optimized auto-save debounce cleanup
- Improved form reset on cancel
- Added proper TypeScript types

**✅ Step 5: Verify (2 min)**

```bash
npm test EntryEditor
# Result: 9/9 passing ✓
npm test
# Result: 156/156 total passing ✓
```

**Acceptance Criteria**:

- ✅ 9/9 tests passing
- ✅ Auto-save works with debounce
- ✅ Create and update work correctly
- ✅ Form validation prevents empty submissions
- ✅ Modal closes on cancel
- ✅ Tag selection integrated

---

### 6.5 MonthlyHeatmap Component

**File**: `src/components/diary/MonthlyHeatmap.tsx`
**Status**: ✅ COMPLETE
**Estimated Time**: 1.5 hours
**Actual Time**: 1.5 hours
**Tests**: 9/9 passing

#### Completed Steps:

**✅ Step 1: Write Tests (30 min)**

- Created comprehensive test suite with 9 tests
- Tests cover: calendar grid layout, day numbers, color scaling, tooltips, click handlers, navigation, header display, current day highlighting

**✅ Step 2: Run Tests - FAILED as expected (2 min)**

```bash
npm test MonthlyHeatmap
# Result: 0/9 passing (component doesn't exist yet) ✓
```

**✅ Step 3: Implement Component (55 min)**

- Created MonthlyHeatmap component with:
  - Chakra Grid component (7 columns for days of week)
  - Calendar calculation with useMemo for days in month
  - RTK Query integration using `useGetMonthlyHeatmapQuery`
  - Day-to-cell mapping with empty cells for month start
  - Emotion density calculation (emotion_count based)
  - RGB color gradient (white → deep red) based on intensity
  - Chakra Tooltip with emotion breakdown on hover
  - Cell click handler (onDateClick callback)
  - Prev/next month navigation with IconButtons
  - Month and year header display
  - Current day highlighting with border
  - Dark mode support with useColorModeValue
  - Loading state display

**✅ Step 4: Refactor (3 min)**

- Extracted color intensity calculation into helper function
- Optimized calendar days calculation with useMemo
- Improved date formatting consistency
- Added proper TypeScript types

**✅ Step 5: Verify (2 min)**

```bash
npm test MonthlyHeatmap
# Result: 9/9 passing ✓
npm test
# Result: 165/165 total passing ✓
```

**Acceptance Criteria**:

- ✅ 9/9 tests passing
- ✅ Heatmap renders correctly with 7x5 grid
- ✅ Navigation works (prev/next month)
- ✅ Tooltips show emotion breakdown data
- ✅ Color scale applies correctly (white → deep red)
- ✅ Current day is highlighted
- ✅ Cell clicks trigger onDateClick callback

---

### 6.6 DiaryPage Component

**File**: `src/pages/DiaryPage.tsx`
**Status**: ❌ NOT STARTED
**Estimated Time**: 45 minutes

#### Step 1: Write Tests (15 min)

```typescript
describe('DiaryPage', () => {
  test('renders full page layout')
  test('displays MonthlyHeatmap in left sidebar')
  test('displays DiaryTimeline in main area')
  test('shows stats in right sidebar (desktop)')
  test('uses stacked layout on mobile')
  test('has tabs to switch heatmap/timeline (mobile)')
})
```

#### Step 2: Run Tests - Should FAIL

#### Step 3: Implement Component (25 min)

**Requirements from frontend.md**:

- Full page layout
- Grid: left (Heatmap) | main (Timeline) | right (Stats)
- Mobile: stacked, tabs
- FlexBox or CSS Grid

**Implementation checklist**:

- [ ] Create Grid layout (3 columns desktop)
- [ ] Add MonthlyHeatmap in GridItem
- [ ] Add DiaryTimeline in GridItem
- [ ] Add Stats in GridItem (desktop only)
- [ ] Use responsive breakpoints
- [ ] Add Tabs for mobile
- [ ] Switch between Heatmap and Timeline
- [ ] Wrap in AppLayout

#### Step 4: Refactor (3 min)

#### Step 5: Verify (2 min)

**Acceptance Criteria**:

- ✅ 6/6 tests passing
- ✅ Layout responsive
- ✅ Tabs work on mobile

---

### 6.7 useDiary Hook

**File**: `src/hooks/useDiary.ts`
**Status**: ❌ NOT STARTED
**Estimated Time**: 45 minutes

#### Step 1: Write Tests (15 min)

```typescript
describe('useDiary', () => {
  test('useDiaryEntries returns entries, loading, hasMore, loadMore')
  test('useCreateEntry submits new entry')
  test('useUpdateEntry updates existing entry')
  test('useDeleteEntry deletes entry')
  test('useDiaryStats returns heatmap data')
  test('updates diaryStore on success')
  test('handles pagination correctly')
})
```

#### Step 2: Run Tests - Should FAIL

#### Step 3: Implement Hook (25 min)

**Requirements from frontend.md**:

- useDiaryEntries(filters, pagination)
- useCreateEntry(formData)
- useUpdateEntry(entryId, formData)
- useDeleteEntry(entryId)
- useDiaryStats(month)

**Implementation checklist**:

- [ ] Create useDiaryEntries with RTK Query
- [ ] Implement pagination (offset/limit)
- [ ] Add filters support
- [ ] Create useCreateEntry mutation
- [ ] Create useUpdateEntry mutation
- [ ] Create useDeleteEntry mutation
- [ ] Create useDiaryStats query
- [ ] Update diaryStore on mutations
- [ ] Return all functions and state

#### Step 4: Refactor (3 min)

#### Step 5: Verify (2 min)

**Acceptance Criteria**:

- ✅ 7/7 tests passing
- ✅ All CRUD operations work
- ✅ Pagination works

---

## Phase 7: AI Insights & Premium (PRIORITY: LOW-MEDIUM)

**Total Estimated Time**: 6 hours

### 7.1 WeeklyInsight Component

**File**: `src/components/insights/WeeklyInsight.tsx`
**Status**: ❌ NOT STARTED
**Estimated Time**: 1 hour

#### Step 1: Write Tests (20 min)

```typescript
describe('WeeklyInsight', () => {
  test('renders card with AI summary')
  test('displays "This Week" header with date range')
  test('shows summary text (200-300 chars)')
  test('renders key findings list (3-5 items)')
  test('displays recommendations section')
  test('shows skeleton loader while loading')
  test('has refresh button to regenerate')
  test('has helpful/not helpful buttons')
  test('animates on load (fade + slide up)')
})
```

#### Step 2: Run Tests - Should FAIL

#### Step 3: Implement Component (35 min)

**Requirements from frontend.md**:

- Card with AI summary
- Date range header
- Summary text
- Key findings (bullet list)
- Recommendations
- Loading skeleton
- Refresh button
- Feedback buttons
- Animation

**Implementation checklist**:

- [ ] Create Card component
- [ ] Use useInsights hook
- [ ] Display date range
- [ ] Show summary text
- [ ] Render findings as List
- [ ] Show recommendations
- [ ] Add Skeleton loader
- [ ] Add Refresh IconButton
- [ ] Add feedback buttons
- [ ] Wrap in motion.div
- [ ] Add fade + slideUp animation

#### Step 4: Refactor (3 min)

#### Step 5: Verify (2 min)

**Acceptance Criteria**:

- ✅ 9/9 tests passing
- ✅ Skeleton works
- ✅ Refresh works

---

### 7.2-7.10 [ABBREVIATED - Similar TDD Pattern]

For brevity, I'll list the remaining components with estimated times:

**7.2 MoodTriggers.tsx** (45 min)

- Table with triggers, frequency, recommendations
- Sortable columns
- Empty state

**7.3 RecommendationCard.tsx** (30 min)

- Card with emoji icon
- Recommendation text
- CTA button

**7.4 InsightsPage.tsx** (1 hour)

- Grid layout
- Premium gate overlay
- Gigachat attribution

**7.5 PremiumUpgradeCard.tsx** (45 min)

- Featured card
- Benefits list
- Upgrade button

**7.6 SubscriptionManager.tsx** (1.5 hours)

- Pricing options
- Stripe integration
- Manage/cancel flows

**7.7 ExportModal.tsx** (1 hour)

- Format selection (PDF/JSON/CSV)
- Date range picker
- Progress bar

**7.8 useInsights.ts** (30 min)

- Fetch insights
- Refresh logic

**7.9 insights.service.ts** (15 min)

- API calls

**7.10 subscription.service.ts** (30 min)

- Subscription API
- Stripe integration

---

## Summary: Total Remaining Work

| Phase                  | Components    | Tests         | Implementation | Refactor      | Total Time     |
| ---------------------- | ------------- | ------------- | -------------- | ------------- | -------------- |
| **Phase 0 (Theme)**    | 4 components  | 30 min        | 1.5 hours      | 30 min        | **2.5 hours**  |
| **Phase 3 (Auth)**     | 3 tasks       | 30 min        | 1.5 hours      | 15 min        | **2 hours**    |
| **Phase 4 (Check-in)** | 6 components  | 1.5 hours     | 2 hours        | 30 min        | **4 hours**    |
| **Phase 5 (Pet)**      | 6 components  | 2 hours       | 2.5 hours      | 30 min        | **5 hours**    |
| **Phase 6 (Diary)**    | 7 components  | 2.5 hours     | 3 hours        | 30 min        | **6 hours**    |
| **Phase 7 (Insights)** | 10 components | 2.5 hours     | 3 hours        | 30 min        | **6 hours**    |
| **Total**              | **36 tasks**  | **9.5 hours** | **13.5 hours** | **2.5 hours** | **25.5 hours** |

---

## Quick Reference: TDD Commands

```bash
# Run specific test file
npm test -- ComponentName.test.tsx

# Run tests in watch mode
npm test:watch

# Run all tests
npm test

# Run tests with coverage
npm test:coverage

# Run specific test suite
npm test -- --testNamePattern="ComponentName"
```

---

## Notes for Developers

1. **Always write tests first** - This catches bugs early and defines behavior
2. **Keep tests focused** - One test = one behavior
3. **Use descriptive test names** - "test('displays error when email invalid')"
4. **Mock external dependencies** - API calls, timers, etc.
5. **Don't skip refactor step** - Clean code is maintainable code
6. **Run full suite regularly** - Ensure no regressions
7. **Update PROGRESS.md** - Track completed components

---

**Generated**: 2025-11-22
**Methodology**: Test-Driven Development (TDD)
**Last Updated**: Auto-generated from VALIDATION_REPORT.md
