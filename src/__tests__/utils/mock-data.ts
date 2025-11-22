import { User, MoodCheckin, Pet, DiaryEntry } from '../../types'

export const mockUser: User = {
  id: 1,
  email: 'test@example.com',
  username: 'testuser',
  subscription_tier: 'free',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
}

export const mockPremiumUser: User = {
  ...mockUser,
  id: 2,
  subscription_tier: 'premium',
}

export const mockCheckin: MoodCheckin = {
  id: 1,
  user_id: 1,
  emotion_id: 1,
  intensity: 7,
  reflection_text: 'Had a great day!',
  created_at: '2025-01-15T10:00:00Z',
  updated_at: '2025-01-15T10:00:00Z',
  emotion: {
    id: 1,
    name: 'happy',
    emoji: '😊',
    color: '#fbbf24',
    description: 'Feeling joyful and content',
  },
}

export const mockPet: Pet = {
  id: 1,
  user_id: 1,
  name: 'Buddy',
  pet_type: 'cat',
  happiness_level: 75,
  last_interaction: '2025-01-15T10:00:00Z',
  cosmetic_skin: 'default',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-15T10:00:00Z',
}

export const mockDiaryEntry: DiaryEntry = {
  id: 1,
  user_id: 1,
  title: 'My First Entry',
  content: 'Today was a wonderful day. I felt really happy and accomplished.',
  created_at: '2025-01-15T10:00:00Z',
  updated_at: '2025-01-15T10:00:00Z',
  tags: [
    { id: 1, name: 'productivity', color: '#3b82f6' },
    { id: 2, name: 'happiness', color: '#fbbf24' },
  ],
}

export const mockAuthResponse = {
  ok: true,
  token: 'mock-jwt-token',
  refreshToken: 'mock-refresh-token',
  user: mockUser,
}

export const mockCheckinResponse = {
  ok: true,
  checkin: mockCheckin,
  streak_updated: true,
  new_streak: 5,
}

export const mockPetResponse = {
  ok: true,
  happiness_level: 80,
  happiness_change: 5,
}

export const mockPetTalkResponse = {
  ok: true,
  happiness_level: 78,
  dialogue: 'Purr~ I love spending time with you!',
}

// Helper to create mock localStorage
export const createMockLocalStorage = () => {
  let store: Record<string, string> = {}

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString()
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    }),
  }
}

// Helper to wait for async operations
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
