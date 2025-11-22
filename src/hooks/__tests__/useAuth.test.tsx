import React from 'react'
import { renderHook, act, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { useAuth } from '../useAuth'
import { authService } from '../../service/auth'
import { mockUser, mockAuthResponse } from '../../__tests__/utils/mock-data'
import authReducer from '../../__data__/slices/authSlice'
import { api } from '../../__data__/api'

// Mock the auth service
jest.mock('../../service/auth')

// Mock RTK Query hooks
const mockLogin = jest.fn()
const mockRegister = jest.fn()
const mockLogout = jest.fn()
const mockRefreshToken = jest.fn()

jest.mock('../../__data__/api', () => ({
  api: {
    reducer: (state = {}) => state,
    reducerPath: 'api',
    middleware: () => (next: any) => (action: any) => next(action),
  },
  useLoginMutation: () => [mockLogin, { isLoading: false, error: null }],
  useRegisterMutation: () => [mockRegister, { isLoading: false, error: null }],
  useLogoutMutation: () => [mockLogout, { isLoading: false, error: null }],
  useRefreshTokenMutation: () => [mockRefreshToken, { isLoading: false, error: null }],
}))

describe('useAuth Hook', () => {
  let store: ReturnType<typeof configureStore>

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    (authService.getToken as jest.Mock).mockReturnValue(null);
    (authService.isAuthenticated as jest.Mock).mockReturnValue(false)

    // Create fresh store for each test
    store = configureStore({
      reducer: {
        auth: authReducer,
        [api.reducerPath]: api.reducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(api.middleware as any),
    })
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )

  describe('Initialization', () => {
    it('should initialize with unauthenticated state', () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBeNull()
      expect(result.current.isLoading).toBe(false)
    })

    it('should check for stored token on mount', () => {
      (authService.isAuthenticated as jest.Mock).mockReturnValue(true);
      (authService.getUserFromToken as jest.Mock).mockReturnValue({
        id: 1,
        email: 'test@example.com',
        tier: 'free',
      })

      renderHook(() => useAuth(), { wrapper })

      expect(authService.isAuthenticated).toHaveBeenCalled()
      expect(authService.getUserFromToken).toHaveBeenCalled()
    })
  })

  describe('Login', () => {
    it('should handle successful login', async () => {
      mockLogin.mockResolvedValue({ data: mockAuthResponse })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.login('test@example.com', 'password123')
      })

      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    it('should store tokens on successful login', async () => {
      mockLogin.mockResolvedValue({ data: mockAuthResponse })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.login('test@example.com', 'password123')
      })

      expect(authService.setToken).toHaveBeenCalledWith(mockAuthResponse.token)
      expect(authService.setRefreshToken).toHaveBeenCalledWith(mockAuthResponse.refreshToken)
    })

    it('should handle login error', async () => {
      const error = { status: 401, data: { message: 'Invalid credentials' } }
      mockLogin.mockResolvedValue({ error })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        const loginResult = await result.current.login('test@example.com', 'wrong')
        expect(loginResult.error).toBeDefined()
      })

      expect(authService.setToken).not.toHaveBeenCalled()
    })
  })

  describe('Register', () => {
    it('should handle successful registration', async () => {
      mockRegister.mockResolvedValue({ data: mockAuthResponse })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.register({
          email: 'new@example.com',
          username: 'newuser',
          password: 'password123',
        })
      })

      expect(mockRegister).toHaveBeenCalledWith({
        email: 'new@example.com',
        username: 'newuser',
        password: 'password123',
      })
    })

    it('should auto-login after successful registration', async () => {
      mockRegister.mockResolvedValue({ data: mockAuthResponse })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.register({
          email: 'new@example.com',
          username: 'newuser',
          password: 'password123',
        })
      })

      expect(authService.setToken).toHaveBeenCalledWith(mockAuthResponse.token)
      expect(authService.setRefreshToken).toHaveBeenCalledWith(mockAuthResponse.refreshToken)
    })

    it('should handle registration error (duplicate email)', async () => {
      const error = { status: 400, data: { message: 'Email already exists' } }
      mockRegister.mockResolvedValue({ error })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        const registerResult = await result.current.register({
          email: 'existing@example.com',
          username: 'user',
          password: 'password123',
        })
        expect(registerResult.error).toBeDefined()
      })
    })
  })

  describe('Logout', () => {
    it('should handle logout', async () => {
      mockLogout.mockResolvedValue({ data: { ok: true } })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.logout()
      })

      expect(mockLogout).toHaveBeenCalled()
      expect(authService.clearTokens).toHaveBeenCalled()
    })

    it('should clear tokens even if API call fails', async () => {
      mockLogout.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.logout()
      })

      expect(authService.clearTokens).toHaveBeenCalled()
    })
  })

  describe('Token Refresh', () => {
    it('should refresh token when needed', async () => {
      (authService.getToken as jest.Mock).mockReturnValue('old-token');
      (authService.needsRefresh as jest.Mock).mockReturnValue(true)
      mockRefreshToken.mockResolvedValue({
        data: { ok: true, token: 'new-token' },
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.checkAndRefreshToken()
      })

      expect(mockRefreshToken).toHaveBeenCalled()
      expect(authService.setToken).toHaveBeenCalledWith('new-token')
    })

    it('should not refresh if token is still valid', async () => {
      (authService.getToken as jest.Mock).mockReturnValue('valid-token');
      (authService.needsRefresh as jest.Mock).mockReturnValue(false)

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.checkAndRefreshToken()
      })

      expect(mockRefreshToken).not.toHaveBeenCalled()
    })

    it('should logout if refresh fails', async () => {
      (authService.getToken as jest.Mock).mockReturnValue('old-token');
      (authService.needsRefresh as jest.Mock).mockReturnValue(true)
      mockRefreshToken.mockResolvedValue({ error: { status: 401 } })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.checkAndRefreshToken()
      })

      expect(authService.clearTokens).toHaveBeenCalled()
    })
  })

  describe('Premium Status', () => {
    it('should return isPremium as true for premium users', () => {
      store.dispatch({
        type: 'auth/setUser',
        payload: { ...mockUser, subscription_tier: 'premium' },
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      expect(result.current.isPremium).toBe(true)
    })

    it('should return isPremium as false for free users', () => {
      store.dispatch({
        type: 'auth/setUser',
        payload: mockUser,
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      expect(result.current.isPremium).toBe(false)
    })
  })
})
