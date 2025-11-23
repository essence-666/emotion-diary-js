import React from 'react'
import { renderHook, waitFor, act } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { api } from '../../__data__/api'
import checkinReducer from '../../__data__/slices/checkinSlice'
import petReducer from '../../__data__/slices/petSlice'
import type { CreateCheckinResponse, MoodCheckin } from '../../types'

// Mock the RTK Query hook
const mockTrigger = jest.fn()
const mockUseCreateCheckinMutation = jest.fn()

jest.mock('../../__data__/api', () => ({
  api: {
    reducerPath: 'api',
    reducer: (state = {}) => state,
    middleware: () => (next: any) => (action: any) => next(action),
  },
  useCreateCheckinMutation: () => mockUseCreateCheckinMutation(),
}))

// Emotion ID mapping (matching backend)
const EMOTION_ID_MAP: Record<string, number> = {
  happy: 1,
  sad: 2,
  angry: 3,
  calm: 4,
  stressed: 5,
  excited: 6,
}

// Import after mocks are set up
import { useCheckin } from '../useCheckin'

describe('useCheckin', () => {
  let store: ReturnType<typeof configureStore>

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup mock mutation with unwrap method
    const successResponse: CreateCheckinResponse = {
      ok: true,
      checkin: {
        id: 1,
        user_id: 1,
        emotion_id: 1,
        intensity: 5,
        reflection_text: 'Test reflection',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        emotion: {
          id: 1,
          name: 'happy',
          emoji: '😊',
          color: '#fbbf24',
          description: 'Happy emotion',
        },
      } as MoodCheckin,
      streak_updated: true,
      new_streak: 5,
    }

    mockTrigger.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue(successResponse),
    })

    mockUseCreateCheckinMutation.mockReturnValue([mockTrigger, { isLoading: false, error: null }])

    // Create store
    store = configureStore({
      reducer: {
        [api.reducerPath]: api.reducer,
        checkin: checkinReducer,
        pet: petReducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: false,
        }).concat(api.middleware),
    })
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )

  test('returns submit function, isLoading, error', () => {
    const { result } = renderHook(() => useCheckin(), { wrapper })

    expect(result.current).toHaveProperty('submit')
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('error')
    expect(typeof result.current.submit).toBe('function')
  })

  test('submit calls API: POST /api/v1/checkins', async () => {
    const { result } = renderHook(() => useCheckin(), { wrapper })

    await act(async () => {
      await result.current.submit({
        emotion: 'happy',
        intensity: 5,
        reflection: 'Test reflection',
      })
    })

    expect(mockTrigger).toHaveBeenCalledWith({
      emotion_id: EMOTION_ID_MAP.happy,
      intensity: 5,
      reflection_text: 'Test reflection',
    })
  })

  test('updates checkinStore on success', async () => {
    const { result } = renderHook(() => useCheckin(), { wrapper })

    await act(async () => {
      await result.current.submit({
        emotion: 'happy',
        intensity: 5,
        reflection: 'Test reflection',
      })
    })

    await waitFor(() => {
      const state = store.getState()
      expect(state.checkin.checkins).toHaveLength(1)
      expect(state.checkin.checkins[0].emotion_id).toBe(1)
      expect(state.checkin.checkins[0].intensity).toBe(5)
    })
  })

  test('updates petStore happiness on success', async () => {
    // Set initial pet state
    await act(async () => {
      store.dispatch({
        type: 'pet/setPet',
        payload: {
          id: 1,
          user_id: 1,
          name: 'Test Pet',
          pet_type: 'dog',
          happiness_level: 50,
          last_interaction: '2024-01-01T00:00:00Z',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      })
    })

    const { result } = renderHook(() => useCheckin(), { wrapper })

    await act(async () => {
      await result.current.submit({
        emotion: 'happy',
        intensity: 5,
        reflection: 'Test reflection',
      })
    })

    await waitFor(() => {
      const state = store.getState()
      expect(state.pet.happinessLevel).toBe(55) // 50 + 5
    })
  })

  test('sets isLoading during submission', async () => {
    // Mock loading state
    mockUseCreateCheckinMutation.mockReturnValueOnce([
      mockTrigger,
      { isLoading: true, error: null },
    ])

    const { result } = renderHook(() => useCheckin(), { wrapper })

    expect(result.current.isLoading).toBe(true)
  })

  test('sets error on failure', async () => {
    const errorResponse = {
      error: {
        status: 400,
        data: { message: 'Invalid checkin data' },
      },
    }

    mockTrigger.mockReturnValue({
      unwrap: jest.fn().mockRejectedValue(errorResponse),
    })

    const { result } = renderHook(() => useCheckin(), { wrapper })

    await act(async () => {
      await result.current.submit({
        emotion: 'happy',
        intensity: 5,
        reflection: '',
      })
    })

    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
    })
  })

  test('handles network errors gracefully', async () => {
    const networkError = new Error('Network error')
    mockTrigger.mockReturnValue({
      unwrap: jest.fn().mockRejectedValue(networkError),
    })

    const { result } = renderHook(() => useCheckin(), { wrapper })

    await act(async () => {
      await result.current.submit({
        emotion: 'happy',
        intensity: 5,
        reflection: '',
      })
    })

    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
      expect(result.current.error).toContain('Network error')
    })
  })
})

