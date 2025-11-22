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
