import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
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
} from '../types'

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
const isDevelopment = true

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

const generateMockHeatmapData = (year: number, month: number): MonthlyHeatmapData[] => {
  const daysInMonth = new Date(year, month, 0).getDate()
  const emotions = ['happy', 'sad', 'calm', 'stressed', 'excited', 'angry']

  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const emotionCount = Math.floor(Math.random() * 8) // 0-7 emotions per day

    return {
      date,
      emotion_count: emotionCount,
      emotions: emotionCount > 0
        ? emotions.slice(0, Math.min(emotionCount, emotions.length))
        : [],
    }
  })
}

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      const token = getToken()
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['Auth', 'Checkin', 'Pet', 'Diary'],
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
    createCheckin: builder.mutation<CreateCheckinResponse, CreateCheckinRequest>({
      query: (checkin) => ({
        url: '/checkins',
        method: 'POST',
        body: checkin,
      }),
      invalidatesTags: ['Checkin', 'Pet'],
    }),
    getCheckins: builder.query<MoodCheckin[], { limit?: number; offset?: number }>({
      query: ({ limit = 10, offset = 0 }) => `/checkins?limit=${limit}&offset=${offset}`,
      providesTags: ['Checkin'],
    }),
    getDailyCheckins: builder.query<MoodCheckin[], { date: string }>({
      query: ({ date }) => `/checkins/daily/${date}`,
      providesTags: ['Checkin'],
    }),
    getCheckinStats: builder.query<CheckinStats, void>({
      query: () => '/checkins/stats',
      providesTags: ['Checkin'],
    }),

    // ========================================================================
    // Pet Endpoints
    // ========================================================================
    getPet: builder.query<Pet, void>({
      query: () => '/pet',
      providesTags: ['Pet'],
    }),
    feedPet: builder.mutation<FeedPetResponse, void>({
      query: () => ({
        url: '/pet/feed',
        method: 'POST',
      }),
      invalidatesTags: ['Pet'],
    }),
    petPet: builder.mutation<FeedPetResponse, void>({
      query: () => ({
        url: '/pet/pet',
        method: 'POST',
      }),
      invalidatesTags: ['Pet'],
    }),
    talkToPet: builder.mutation<PetTalkResponse, void>({
      query: () => ({
        url: '/pet/talk',
        method: 'POST',
      }),
      invalidatesTags: ['Pet'],
    }),
    updatePetName: builder.mutation<{ ok: boolean; name: string }, { name: string }>({
      query: (body) => ({
        url: '/pet/name',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Pet'],
    }),
    customizePet: builder.mutation<{ ok: boolean }, CustomizePetRequest>({
      query: (body) => ({
        url: '/pet/customize',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Pet'],
    }),

    // ========================================================================
    // Diary Endpoints
    // ========================================================================
    getDiaryEntries: builder.query<DiaryEntry[], GetDiaryEntriesRequest>({
      queryFn: async ({ limit = 10, offset = 0, tags, date }, { getState }, extraOptions, baseQuery) => {
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
              entry.tags?.some((tag) => tagIds.includes(tag.id))
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
        return result.data ? { data: result.data as DiaryEntry[] } : { error: result.error }
      },
      providesTags: ['Diary'],
    }),
    createDiaryEntry: builder.mutation<{ ok: boolean; entry: DiaryEntry }, CreateDiaryEntryRequest>({
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
    getMonthlyHeatmap: builder.query<MonthlyHeatmapData[], { year: number; month: number }>({
      queryFn: async ({ year, month }, { getState }, extraOptions, baseQuery) => {
        // Development mock
        if (isDevelopment) {
          await new Promise((resolve) => setTimeout(resolve, 300))
          const mockData = generateMockHeatmapData(year, month)
          return { data: mockData }
        }

        // Production: use real API
        const result = await baseQuery(`/diary/monthly?year=${year}&month=${month}`)
        return result.data ? { data: result.data as MonthlyHeatmapData[] } : { error: result.error }
      },
      providesTags: ['Diary'],
    }),

    // ========================================================================
    // Legacy Endpoints (keep for compatibility)
    // ========================================================================
    generateImage: builder.mutation<GenerateImageResponse, GenerateImageRequest>({
      query: (body) => ({
        url: '/generate-image',
        method: 'POST',
        body,
      }),
    }),
    getAnalytics: builder.query({
      queryFn: () => {
        return analyticsService.getAnalytics().then(res => {
          return {
            data: res,
            error: undefined
          }
        }).catch(res => {
          return {
            data: undefined,
            error: res
          }
        })
      }
    })
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
  // Legacy
  useGenerateImageMutation,
  useGetAnalyticsQuery,
} = api
