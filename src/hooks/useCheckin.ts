import { useState, useCallback } from 'react'
import { useAppDispatch } from '../__data__/store'
import { useCreateCheckinMutation } from '../__data__/api'
import { addCheckin, updateStreak, setError as setCheckinError } from '../__data__/slices/checkinSlice'
import { increaseHappiness } from '../__data__/slices/petSlice'
import type { CreateCheckinRequest } from '../types'

export interface CheckinData {
  emotion: string
  intensity: number
  reflection: string
}

export interface CheckinResult {
  success: boolean
  data?: {
    emotionName: string
    streak: number
  }
  error?: {
    message: string
  }
}

export interface UseCheckinReturn {
  submit: (data: CheckinData) => Promise<CheckinResult>
  isLoading: boolean
  error: string | null
}

// Emotion ID mapping (matching backend emotion IDs)
const EMOTION_ID_MAP: Record<string, number> = {
  happy: 1,
  sad: 2,
  angry: 3,
  calm: 4,
  stressed: 5,
  excited: 6,
}

export const useCheckin = (): UseCheckinReturn => {
  const dispatch = useAppDispatch()
  const [createCheckin, { isLoading, error: mutationError }] = useCreateCheckinMutation()
  const [error, setError] = useState<string | null>(null)

  const submit = useCallback(
    async (data: CheckinData): Promise<CheckinResult> => {
      setError(null)
      dispatch(setCheckinError(null))

      try {
        // Map emotion string to emotion_id
        const emotionId = EMOTION_ID_MAP[data.emotion]
        if (!emotionId) {
          const errorMsg = `Invalid emotion: ${data.emotion}`
          setError(errorMsg)
          return {
            success: false,
            error: { message: errorMsg },
          }
        }

        // Prepare request
        const request: CreateCheckinRequest = {
          emotion_id: emotionId,
          intensity: data.intensity,
          reflection_text: data.reflection || undefined,
        }

        // Call API
        const result = await createCheckin(request).unwrap()

        if (result.ok && result.checkin) {
          // Update checkin store
          dispatch(addCheckin(result.checkin))
          if (result.streak_updated) {
            dispatch(updateStreak(result.new_streak))
          }

          // Update pet store (increase happiness by 5)
          dispatch(increaseHappiness(5))

          // Get emotion name from checkin
          const emotionName = result.checkin.emotion?.name || data.emotion

          return {
            success: true,
            data: {
              emotionName,
              streak: result.new_streak,
            },
          }
        } else {
          const errorMsg = 'Failed to create checkin'
          setError(errorMsg)
          dispatch(setCheckinError(errorMsg))
          return {
            success: false,
            error: { message: errorMsg },
          }
        }
      } catch (err: any) {
        // Handle network errors or API errors
        const errorMsg =
          err?.data?.message || err?.message || 'Network error. Please try again.'
        setError(errorMsg)
        dispatch(setCheckinError(errorMsg))
        return {
          success: false,
          error: { message: errorMsg },
        }
      }
    },
    [createCheckin, dispatch]
  )

  return {
    submit,
    isLoading,
    error: error || (mutationError ? 'Failed to submit checkin' : null),
  }
}
