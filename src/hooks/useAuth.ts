import { useEffect, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '../__data__/store'
import {
  setUser,
  setLoading,
  setError,
  logout as logoutAction,
  selectUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  selectIsPremium,
} from '../__data__/slices/authSlice'
import {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
} from '../__data__/api'
import { authService } from '../service/auth'
import { isMockAuthEnabled, getMockAuthResponse, getMockUser } from '../utils/mockAuth'
import type { LoginRequest, RegisterRequest } from '../types'

export const useAuth = () => {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectUser)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const isLoading = useAppSelector(selectAuthLoading)
  const error = useAppSelector(selectAuthError)
  const isPremium = useAppSelector(selectIsPremium)

  // RTK Query mutations
  const [loginMutation, { isLoading: isLoginLoading }] = useLoginMutation()
  const [registerMutation, { isLoading: isRegisterLoading }] = useRegisterMutation()
  const [logoutMutation] = useLogoutMutation()
  const [refreshTokenMutation] = useRefreshTokenMutation()

  // Check for stored token on mount (or use mock auth in dev)
  useEffect(() => {
    const checkAuth = () => {
      // Set loading state to prevent premature redirects
      dispatch(setLoading(true))

      // Development: Use mock auth if enabled
      if (isMockAuthEnabled()) {
        const mockResponse = getMockAuthResponse()
        authService.setToken(mockResponse.token)
        authService.setRefreshToken(mockResponse.refreshToken)
        dispatch(setUser(mockResponse.user))
        dispatch(setLoading(false))
        console.log('🔓 Mock auth: Auto-logged in as', mockResponse.user.email)
        return
      }

      // Production: Check for existing token
      if (authService.isAuthenticated()) {
        const userData = authService.getUserFromToken()
        if (userData) {
          dispatch(setUser({
            id: userData.id,
            email: userData.email,
            username: '', // Will be populated from full user data if needed
            subscription_tier: userData.tier as 'free' | 'premium',
            created_at: '',
            updated_at: '',
          }))
        }
      }

      // Auth check complete
      dispatch(setLoading(false))
    }

    checkAuth()
  }, [dispatch])

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    dispatch(setLoading(true))
    dispatch(setError(null))

    try {
      const result = await loginMutation({ email, password })

      if ('data' in result && result.data) {
        // Store tokens
        authService.setToken(result.data.token)
        authService.setRefreshToken(result.data.refreshToken)

        // Update Redux state
        dispatch(setUser(result.data.user))

        return { success: true }
      } else if ('error' in result) {
        dispatch(setError('Login failed'))
        return { error: result.error }
      }

      return { error: 'Unknown error' }
    } catch (err) {
      dispatch(setError('Login failed'))
      return { error: err }
    } finally {
      dispatch(setLoading(false))
    }
  }, [loginMutation, dispatch])

  // Register function
  const register = useCallback(async (data: RegisterRequest) => {
    dispatch(setLoading(true))
    dispatch(setError(null))

    try {
      const result = await registerMutation(data)

      if ('data' in result && result.data) {
        // Auto-login: Store tokens
        authService.setToken(result.data.token)
        authService.setRefreshToken(result.data.refreshToken)

        // Update Redux state
        dispatch(setUser(result.data.user))

        return { success: true }
      } else if ('error' in result) {
        dispatch(setError('Registration failed'))
        return { error: result.error }
      }

      return { error: 'Unknown error' }
    } catch (err) {
      dispatch(setError('Registration failed'))
      return { error: err }
    } finally {
      dispatch(setLoading(false))
    }
  }, [registerMutation, dispatch])

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Call logout endpoint (optional, might fail if token is expired)
      await logoutMutation()
    } catch (err) {
      console.error('Logout API call failed:', err)
    } finally {
      // Clear tokens and Redux state regardless of API success
      authService.clearTokens()
      dispatch(logoutAction())
    }
  }, [logoutMutation, dispatch])

  // Check and refresh token if needed
  const checkAndRefreshToken = useCallback(async () => {
    const token = authService.getToken()

    if (!token) {
      return
    }

    // Check if token needs refresh (within 5 minutes of expiry)
    if (authService.needsRefresh(token)) {
      try {
        const result = await refreshTokenMutation()

        if ('data' in result && result.data) {
          authService.setToken(result.data.token)
          return { success: true }
        } else {
          // Refresh failed, logout user
          await logout()
          return { error: 'Token refresh failed' }
        }
      } catch (err) {
        await logout()
        return { error: err }
      }
    }

    return { success: true }
  }, [refreshTokenMutation, logout])

  // Auto-refresh token periodically
  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    // Check token every 4 minutes
    const interval = setInterval(() => {
      checkAndRefreshToken()
    }, 4 * 60 * 1000)

    // Initial check
    checkAndRefreshToken()

    return () => clearInterval(interval)
  }, [isAuthenticated, checkAndRefreshToken])

  return {
    user,
    isAuthenticated,
    isLoading: isLoading || isLoginLoading || isRegisterLoading,
    error,
    isPremium,
    login,
    register,
    logout,
    checkAndRefreshToken,
  }
}
