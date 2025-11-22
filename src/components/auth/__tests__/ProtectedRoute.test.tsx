import React from 'react'
import { render, screen } from '../../../__tests__/utils/test-utils'
import { ProtectedRoute } from '../ProtectedRoute'
import { Route, Routes } from 'react-router-dom'

const mockUseAuth = jest.fn()

jest.mock('../../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

const TestComponent = () => <div>Protected Content</div>

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Authentication Check', () => {
    it('should render children when user is authenticated', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isPremium: false,
        user: { id: 1, email: 'test@example.com', subscription_tier: 'free' },
      })

      render(
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <TestComponent />
              </ProtectedRoute>
            }
          />
        </Routes>
      )

      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    it('should redirect to login when user is not authenticated', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isPremium: false,
        user: null,
      })

      render(
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <TestComponent />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      )

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
      expect(screen.getByText('Login Page')).toBeInTheDocument()
    })
  })

  describe('Premium Tier Check', () => {
    it('should render children when premium is not required', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isPremium: false,
        user: { id: 1, email: 'test@example.com', subscription_tier: 'free' },
      })

      render(
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <TestComponent />
              </ProtectedRoute>
            }
          />
        </Routes>
      )

      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    it('should render children when user is premium and premium is required', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isPremium: true,
        user: { id: 1, email: 'test@example.com', subscription_tier: 'premium' },
      })

      render(
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute requirePremium>
                <TestComponent />
              </ProtectedRoute>
            }
          />
        </Routes>
      )

      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    it('should show upgrade prompt when premium is required but user is free', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isPremium: false,
        user: { id: 1, email: 'test@example.com', subscription_tier: 'free' },
      })

      render(
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute requirePremium>
                <TestComponent />
              </ProtectedRoute>
            }
          />
        </Routes>
      )

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
      expect(screen.getByText(/upgrade to premium/i)).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('should show loading indicator while checking authentication', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isPremium: false,
        user: null,
        isLoading: true,
      })

      render(
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <TestComponent />
              </ProtectedRoute>
            }
          />
        </Routes>
      )

      // Check for loading spinner (Chakra renders multiple "Loading..." texts)
      const loadingElements = screen.getAllByText(/loading/i)
      expect(loadingElements.length).toBeGreaterThan(0)
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })
  })
})
