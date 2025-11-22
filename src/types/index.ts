// ============================================================================
// EMOTION DIARY - TypeScript Type Definitions
// ============================================================================

// ----------------------------------------------------------------------------
// Subscription & User Types
// ----------------------------------------------------------------------------

export type SubscriptionTier = 'free' | 'premium';

export interface User {
  id: number;
  email: string;
  username: string;
  subscription_tier: SubscriptionTier;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: number;
  user_id: number;
  tier: 'premium' | 'premium_annual';
  status: 'active' | 'canceled' | 'past_due';
  stripe_subscription_id: string;
  stripe_customer_id: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: number;
  user_id: number;
  theme: 'light' | 'dark' | 'auto';
  notifications_enabled: boolean;
  notification_time?: string;
  created_at: string;
  updated_at: string;
}

// ----------------------------------------------------------------------------
// Emotion & Mood Check-in Types
// ----------------------------------------------------------------------------

export interface Emotion {
  id: number;
  name: 'happy' | 'sad' | 'angry' | 'calm' | 'stressed' | 'excited';
  emoji: string;
  color: string;
  description: string;
}

export interface MoodCheckin {
  id: number;
  user_id: number;
  emotion_id: number;
  intensity: number; // 1-10
  reflection_text?: string;
  created_at: string;
  updated_at: string;
  // Populated when joined with emotions table
  emotion?: Emotion;
}

export interface CheckinStats {
  emotion_distribution: Record<string, number>;
  avg_intensity: number;
  total_checkins: number;
  streak_count: number;
}

// ----------------------------------------------------------------------------
// Diary Types
// ----------------------------------------------------------------------------

export interface DiaryEntry {
  id: number;
  user_id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  // Populated when joined
  tags?: DiaryTag[];
}

export interface DiaryTag {
  id: number;
  name: string;
  color: string;
}

export interface DiaryEntryTag {
  entry_id: number;
  tag_id: number;
}

export interface MonthlyHeatmapData {
  date: string; // YYYY-MM-DD format
  emotion_count: number;
  emotions: string[]; // Array of emotion names
}

// ----------------------------------------------------------------------------
// Pet Types
// ----------------------------------------------------------------------------

export interface Pet {
  id: number;
  user_id: number;
  name: string;
  pet_type: string;
  happiness_level: number; // 0-100
  last_interaction: string;
  cosmetic_skin?: string;
  created_at: string;
  updated_at: string;
}

export interface PetInteraction {
  id: number;
  pet_id: number;
  interaction_type: 'feed' | 'pet' | 'talk';
  happiness_change: number;
  created_at: string;
}

export type PetAnimationState = 'sad' | 'neutral' | 'happy';

// ----------------------------------------------------------------------------
// Streak Types
// ----------------------------------------------------------------------------

export interface UserStreak {
  id: number;
  user_id: number;
  current_streak: number;
  longest_streak: number;
  last_checkin_date: string;
  created_at: string;
  updated_at: string;
}

// ----------------------------------------------------------------------------
// Reflection Prompts Types
// ----------------------------------------------------------------------------

export interface ReflectionPrompt {
  id: number;
  prompt_text: string;
  category: string;
  is_premium: boolean;
  created_at: string;
}

export interface ReflectionResponse {
  id: number;
  user_id: number;
  prompt_id: number;
  response_text: string;
  created_at: string;
  // Populated when joined
  prompt?: ReflectionPrompt;
}

// ----------------------------------------------------------------------------
// AI Insights Types (Premium)
// ----------------------------------------------------------------------------

export interface EmotionalInsight {
  id: number;
  user_id: number;
  insight_type: 'weekly' | 'monthly' | 'trigger' | 'recommendation';
  content: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface WeeklyInsight {
  statistics: CheckinStats;
  ai_summary: string;
  key_findings: string[];
  recommendations: string[];
  date_range: {
    start: string;
    end: string;
  };
}

export interface MoodTrigger {
  trigger: string;
  emotion: string;
  frequency: number;
  recommendation: string;
}

// ----------------------------------------------------------------------------
// API Request/Response Types
// ----------------------------------------------------------------------------

// Auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  ok: boolean;
  token: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenResponse {
  ok: boolean;
  token: string;
}

// Check-in
export interface CreateCheckinRequest {
  emotion_id: number;
  intensity: number;
  reflection_text?: string;
}

export interface CreateCheckinResponse {
  ok: boolean;
  checkin: MoodCheckin;
  streak_updated: boolean;
  new_streak: number;
}

// Diary
export interface CreateDiaryEntryRequest {
  title: string;
  content: string;
  tag_ids?: number[];
}

export interface UpdateDiaryEntryRequest {
  title?: string;
  content?: string;
  tag_ids?: number[];
}

export interface GetDiaryEntriesRequest {
  limit?: number;
  offset?: number;
  tags?: string;
}

// Pet
export interface FeedPetResponse {
  ok: boolean;
  happiness_level: number;
  happiness_change: number;
}

export interface PetTalkResponse {
  ok: boolean;
  happiness_level: number;
  dialogue: string;
}

export interface CustomizePetRequest {
  cosmetic_skin: string;
}

// Subscription
export interface CreateSubscriptionRequest {
  tier: 'premium' | 'premium_annual';
  payment_method_id: string;
}

export interface SubscriptionStatusResponse {
  ok: boolean;
  subscription: Subscription | null;
  isPremium: boolean;
}

// ----------------------------------------------------------------------------
// UI State Types
// ----------------------------------------------------------------------------

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  dismissible?: boolean;
}

export interface Modal {
  id: string;
  isOpen: boolean;
  props?: Record<string, any>;
}

export interface UIState {
  notifications: Notification[];
  modals: Record<string, Modal>;
  globalLoading: boolean;
}

// ----------------------------------------------------------------------------
// Redux Store State Types
// ----------------------------------------------------------------------------

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface CheckinState {
  checkins: MoodCheckin[];
  todayCheckin: MoodCheckin | null;
  currentStreak: number;
  loading: boolean;
  error: string | null;
}

export interface DiaryState {
  entries: DiaryEntry[];
  selectedEntry: DiaryEntry | null;
  filters: {
    tags: number[];
    dateRange?: { start: string; end: string };
  };
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  loading: boolean;
  error: string | null;
}

export interface PetState {
  pet: Pet | null;
  happinessLevel: number;
  dialogue: string;
  dialogueVisible: boolean;
  loading: boolean;
  error: string | null;
}

export interface RootState {
  auth: AuthState;
  checkin: CheckinState;
  diary: DiaryState;
  pet: PetState;
  ui: UIState;
}

// ----------------------------------------------------------------------------
// Component Props Types
// ----------------------------------------------------------------------------

export interface EmotionSelectorProps {
  selectedEmotion: number | null;
  onSelect: (emotionId: number) => void;
  emotions: Emotion[];
}

export interface IntensitySliderProps {
  value: number;
  onChange: (value: number) => void;
}

export interface ReflectionInputProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

export interface PetAnimationProps {
  happinessLevel: number;
  petType: string;
  cosmeticSkin?: string;
}

export interface StreakBadgeProps {
  streak: number;
}

// ----------------------------------------------------------------------------
// Utility Types
// ----------------------------------------------------------------------------

export type ApiResponse<T = any> = {
  ok: boolean;
  data?: T;
  error?: string;
};

export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

export type PaginationParams = {
  limit: number;
  offset: number;
};

export type DateRange = {
  start: string;
  end: string;
};
