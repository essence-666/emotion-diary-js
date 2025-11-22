import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AuthState, User, SubscriptionTier } from '../../types'
import type { RootState } from '../store'

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true, // Start with loading=true to prevent premature redirects during auth check
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
      state.error = null
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.loading = false
    },
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.loading = false
      state.error = null
    },
    updateSubscriptionTier: (state, action: PayloadAction<SubscriptionTier>) => {
      if (state.user) {
        state.user.subscription_tier = action.payload
      }
    },
  },
})

export const { setUser, setLoading, setError, logout, updateSubscriptionTier } = authSlice.actions

// Selectors
export const selectUser = (state: RootState) => state.auth.user
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated
export const selectAuthLoading = (state: RootState) => state.auth.loading
export const selectAuthError = (state: RootState) => state.auth.error
export const selectIsPremium = (state: RootState) =>
  state.auth.user?.subscription_tier === 'premium'
export const selectSubscriptionTier = (state: RootState) =>
  state.auth.user?.subscription_tier || 'free'

export default authSlice.reducer
