import React from 'react'
import { render, screen } from '../../__tests__/utils/test-utils'
import { RegisterPage } from '../RegisterPage'
import { useAuth } from '../../hooks/useAuth'
import { Navigate } from 'react-router-dom'

// Mock useAuth hook
jest.mock('../../hooks/useAuth')
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

// Mock Navigate component
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: jest.fn(() => null),
}))

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Default: not authenticated
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isPremium: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      checkAndRefreshToken: jest.fn(),
    })
  })

  test('renders register page with gradient background', () => {
    render(<RegisterPage />)

    // Should have a container with styling
    const container = screen.getByTestId('register-page-container')
    expect(container).toBeInTheDocument()
  })

  test('displays RegisterForm component', () => {
    render(<RegisterPage />)

    // RegisterForm should be present (we'll look for its elements)
    // For now, we expect a form element
    expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument()
  })

  test('shows logo or app title', () => {
    render(<RegisterPage />)

    // Should display app title
    expect(screen.getByText(/emotion diary/i)).toBeInTheDocument()
  })

  test('has link to login page', () => {
    render(<RegisterPage />)

    // Should have "Already have an account?" link
    const loginLink = screen.getByRole('link', { name: /sign in/i })
    expect(loginLink).toBeInTheDocument()
    expect(loginLink).toHaveAttribute('href', '/login')
  })

  test('redirects to pet page when already authenticated', () => {
    // Mock authenticated user
    mockUseAuth.mockReturnValue({
      user: {
        id: 1,
        email: 'test@example.com',
        username: 'Test User',
        subscription_tier: 'free',
        created_at: '2025-01-01',
        updated_at: '2025-01-01',
      },
      isAuthenticated: true,
      isLoading: false,
      error: null,
      isPremium: false,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      checkAndRefreshToken: jest.fn(),
    })

    render(<RegisterPage />)

    // Should redirect to pet page
    expect(Navigate).toHaveBeenCalledWith(
      expect.objectContaining({ to: '/pet' }),
      expect.anything()
    )
  })
})
