import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { AccountSettings } from '../AccountSettings'
import { api } from '../../../__data__/api'

// Mock the useAuth hook
const mockLogout = jest.fn()
jest.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 1,
      email: 'test@example.com',
      username: 'testuser',
      subscription_tier: 'free',
    },
    logout: mockLogout,
  }),
}))

const createMockStore = () => {
  return configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware),
  })
}

describe('AccountSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders account information', () => {
    const store = createMockStore()
    render(
      <Provider store={store}>
        <AccountSettings />
      </Provider>
    )

    expect(screen.getByTestId('account-info')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
    expect(screen.getByText('testuser')).toBeInTheDocument()
  })

  test('displays username edit button', () => {
    const store = createMockStore()
    render(
      <Provider store={store}>
        <AccountSettings />
      </Provider>
    )

    expect(screen.getByTestId('edit-username-button')).toBeInTheDocument()
  })

  test('shows username edit form when edit button clicked', () => {
    const store = createMockStore()
    render(
      <Provider store={store}>
        <AccountSettings />
      </Provider>
    )

    const editButton = screen.getByTestId('edit-username-button')
    fireEvent.click(editButton)

    expect(screen.getByTestId('username-edit-form')).toBeInTheDocument()
    expect(screen.getByTestId('username-input')).toBeInTheDocument()
  })

  test('shows password change section', () => {
    const store = createMockStore()
    render(
      <Provider store={store}>
        <AccountSettings />
      </Provider>
    )

    expect(screen.getByTestId('password-change-section')).toBeInTheDocument()
  })

  test('password change form has required fields', () => {
    const store = createMockStore()
    render(
      <Provider store={store}>
        <AccountSettings />
      </Provider>
    )

    expect(screen.getByTestId('current-password-input')).toBeInTheDocument()
    expect(screen.getByTestId('new-password-input')).toBeInTheDocument()
    expect(screen.getByTestId('confirm-password-input')).toBeInTheDocument()
  })

  test('shows account deletion section in danger zone', () => {
    const store = createMockStore()
    render(
      <Provider store={store}>
        <AccountSettings />
      </Provider>
    )

    expect(screen.getByTestId('danger-zone')).toBeInTheDocument()
    expect(screen.getByTestId('delete-account-button')).toBeInTheDocument()
  })

  test('opens delete confirmation modal when delete button clicked', () => {
    const store = createMockStore()
    render(
      <Provider store={store}>
        <AccountSettings />
      </Provider>
    )

    const deleteButton = screen.getByTestId('delete-account-button')
    fireEvent.click(deleteButton)

    expect(screen.getByTestId('delete-confirmation-modal')).toBeInTheDocument()
  })

  test('logout button calls logout function', () => {
    const store = createMockStore()
    render(
      <Provider store={store}>
        <AccountSettings />
      </Provider>
    )

    const logoutButton = screen.getByTestId('logout-button')
    fireEvent.click(logoutButton)

    expect(mockLogout).toHaveBeenCalled()
  })
})
