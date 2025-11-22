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
      query: ({ limit = 10, offset = 0, tags }) => {
        const params = new URLSearchParams({
          limit: limit.toString(),
          offset: offset.toString(),
        })
        if (tags) params.append('tags', tags)
        return `/diary?${params.toString()}`
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
      query: ({ year, month }) => `/diary/monthly?year=${year}&month=${month}`,
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
