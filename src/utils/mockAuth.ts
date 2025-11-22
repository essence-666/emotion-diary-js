// ============================================================================
// Mock Authentication for Development
// ============================================================================
// Enable with: localStorage.setItem('MOCK_AUTH_ENABLED', 'true')
// Toggle tier: localStorage.setItem('MOCK_USER_TIER', 'premium') or 'free'

import type { User, AuthResponse } from '../types'

const MOCK_AUTH_KEY = 'MOCK_AUTH_ENABLED'
const MOCK_TIER_KEY = 'MOCK_USER_TIER'

/**
 * Check if mock auth is enabled
 */
export const isMockAuthEnabled = (): boolean => {
  return localStorage.getItem(MOCK_AUTH_KEY) === 'true' || process.env.NODE_ENV === 'development'
}

/**
 * Get current mock user tier
 */
export const getMockUserTier = (): 'free' | 'premium' => {
  const tier = localStorage.getItem(MOCK_TIER_KEY)
  return tier === 'premium' ? 'premium' : 'free'
}

/**
 * Toggle mock user tier
 */
export const toggleMockUserTier = (): 'free' | 'premium' => {
  const currentTier = getMockUserTier()
  const newTier = currentTier === 'free' ? 'premium' : 'free'
  localStorage.setItem(MOCK_TIER_KEY, newTier)
  return newTier
}

/**
 * Generate mock JWT token
 */
export const generateMockToken = (tier: 'free' | 'premium' = 'free'): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa(JSON.stringify({
    sub: 1,
    email: 'dev@example.com',
    tier,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
  }))
  return `${header}.${payload}.mock-signature`
}

/**
 * Mock user data
 */
export const getMockUser = (tier?: 'free' | 'premium'): User => {
  const userTier = tier || getMockUserTier()
  return {
    id: 1,
    email: 'dev@example.com',
    username: 'Developer',
    subscription_tier: userTier,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

/**
 * Mock auth response
 */
export const getMockAuthResponse = (tier?: 'free' | 'premium'): AuthResponse => {
  const userTier = tier || getMockUserTier()
  return {
    token: generateMockToken(userTier),
    refreshToken: generateMockToken(userTier),
    user: getMockUser(userTier),
  }
}

/**
 * Enable mock auth (call this in development)
 */
export const enableMockAuth = () => {
  localStorage.setItem(MOCK_AUTH_KEY, 'true')
  console.log('🔓 Mock auth enabled')
}

/**
 * Disable mock auth
 */
export const disableMockAuth = () => {
  localStorage.removeItem(MOCK_AUTH_KEY)
  localStorage.removeItem(MOCK_TIER_KEY)
  console.log('🔒 Mock auth disabled')
}

/**
 * Development helper: Log current mock auth status
 */
export const logMockAuthStatus = () => {
  const enabled = isMockAuthEnabled()
  const tier = getMockUserTier()
  console.log(`🔐 Mock Auth: ${enabled ? 'ENABLED' : 'DISABLED'}`)
  if (enabled) {
    console.log(`👤 Mock User Tier: ${tier}`)
    console.log(`📧 Email: dev@example.com`)
    console.log(`\nTo toggle tier: toggleMockUserTier()`)
    console.log(`To disable: disableMockAuth()`)
  } else {
    console.log(`\nTo enable: enableMockAuth()`)
  }
}

// Auto-enable in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Only enable if not explicitly disabled
  if (localStorage.getItem(MOCK_AUTH_KEY) !== 'false') {
    enableMockAuth()
  }
}

// Make utilities available in console for development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  (window as any).mockAuth = {
    enable: enableMockAuth,
    disable: disableMockAuth,
    toggleTier: toggleMockUserTier,
    status: logMockAuthStatus,
  }
  console.log('🛠️  Mock auth utilities available: window.mockAuth')
}
