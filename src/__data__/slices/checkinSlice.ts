import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { CheckinState, MoodCheckin } from '../../types'
import type { RootState } from '../store'

const initialState: CheckinState = {
  checkins: [],
  todayCheckin: null,
  currentStreak: 0,
  loading: false,
  error: null,
}

const checkinSlice = createSlice({
  name: 'checkin',
  initialState,
  reducers: {
    setCheckins: (state, action: PayloadAction<MoodCheckin[]>) => {
      state.checkins = action.payload
      state.error = null
    },
    addCheckin: (state, action: PayloadAction<MoodCheckin>) => {
      state.checkins = [action.payload, ...state.checkins]
      state.todayCheckin = action.payload
      state.error = null
    },
    setTodayCheckin: (state, action: PayloadAction<MoodCheckin | null>) => {
      state.todayCheckin = action.payload
    },
    updateStreak: (state, action: PayloadAction<number>) => {
      state.currentStreak = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.loading = false
    },
    clearCheckins: (state) => {
      state.checkins = []
      state.todayCheckin = null
      state.currentStreak = 0
      state.error = null
    },
  },
})

export const {
  setCheckins,
  addCheckin,
  setTodayCheckin,
  updateStreak,
  setLoading,
  setError,
  clearCheckins,
} = checkinSlice.actions

// Selectors
export const selectCheckins = (state: RootState) => state.checkin.checkins
export const selectTodayCheckin = (state: RootState) => state.checkin.todayCheckin
export const selectCurrentStreak = (state: RootState) => state.checkin.currentStreak
export const selectCheckinLoading = (state: RootState) => state.checkin.loading
export const selectCheckinError = (state: RootState) => state.checkin.error
export const selectHasCheckedInToday = (state: RootState) => state.checkin.todayCheckin !== null

// Computed selectors
export const selectRecentCheckins = (state: RootState, limit: number = 7) =>
  state.checkin.checkins.slice(0, limit)

export default checkinSlice.reducer
