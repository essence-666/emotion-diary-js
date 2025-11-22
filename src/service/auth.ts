// ============================================================================
// Authentication Service - Token Management & JWT Handling
// ============================================================================

const TOKEN_KEY = 'auth_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const REFRESH_THRESHOLD = 5 * 60 // 5 minutes in seconds

// ============================================================================
// Token Storage Functions
// ============================================================================

/**
 * Store authentication token in localStorage
 */
const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token)
}

/**
 * Retrieve authentication token from localStorage
 */
const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * Remove authentication token from localStorage
 */
const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY)
}

/**
 * Store refresh token in localStorage
 */
const setRefreshToken = (token: string): void => {
  localStorage.setItem(REFRESH_TOKEN_KEY, token)
}

/**
 * Retrieve refresh token from localStorage
 */
const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

/**
 * Clear all authentication tokens
 */
const clearTokens = (): void => {
  removeToken()
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

// ============================================================================
// JWT Decoding & Validation
// ============================================================================

/**
 * Decode JWT token payload (without verification)
 * Returns null if token is invalid
 */
const decodeToken = (token: string): any | null => {
  try {
    // JWT format: header.payload.signature
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    // Decode base64 payload
    const payload = parts[1]
    const decoded = atob(payload)
    return JSON.parse(decoded)
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}

/**
 * Check if JWT token is expired
 * Returns true if expired or invalid
 */
const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token)

  if (!decoded || !decoded.exp) {
    return true // Treat as expired if no expiration claim
  }

  const currentTime = Math.floor(Date.now() / 1000)
  return decoded.exp < currentTime
}

/**
 * Check if token needs to be refreshed
 * Returns true if token expires within REFRESH_THRESHOLD
 */
const needsRefresh = (token: string): boolean => {
  const decoded = decodeToken(token)

  if (!decoded || !decoded.exp) {
    return true
  }

  const currentTime = Math.floor(Date.now() / 1000)
  const timeUntilExpiry = decoded.exp - currentTime

  return timeUntilExpiry < REFRESH_THRESHOLD
}

// ============================================================================
// Auth State Helpers
// ============================================================================

/**
 * Check if user is authenticated (has valid token)
 */
const isAuthenticated = (): boolean => {
  const token = getToken()
  return token !== null && !isTokenExpired(token)
}

/**
 * Get user data from stored JWT token
 * Returns null if no token or invalid
 */
const getUserFromToken = (): { id: number; email: string; tier: string } | null => {
  const token = getToken()

  if (!token) {
    return null
  }

  const decoded = decodeToken(token)

  if (!decoded) {
    return null
  }

  return {
    id: decoded.sub,
    email: decoded.email,
    tier: decoded.tier,
  }
}

// ============================================================================
// Export Auth Service
// ============================================================================

export const authService = {
  // Token storage
  setToken,
  getToken,
  removeToken,
  setRefreshToken,
  getRefreshToken,
  clearTokens,

  // JWT operations
  decodeToken,
  isTokenExpired,
  needsRefresh,

  // Auth state
  isAuthenticated,
  getUserFromToken,
}
