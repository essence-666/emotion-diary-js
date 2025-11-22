import React from 'react'
import { render, screen, fireEvent, waitFor } from '../../../__tests__/utils/test-utils'
import { LoginForm } from '../LoginForm'

const mockLogin = jest.fn()

jest.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    login: mockLogin,
    isLoading: false,
    error: null,
  }),
}))

describe('LoginForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render email and password inputs', () => {
      render(<LoginForm />)

      expect(document.querySelector('[data-qa-type="login-email-input"]')).toBeInTheDocument()
      expect(document.querySelector('[data-qa-type="login-password-input"]')).toBeInTheDocument()
    })

    it('should render submit button', () => {
      render(<LoginForm />)

      expect(document.querySelector('[data-qa-type="login-submit-button"]')).toBeInTheDocument()
    })

    it('should render link to sign up', () => {
      render(<LoginForm />)

      expect(document.querySelector('[data-qa-type="login-signup-link"]')).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should validate email format', async () => {
      render(<LoginForm />)

      const emailInput = document.querySelector('[data-qa-type="login-email-input"]') as HTMLInputElement
      const submitButton = document.querySelector('[data-qa-type="login-submit-button"]') as HTMLButtonElement

      fireEvent.change(emailInput, { target: { value: 'invalidemail' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
      })

      expect(mockLogin).not.toHaveBeenCalled()
    })

    it('should require password with minimum 8 characters', async () => {
      render(<LoginForm />)

      const emailInput = document.querySelector('[data-qa-type="login-email-input"]') as HTMLInputElement
      const passwordInput = document.querySelector('[data-qa-type="login-password-input"]') as HTMLInputElement
      const submitButton = document.querySelector('[data-qa-type="login-submit-button"]') as HTMLButtonElement

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'short' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
      })

      expect(mockLogin).not.toHaveBeenCalled()
    })

    it('should require both email and password', async () => {
      render(<LoginForm />)

      const submitButton = document.querySelector('[data-qa-type="login-submit-button"]') as HTMLButtonElement

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument()
        expect(screen.getByText(/password is required/i)).toBeInTheDocument()
      })

      expect(mockLogin).not.toHaveBeenCalled()
    })
  })

  describe('Form Submission', () => {
    it('should call login with correct credentials', async () => {
      mockLogin.mockResolvedValue({ success: true })

      render(<LoginForm />)

      const emailInput = document.querySelector('[data-qa-type="login-email-input"]') as HTMLInputElement
      const passwordInput = document.querySelector('[data-qa-type="login-password-input"]') as HTMLInputElement
      const submitButton = document.querySelector('[data-qa-type="login-submit-button"]') as HTMLButtonElement

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
      })
    })

    it('should display error message on login failure', async () => {
      mockLogin.mockResolvedValue({ error: { data: { message: 'Invalid credentials' } } })

      render(<LoginForm />)

      const emailInput = document.querySelector('[data-qa-type="login-email-input"]') as HTMLInputElement
      const passwordInput = document.querySelector('[data-qa-type="login-password-input"]') as HTMLInputElement
      const submitButton = document.querySelector('[data-qa-type="login-submit-button"]') as HTMLButtonElement

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
      })
    })

    it('should clear form after successful login', async () => {
      mockLogin.mockResolvedValue({ success: true })

      render(<LoginForm />)

      const emailInput = document.querySelector('[data-qa-type="login-email-input"]') as HTMLInputElement
      const passwordInput = document.querySelector('[data-qa-type="login-password-input"]') as HTMLInputElement
      const submitButton = document.querySelector('[data-qa-type="login-submit-button"]') as HTMLButtonElement

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })

      expect(emailInput.value).toBe('test@example.com')
      expect(passwordInput.value).toBe('password123')

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
      })

      await waitFor(() => {
        expect(emailInput.value).toBe('')
        expect(passwordInput.value).toBe('')
      })
    })
  })

  describe('Password Visibility Toggle', () => {
    it('should toggle password visibility', () => {
      render(<LoginForm />)

      const passwordInput = document.querySelector('[data-qa-type="login-password-input"]') as HTMLInputElement
      const toggleButton = document.querySelector('[data-qa-type="login-password-toggle"]') as HTMLButtonElement

      expect(passwordInput).toHaveAttribute('type', 'password')

      fireEvent.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'text')

      fireEvent.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'password')
    })
  })
})
