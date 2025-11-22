import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { DiaryState, DiaryEntry } from '../../types'
import type { RootState } from '../store'

const initialState: DiaryState = {
  entries: [],
  selectedEntry: null,
  filters: {
    tags: [],
    dateRange: undefined,
  },
  pagination: {
    limit: 10,
    offset: 0,
    hasMore: true,
  },
  loading: false,
  error: null,
}

const diarySlice = createSlice({
  name: 'diary',
  initialState,
  reducers: {
    setEntries: (state, action: PayloadAction<DiaryEntry[]>) => {
      state.entries = action.payload
      state.error = null
    },
    addEntries: (state, action: PayloadAction<DiaryEntry[]>) => {
      state.entries = [...state.entries, ...action.payload]
      state.pagination.offset += action.payload.length
      state.pagination.hasMore = action.payload.length === state.pagination.limit
      state.error = null
    },
    addEntry: (state, action: PayloadAction<DiaryEntry>) => {
      state.entries = [action.payload, ...state.entries]
      state.error = null
    },
    updateEntry: (state, action: PayloadAction<DiaryEntry>) => {
      const index = state.entries.findIndex(e => e.id === action.payload.id)
      if (index !== -1) {
        state.entries[index] = action.payload
      }
      if (state.selectedEntry?.id === action.payload.id) {
        state.selectedEntry = action.payload
      }
      state.error = null
    },
    removeEntry: (state, action: PayloadAction<number>) => {
      state.entries = state.entries.filter(e => e.id !== action.payload)
      if (state.selectedEntry?.id === action.payload) {
        state.selectedEntry = null
      }
      state.error = null
    },
    setSelectedEntry: (state, action: PayloadAction<DiaryEntry | null>) => {
      state.selectedEntry = action.payload
    },
    setTagFilters: (state, action: PayloadAction<number[]>) => {
      state.filters.tags = action.payload
      state.pagination.offset = 0
      state.entries = []
    },
    setDateRangeFilter: (state, action: PayloadAction<{ start: string; end: string } | undefined>) => {
      state.filters.dateRange = action.payload
      state.pagination.offset = 0
      state.entries = []
    },
    clearFilters: (state) => {
      state.filters = {
        tags: [],
        dateRange: undefined,
      }
      state.pagination.offset = 0
      state.entries = []
    },
    resetPagination: (state) => {
      state.pagination = {
        limit: 10,
        offset: 0,
        hasMore: true,
      }
      state.entries = []
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.loading = false
    },
    clearDiary: (state) => {
      state.entries = []
      state.selectedEntry = null
      state.pagination = { ...initialState.pagination }
      state.error = null
    },
  },
})

export const {
  setEntries,
  addEntries,
  addEntry,
  updateEntry,
  removeEntry,
  setSelectedEntry,
  setTagFilters,
  setDateRangeFilter,
  clearFilters,
  resetPagination,
  setLoading,
  setError,
  clearDiary,
} = diarySlice.actions

// Selectors
export const selectDiaryEntries = (state: RootState) => state.diary.entries
export const selectSelectedEntry = (state: RootState) => state.diary.selectedEntry
export const selectDiaryFilters = (state: RootState) => state.diary.filters
export const selectDiaryPagination = (state: RootState) => state.diary.pagination
export const selectDiaryLoading = (state: RootState) => state.diary.loading
export const selectDiaryError = (state: RootState) => state.diary.error
export const selectHasMoreEntries = (state: RootState) => state.diary.pagination.hasMore

// Computed selectors
export const selectEntryById = (state: RootState, entryId: number) =>
  state.diary.entries.find(e => e.id === entryId)

export default diarySlice.reducer
