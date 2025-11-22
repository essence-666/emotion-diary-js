import { authService } from '../auth'
import { mockAuthResponse, mockUser } from '../../__tests__/utils/mock-data'

describe('Auth Service', () => {
  let getItemSpy: jest.SpyInstance
  let setItemSpy: jest.SpyInstance
  let removeItemSpy: jest.SpyInstance

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()

    // Create spies on localStorage methods
    getItemSpy = jest.spyOn(Storage.prototype, 'getItem')
    setItemSpy = jest.spyOn(Storage.prototype, 'setItem')
    removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem')

    // Clear localStorage
    localStorage.clear()
  })

  afterEach(() => {
    // Restore all spies
    getItemSpy.mockRestore()
    setItemSpy.mockRestore()
    removeItemSpy.mockRestore()
  })

  describe('Token Management', () => {
    it('should store auth token in localStorage', () => {
      authService.setToken('test-token')

      expect(setItemSpy).toHaveBeenCalledWith('auth_token', 'test-token')
    })

    it('should retrieve auth token from localStorage', () => {
      getItemSpy.mockReturnValue('stored-token')

      const token = authService.getToken()

      expect(getItemSpy).toHaveBeenCalledWith('auth_token')
      expect(token).toBe('stored-token')
    })

    it('should return null if no token is stored', () => {
      getItemSpy.mockReturnValue(null)

      const token = authService.getToken()

      expect(token).toBeNull()
    })

    it('should remove auth token from localStorage', () => {
      authService.removeToken()

      expect(removeItemSpy).toHaveBeenCalledWith('auth_token')
    })

    it('should store refresh token in localStorage', () => {
      authService.setRefreshToken('refresh-token')

      expect(setItemSpy).toHaveBeenCalledWith('refresh_token', 'refresh-token')
    })

    it('should retrieve refresh token from localStorage', () => {
      getItemSpy.mockReturnValue('stored-refresh-token')

      const refreshToken = authService.getRefreshToken()

      expect(getItemSpy).toHaveBeenCalledWith('refresh_token')
      expect(refreshToken).toBe('stored-refresh-token')
    })

    it('should clear all auth tokens', () => {
      authService.clearTokens()

      expect(removeItemSpy).toHaveBeenCalledWith('auth_token')
      expect(removeItemSpy).toHaveBeenCalledWith('refresh_token')
    })
  })

  describe('JWT Validation', () => {
    it('should decode JWT token payload', () => {
      // JWT format: header.payload.signature
      // This is a mock JWT with payload: {"sub":1,"email":"test@example.com","tier":"free","iat":1640000000}
      const mockJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInRpZXIiOiJmcmVlIiwiaWF0IjoxNjQwMDAwMDAwfQ.signature'

      const decoded = authService.decodeToken(mockJWT)

      expect(decoded).toEqual({
        sub: 1,
        email: 'test@example.com',
        tier: 'free',
        iat: 1640000000,
      })
    })

    it('should return null for invalid JWT token', () => {
      const invalidToken = 'invalid-token'

      const decoded = authService.decodeToken(invalidToken)

      expect(decoded).toBeNull()
    })

    it('should check if token is expired', () => {
      // Token expired in the past (timestamp: 1640000000 = Dec 20, 2021)
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInRpZXIiOiJmcmVlIiwiaWF0IjoxNjQwMDAwMDAwLCJleHAiOjE2NDAwMDM2MDB9.signature'

      const isExpired = authService.isTokenExpired(expiredToken)

      expect(isExpired).toBe(true)
    })

    it('should check if token is not expired', () => {
      // Token expires in the future
      const futureTimestamp = Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
      const validToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({
        sub: 1,
        email: 'test@example.com',
        tier: 'free',
        iat: Math.floor(Date.now() / 1000),
        exp: futureTimestamp,
      }))}.signature`

      const isExpired = authService.isTokenExpired(validToken)

      expect(isExpired).toBe(false)
    })

    it('should return true if token has no expiration', () => {
      const tokenWithoutExp = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInRpZXIiOiJmcmVlIiwiaWF0IjoxNjQwMDAwMDAwfQ.signature'

      const isExpired = authService.isTokenExpired(tokenWithoutExp)

      expect(isExpired).toBe(true) // Treat as expired if no exp claim
    })
  })

  describe('Token Refresh Logic', () => {
    it('should determine if token needs refresh (within 5 minutes of expiry)', () => {
      // Token expires in 4 minutes
      const futureTimestamp = Math.floor(Date.now() / 1000) + 240 // 4 minutes from now
      const tokenNearExpiry = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({
        sub: 1,
        email: 'test@example.com',
        tier: 'free',
        iat: Math.floor(Date.now() / 1000),
        exp: futureTimestamp,
      }))}.signature`

      const needsRefresh = authService.needsRefresh(tokenNearExpiry)

      expect(needsRefresh).toBe(true)
    })

    it('should not need refresh if token has more than 5 minutes until expiry', () => {
      // Token expires in 10 minutes
      const futureTimestamp = Math.floor(Date.now() / 1000) + 600 // 10 minutes from now
      const validToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({
        sub: 1,
        email: 'test@example.com',
        tier: 'free',
        iat: Math.floor(Date.now() / 1000),
        exp: futureTimestamp,
      }))}.signature`

      const needsRefresh = authService.needsRefresh(validToken)

      expect(needsRefresh).toBe(false)
    })
  })

  describe('Auth State Helpers', () => {
    it('should check if user is authenticated', () => {
      // Create a valid JWT token that expires in the future
      const futureTimestamp = Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
      const validToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({
        sub: 1,
        email: 'test@example.com',
        tier: 'free',
        iat: Math.floor(Date.now() / 1000),
        exp: futureTimestamp,
      }))}.signature`
      getItemSpy.mockReturnValue(validToken)

      const isAuthenticated = authService.isAuthenticated()

      expect(isAuthenticated).toBe(true)
    })

    it('should return false if no token exists', () => {
      getItemSpy.mockReturnValue(null)

      const isAuthenticated = authService.isAuthenticated()

      expect(isAuthenticated).toBe(false)
    })

    it('should get user data from stored token', () => {
      const mockJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInRpZXIiOiJmcmVlIiwiaWF0IjoxNjQwMDAwMDAwfQ.signature'
      getItemSpy.mockReturnValue(mockJWT)

      const userData = authService.getUserFromToken()

      expect(userData).toEqual({
        id: 1,
        email: 'test@example.com',
        tier: 'free',
      })
    })

    it('should return null if no token exists when getting user data', () => {
      getItemSpy.mockReturnValue(null)

      const userData = authService.getUserFromToken()

      expect(userData).toBeNull()
    })
  })
})
