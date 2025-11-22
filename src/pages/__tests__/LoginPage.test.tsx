import React from 'react'
import { render, screen } from '../../__tests__/utils/test-utils'
import { LoginPage } from '../LoginPage'

jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    login: jest.fn(),
    isLoading: false,
    error: null,
  }),
}))

describe('LoginPage Component', () => {
  describe('Rendering', () => {
    it('should render the page title', () => {
      render(<LoginPage />)

      expect(screen.getByText(/emotion diary/i)).toBeInTheDocument()
    })

    it('should render the LoginForm component', () => {
      render(<LoginPage />)

      // Check for email and password inputs from LoginForm
      expect(document.querySelector('[data-qa-type="login-email-input"]')).toBeInTheDocument()
      expect(document.querySelector('[data-qa-type="login-password-input"]')).toBeInTheDocument()
    })

    it('should have a gradient background', () => {
      render(<LoginPage />)

      const container = document.querySelector('[data-qa-type="login-page-container"]')
      expect(container).toBeInTheDocument()
      expect(container).toHaveStyle({
        minHeight: '100vh',
      })
    })
  })

  describe('Layout', () => {
    it('should center the login form', () => {
      render(<LoginPage />)

      const container = document.querySelector('[data-qa-type="login-page-container"]')
      expect(container).toHaveStyle({
        display: 'flex',
      })
    })

    it('should have a card/box container for the form', () => {
      render(<LoginPage />)

      const card = document.querySelector('[data-qa-type="login-card"]')
      expect(card).toBeInTheDocument()
    })
  })

  describe('Branding', () => {
    it('should display app logo/title prominently', () => {
      render(<LoginPage />)

      const title = screen.getByText(/emotion diary/i)
      expect(title).toBeInTheDocument()
      // Title should be in a heading element
      expect(title.tagName).toBe('H1')
    })
  })
})
