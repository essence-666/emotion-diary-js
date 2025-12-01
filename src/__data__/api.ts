import { BaseQueryArg, createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { analyticsService } from '../service/analytics'
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RefreshTokenResponse,
  CreateCheckinRequest,
  CreateCheckinResponse,
  MoodCheckin,
  CheckinStats,
  Pet,
  FeedPetResponse,
  PetTalkResponse,
  CustomizePetRequest,
  DiaryEntry,
  CreateDiaryEntryRequest,
  UpdateDiaryEntryRequest,
  GetDiaryEntriesRequest,
  MonthlyHeatmapData,
  UserPreferences,
  UpdateProfileRequest,
  ChangePasswordRequest,
  DeleteAccountRequest,
  ExportDataResponse,
  User, SubscriptionTier,
} from '../types'
import { getConfigValue } from '@brojs/cli'

interface GenerateImageResponse {
  uuid: string
}

interface GenerateImageRequest {
  imagePrompt: string
  imagesStyle: string
}

// Helper to get token from localStorage
const getToken = () => localStorage.getItem('auth_token')

// Development mode check - TEMPORARILY FORCED TO TRUE
// The backend API endpoints for diary aren't implemented yet, so we use mocks
// TODO: Change to `process.env.NODE_ENV !== 'production'` when backend is ready
const isDevelopment = process.env.NODE_ENV

// Debug logging (remove in production)
if (typeof window !== 'undefined') {
  console.log('[API] Mock mode enabled:', isDevelopment)
}

// Mock data generators
const generateMockDiaryEntries = (count: number = 5): DiaryEntry[] => {
  const emotions = ['happy', 'sad', 'calm', 'stressed', 'excited', 'angry']
  // Lighter, calmer colors for tags that work well in both light and dark modes
  const tags = [
    { id: 1, name: 'work', color: '#8B5CF6' }, // purple.500
    { id: 2, name: 'family', color: '#10B981' }, // green.500
    { id: 3, name: 'health', color: '#F59E0B' }, // amber.500
    { id: 4, name: 'personal', color: '#EC4899' }, // pink.500
    { id: 5, name: 'hobby', color: '#06B6D4' }, // cyan.500
  ]
  const sampleContents = [
    'Had a productive day at work. Managed to complete the project ahead of schedule and received positive feedback from the team.',
    'Spent quality time with family today. We went to the park and had a picnic. The weather was perfect.',
    'Feeling stressed about upcoming deadlines. Need to focus on time management and prioritization.',
    'Great workout session this morning! Feeling energized and ready to tackle the day.',
    'Had a long conversation with an old friend. It was nice to catch up and reminisce about old times.',
  ]

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    user_id: 1,
    title: i % 2 === 0 ? `Entry ${i + 1}` : null,
    content: sampleContents[i % sampleContents.length],
    date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
    tags: [tags[i % tags.length]],
    mood_snapshot: emotions.slice(0, Math.floor(Math.random() * 3) + 1),
    created_at: new Date(Date.now() - i * 86400000).toISOString(),
    updated_at: new Date(Date.now() - i * 86400000).toISOString(),
  }))
}

const generateMockHeatmapData = (
  year: number,
  month: number,
): MonthlyHeatmapData[] => {
  const daysInMonth = new Date(year, month, 0).getDate()
  const emotions = ['happy', 'sad', 'calm', 'stressed', 'excited', 'angry']

  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    const date = `${year}-${String(month).padStart(2, '0')}-${String(
      day,
    ).padStart(2, '0')}`
    const emotionCount = Math.floor(Math.random() * 8) // 0-7 emotions per day

    return {
      date,
      emotion_count: emotionCount,
      emotions:
        emotionCount > 0
          ? emotions.slice(0, Math.min(emotionCount, emotions.length))
          : [],
    }
  })
}

