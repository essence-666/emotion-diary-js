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
  SubscriptionStatusResponse,
  Recommendation,
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
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 20 }) => `/checkins?page=${page}&limit=${limit}`,
      transformResponse: (response: { ok: boolean; checkins: MoodCheckin[] }) =>
        response.checkins || [],
      providesTags: ['Checkin'],
    }),
    getDailyCheckins: builder.query<MoodCheckin[], { date: string }>({
      query: ({ date }) => `/checkins/daily/${date}`,
      providesTags: ['Checkin'],
    }),
    getCheckinStats: builder.query<CheckinStats, { days?: number }>({
      query: ({ days = 7 }) => `/checkins/stats?days=${days}`,
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
    talkToPet: builder.mutation<PetTalkResponse, { message: string }>({
      query: (body) => ({
        url: '/pet/talk',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Pet'],
    }),
    updatePetName: builder.mutation<
      { ok: boolean; name: string },
      { name: string }
    >({
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
      query: ({ page = 1, limit = 20, tags }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        })
        if (tags) params.append('tags', tags)
        return `/diary?${params.toString()}`
      },
      transformResponse: (response: { ok: boolean; entries: DiaryEntry[] }) =>
        response.entries || [],
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
      query: ({ year, month }) => `/diary/monthly?year=${year}&month=${month}`,
      transformResponse: (response: { ok: boolean; year: number; month: number; heat_map: Record<string, { entry_count: number; checkin_count: number }> }) => {
        const heatMap = response.heat_map || {}
        return Object.entries(heatMap).map(([date, data]) => ({
          date,
          emotion_count: data.entry_count + data.checkin_count,
          emotions: [], // Backend doesn't provide emotion names in this endpoint
        }))
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
    createSubscription: builder.mutation<void, {tier: SubscriptionTier; payment_method_id: string }>({
      query: (body) => ({
        url: '/subscriptions/create',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Auth'],
    }),
    getSubscriptionStatus: builder.query<SubscriptionStatusResponse, void>({
      query: () => '/subscriptions/status',
      providesTags: ['Auth'],
    }),
    cancelSubscription: builder.mutation<{ ok: boolean; message: string }, void>({
      query: () => ({
        url: '/subscriptions/cancel',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),

    // ========================================================================
    // Insights Endpoints (Premium)
    // ========================================================================
    getWeeklyInsights: builder.query<{ ok: boolean; ai_analysis: string; statistics: CheckinStats }, void>({
      query: () => '/insights/weekly',
      providesTags: ['Checkin'],
    }),
    getTriggers: builder.query<{ ok: boolean; triggers: MoodTrigger[]; ai_analysis: string }, void>({
      query: () => '/insights/triggers',
      providesTags: ['Checkin'],
    }),
    getRecommendations: builder.query<{ ok: boolean; recommendations: Recommendation[]; ai_analysis?: string }, void>({
      query: () => '/insights/recommendations',
      providesTags: ['Checkin'],
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
  useGetSubscriptionStatusQuery,
  useCancelSubscriptionMutation,
  // Insights
  useGetWeeklyInsightsQuery,
  useGetTriggersQuery,
  useGetRecommendationsQuery,
  // Legacy
  useGenerateImageMutation,
  useGetAnalyticsQuery,
} = api