const generateMockCheckins = (count: number = 10): MoodCheckin[] => {
  const reflectionTexts = [
    'Had a great morning walk. Feeling energized and positive.',
    'Work was challenging today, but I managed to stay focused.',
    'Feeling a bit overwhelmed with tasks. Need to take breaks.',
    'Spent quality time with loved ones. Feeling grateful.',
    'Accomplished my goals for the day. Proud of myself!',
    'Had some setbacks, but staying optimistic.',
    'Really enjoying this new hobby. It brings me peace.',
    'Feeling anxious about upcoming events.',
  ]

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    user_id: 1,
    emotion_id: (i % 6) + 1, // Rotate through emotions 1-6
    intensity: Math.floor(Math.random() * 10) + 1, // 1-10
    reflection_text:
      i % 3 === 0 ? reflectionTexts[i % reflectionTexts.length] : undefined,
    created_at: new Date(Date.now() - i * 3600000 * 4).toISOString(), // Every 4 hours
    updated_at: new Date(Date.now() - i * 3600000 * 4).toISOString(),
  }))
}

// Mock pet state (persisted in memory for the session)
let mockPetState: Pet = {
  id: 1,
  user_id: 1,
  name: 'Buddy',
  pet_type: 'cat',
  happiness_level: 75,
  last_interaction: new Date().toISOString(),
  cosmetic_skin: 'default',
  created_at: new Date(Date.now() - 30 * 86400000).toISOString(), // 30 days ago
  updated_at: new Date().toISOString(),
}

const generateMockPet = (): Pet => {
  return { ...mockPetState }
}

const updateMockPetHappiness = (change: number): Pet => {
  mockPetState = {
    ...mockPetState,
    happiness_level: Math.max(
      0,
      Math.min(100, mockPetState.happiness_level + change),
    ),
    last_interaction: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  return { ...mockPetState }
}

const generateMockDialogue = (happiness: number): string => {
  if (happiness >= 80) {
    return [
      'I love you so much! You make me the happiest pet! 🥰',
      'This is amazing! I feel so loved and cared for! ✨',
      "You're the best! Thank you for taking such good care of me! 💖",
      "I'm so happy! Let's play together more often! 🎉",
    ][Math.floor(Math.random() * 4)]
  } else if (happiness >= 50) {
    return [
      'Thanks for spending time with me! 😊',
      'I appreciate you! This means a lot to me.',
      'Feeling good! You always know how to cheer me up!',
      'I enjoy our time together! 💚',
    ][Math.floor(Math.random() * 4)]
  } else if (happiness >= 20) {
    return [
      'I could use some attention... 😔',
      "It's been a while since we spent time together.",
      'Are you still there? I miss you...',
      'I need some care and love.',
    ][Math.floor(Math.random() * 4)]
  } else {
    return [
      "Please don't forget about me... 😢",
      'I really need you right now...',
      'I feel so lonely... Please come back.',
      'I miss you so much... Where have you been?',
    ][Math.floor(Math.random() * 4)]
  }
}

const generateMockCheckinStats = (): CheckinStats => {
  return {
    emotion_distribution: {
      happy: 25,
      sad: 10,
      angry: 5,
      calm: 30,
      stressed: 20,
      excited: 10,
    },
    avg_intensity: 6.5,
    total_checkins: 42,
    streak_count: 7,
  }
}

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: String(getConfigValue('emotion-diary.api') || '/api'),
    prepareHeaders: (headers) => {
      const token = getToken()
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['Auth', 'Checkin', 'Pet', 'Diary', 'Preferences'],
  endpoints: (builder) => ({
    // ========================================================================
    // Auth Endpoints
    // ========================================================================
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (credentials) => ({
        url: '/auth/register',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),
    logout: builder.mutation<{ ok: boolean }, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth', 'Checkin', 'Pet', 'Diary'],
    }),
    refreshToken: builder.mutation<RefreshTokenResponse, void>({
      query: () => ({
        url: '/auth/refresh',
        method: 'POST',
      }),
    }),

    // ========================================================================
    // Check-in Endpoints
    // ========================================================================
    createCheckin: builder.mutation<
      CreateCheckinResponse,
      CreateCheckinRequest
    >({
      query: (checkin) => ({
        url: '/checkins',
        method: 'POST',
        body: checkin,
      }),
      invalidatesTags: ['Checkin', 'Pet'],
    }),
    getCheckins: builder.query<
      MoodCheckin[],
      { limit?: number; offset?: number }
    >({
      queryFn: async (
        { limit = 10, offset = 0 },
        { getState },
        extraOptions,
        baseQuery,
      ) => {
        // Development mock
        if (isDevelopment) {
          await new Promise((resolve) => setTimeout(resolve, 500))
          const allCheckins = generateMockCheckins(20)
          const paginatedCheckins = allCheckins.slice(offset, offset + limit)
          return { data: paginatedCheckins }
        }

        // Production: use real API
        const result = await baseQuery(
          `/checkins?limit=${limit}&offset=${offset}`,
        )
        return result.data
          ? { data: result.data as MoodCheckin[] }
          : { error: result.error }
      },
      providesTags: ['Checkin'],
    }),
    getDailyCheckins: builder.query<MoodCheckin[], { date: string }>({
      query: ({ date }) => `/checkins/daily/${date}`,
      providesTags: ['Checkin'],
    }),
    getCheckinStats: builder.query<CheckinStats, void>({
      queryFn: async (_, { getState }, extraOptions, baseQuery) => {
        // Development mock
        if (isDevelopment) {
          await new Promise((resolve) => setTimeout(resolve, 300))
          const mockStats = generateMockCheckinStats()
          return { data: mockStats }
        }

        // Production: use real API
        const result = await baseQuery('/checkins/stats')
        return result.data
          ? { data: result.data as CheckinStats }
          : { error: result.error }
      },
      providesTags: ['Checkin'],
    }),

    // ========================================================================
    // Pet Endpoints
    // ========================================================================
    getPet: builder.query<Pet, void>({
      queryFn: async (arg, _, extraOptions, baseQuery) => {
        // Development mock
        if (isDevelopment) {
          await new Promise((resolve) => setTimeout(resolve, 300))
          return { data: generateMockPet() }
        }

        // Production: use real API
        const result = await baseQuery('/pet')
        return result.data
          ? { data: result.data as Pet }
          : { error: result.error }
      },
      providesTags: ['Pet'],
    }),
    feedPet: builder.mutation<FeedPetResponse, void>({
      queryFn: async (arg, _, extraOptions, baseQuery) => {
        // Development mock
        if (isDevelopment) {
          await new Promise((resolve) => setTimeout(resolve, 500))
          const updatedPet = updateMockPetHappiness(10)
          return {
            data: {
              ok: true,
              happiness_level: updatedPet.happiness_level,
              happiness_change: 10,
            },
          }
        }

        // Production: use real API
        const result = await baseQuery({
          url: '/pet/feed',
          method: 'POST',
        })
        return result.data
          ? { data: result.data as FeedPetResponse }
          : { error: result.error }
      },
      invalidatesTags: ['Pet'],
    }),
    petPet: builder.mutation<FeedPetResponse, void>({
      queryFn: async (arg, _, extraOptions, baseQuery) => {
        // Development mock
        if (isDevelopment) {
          await new Promise((resolve) => setTimeout(resolve, 400))
          const updatedPet = updateMockPetHappiness(5)
          return {
            data: {
              ok: true,
              happiness_level: updatedPet.happiness_level,
              happiness_change: 5,
            },
          }
        }

        // Production: use real API
        const result = await baseQuery({
          url: '/pet/pet',
          method: 'POST',
        })
        return result.data
          ? { data: result.data as FeedPetResponse }
          : { error: result.error }
      },
      invalidatesTags: ['Pet'],
    }),
    talkToPet: builder.mutation<PetTalkResponse, void>({
      queryFn: async (arg, _, extraOptions, baseQuery) => {
        // Development mock
        if (isDevelopment) {
          await new Promise((resolve) => setTimeout(resolve, 600))
          const updatedPet = updateMockPetHappiness(2)
          const dialogue = generateMockDialogue(updatedPet.happiness_level)
          return {
            data: {
              ok: true,
              pet: updatedPet,
              dialogue,
            } as any, // Backend returns { ok, pet, response } but type expects { ok, happiness_level, dialogue }
          }
        }

        // Production: use real API
        const result = await baseQuery({
          url: '/pet/talk',
          method: 'POST',
        })
        return result.data
          ? { data: result.data as PetTalkResponse }
          : { error: result.error }
      },
      invalidatesTags: ['Pet'],
    }),
    updatePetName: builder.mutation<
      { ok: boolean; name: string },
      { name: string }
    >({
      queryFn: async ({ name }, { getState }, extraOptions, baseQuery) => {
        // Development mock
        if (isDevelopment) {
          await new Promise((resolve) => setTimeout(resolve, 300))
          mockPetState = { ...mockPetState, name }
          return { data: { ok: true, name } }
        }

        // Production: use real API
        const result = await baseQuery({
          url: '/pet/name',
          method: 'PUT',
          body: { name },
        })
        return result.data
          ? { data: result.data as { ok: boolean; name: string } }
          : { error: result.error }
      },
      invalidatesTags: ['Pet'],
    }),
    customizePet: builder.mutation<{ ok: boolean }, CustomizePetRequest>({
      queryFn: async (
        { cosmetic_skin },
        { getState },
        extraOptions,
        baseQuery,
      ) => {
        // Development mock
        if (isDevelopment) {
          await new Promise((resolve) => setTimeout(resolve, 300))
          mockPetState = { ...mockPetState, cosmetic_skin }
          return { data: { ok: true } }
        }

        // Production: use real API
        const result = await baseQuery({
          url: '/pet/customize',
          method: 'POST',
          body: { cosmetic_skin },
        })
        return result.data
          ? { data: result.data as { ok: boolean } }
          : { error: result.error }
      },
      invalidatesTags: ['Pet'],
    }),

    // ========================================================================
    // Diary Endpoints
    // ========================================================================
    getDiaryEntries: builder.query<DiaryEntry[], GetDiaryEntriesRequest>({
      queryFn: async (
        { limit = 10, offset = 0, tags, date },
        { getState },
        extraOptions,
        baseQuery,
      ) => {
        // Development mock
        if (isDevelopment) {
          await new Promise((resolve) => setTimeout(resolve, 500))
          let allEntries = generateMockDiaryEntries(20)

          // Filter by date if provided
          if (date) {
            allEntries = allEntries.filter((entry) => entry.date === date)
          }

          // Filter by tags if provided (simplified - just checks if any tag matches)
          if (tags) {
            const tagIds = tags.split(',').map(Number)
            allEntries = allEntries.filter((entry) =>
              entry.tags?.some((tag) => tagIds.includes(tag.id)),
            )
          }

          const paginatedEntries = allEntries.slice(offset, offset + limit)
          return { data: paginatedEntries }
        }

        // Production: use real API
        const params = new URLSearchParams({
          limit: limit.toString(),
          offset: offset.toString(),
        })
        if (tags) params.append('tags', tags)
        if (date) params.append('date', date)

        const result = await baseQuery(`/diary?${params.toString()}`)
        return result.data
          ? { data: result.data as DiaryEntry[] }
          : { error: result.error }
      },
      providesTags: ['Diary'],
    }),
    createDiaryEntry: builder.mutation<
      { ok: boolean; entry: DiaryEntry },
      CreateDiaryEntryRequest
    >({
      query: (body) => ({
        url: '/diary/entries',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Diary'],
    }),
    updateDiaryEntry: builder.mutation<
      { ok: boolean; entry: DiaryEntry },
      { id: number; data: UpdateDiaryEntryRequest }
    >({
      query: ({ id, data }) => ({
        url: `/diary/entries/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Diary'],
    }),
    deleteDiaryEntry: builder.mutation<{ ok: boolean }, number>({
      query: (id) => ({
        url: `/diary/entries/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Diary'],
    }),
    getMonthlyHeatmap: builder.query<
      MonthlyHeatmapData[],
      { year: number; month: number }
    >({
      queryFn: async (
        { year, month },
        { getState },
        extraOptions,
        baseQuery,
      ) => {
        // Development mock
        if (isDevelopment) {
          await new Promise((resolve) => setTimeout(resolve, 300))
          const mockData = generateMockHeatmapData(year, month)
          return { data: mockData }
        }

        // Production: use real API
        const result = await baseQuery(
          `/diary/monthly?year=${year}&month=${month}`,
        )
        return result.data
          ? { data: result.data as MonthlyHeatmapData[] }
          : { error: result.error }
      },
      providesTags: ['Diary'],
    }),

    // ========================================================================
    // Preferences Endpoints
    // ========================================================================
    getPreferences: builder.query<UserPreferences, void>({
      query: () => '/preferences',
      providesTags: ['Preferences'],
    }),
    updatePreferences: builder.mutation<
      { ok: boolean; preferences: UserPreferences },
      Partial<UserPreferences>
    >({
      query: (body) => ({
        url: '/preferences',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Preferences'],
    }),
    updateProfile: builder.mutation<
      { ok: boolean; user: User },
      UpdateProfileRequest
    >({
      query: (body) => ({
        url: '/auth/profile',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),
    changePassword: builder.mutation<
      { ok: boolean; message: string },
      ChangePasswordRequest
    >({
      query: (body) => ({
        url: '/auth/change-password',
        method: 'POST',
        body,
      }),
    }),
    deleteAccount: builder.mutation<
      { ok: boolean; message: string },
      DeleteAccountRequest
    >({
      query: (body) => ({
        url: '/auth/account',
        method: 'DELETE',
        body,
      }),
      invalidatesTags: ['Auth', 'Checkin', 'Pet', 'Diary', 'Preferences'],
    }),
    exportData: builder.query<{ ok: boolean; data: ExportDataResponse }, void>({
      query: () => '/auth/export-data',
    }),
    createSubscription: builder.mutation<{tier: SubscriptionTier; payment_method_id: string }, void>({
      query: () => ({
        url: 'subscriptions/create',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),

    // ========================================================================
    // Legacy Endpoints (keep for compatibility)
    // ========================================================================
    generateImage: builder.mutation<
      GenerateImageResponse,
      GenerateImageRequest
    >({
      query: (body) => ({
        url: '/generate-image',
        method: 'POST',
        body,
      }),
    }),
    getAnalytics: builder.query({
      queryFn: () => {
        return analyticsService
          .getAnalytics()
          .then((res) => {
            return {
              data: res,
              error: undefined,
            }
          })
          .catch((res) => {
            return {
              data: undefined,
              error: res,
            }
          })
      },
    }),
  }),
})

// Export hooks for all endpoints
export const {
  // Auth
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  // Checkin
  useCreateCheckinMutation,
  useGetCheckinsQuery,
  useGetDailyCheckinsQuery,
  useGetCheckinStatsQuery,
  // Pet
  useGetPetQuery,
  useFeedPetMutation,
  usePetPetMutation,
  useTalkToPetMutation,
  useUpdatePetNameMutation,
  useCustomizePetMutation,
  // Diary
  useGetDiaryEntriesQuery,
  useCreateDiaryEntryMutation,
  useUpdateDiaryEntryMutation,
  useDeleteDiaryEntryMutation,
  useGetMonthlyHeatmapQuery,
  // Preferences
  useGetPreferencesQuery,
  useUpdatePreferencesMutation,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useDeleteAccountMutation,
  useExportDataQuery,
  useCreateSubscriptionMutation,
  // Legacy
  useGenerateImageMutation,
  useGetAnalyticsQuery,
} = api
