import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import SettingsPage from '../SettingsPage'
import { api } from '../../__data__/api'

// Mock components
jest.mock('../../components/settings/AccountSettings', () => ({
  AccountSettings: () => <div data-testid="account-settings">Account Settings Component</div>,
}))

jest.mock('../../components/settings/NotificationSettings', () => ({
  NotificationSettings: () => <div data-testid="notification-settings">Notification Settings Component</div>,
}))

jest.mock('../../components/settings/SubscriptionSettings', () => ({
  SubscriptionSettings: () => <div data-testid="subscription-settings">Subscription Settings Component</div>,
}))

jest.mock('../../components/settings/AdvancedSettings', () => ({
  AdvancedSettings: () => <div data-testid="advanced-settings">Advanced Settings Component</div>,
}))

const mockUseMediaQuery = jest.fn()
jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'),
  useMediaQuery: (query: string) => mockUseMediaQuery(query),
}))

// Helper to create store
const createMockStore = () => {
  return configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware),
  })
}

describe('SettingsPage', () => {
  beforeEach(() => {
    // Default to desktop
    mockUseMediaQuery.mockReturnValue([false])
    jest.clearAllMocks()
  })

  test('renders page layout with title', () => {
    const store = createMockStore()
    render(
      <Provider store={store}>
        <SettingsPage />
      </Provider>
    )

    expect(screen.getByTestId('settings-page')).toBeInTheDocument()
    expect(screen.getByTestId('settings-page-title')).toBeInTheDocument()
    expect(screen.getByTestId('settings-page-title')).toHaveTextContent('Settings')
  })

  test('displays tabs on mobile', () => {
    mockUseMediaQuery.mockReturnValue([true])
    const store = createMockStore()
    render(
      <Provider store={store}>
        <SettingsPage />
      </Provider>
    )

    expect(screen.getByTestId('settings-mobile-tabs')).toBeInTheDocument()
  })

  test('displays side tabs on desktop', () => {
    mockUseMediaQuery.mockReturnValue([false])
    const store = createMockStore()
    render(
      <Provider store={store}>
        <SettingsPage />
      </Provider>
    )

    expect(screen.getByTestId('settings-desktop-tabs')).toBeInTheDocument()
  })

  test('displays all settings sections', async () => {
    const store = createMockStore()
    render(
      <Provider store={store}>
        <SettingsPage />
      </Provider>
    )

    await waitFor(() => {
      // All sections should be rendered (one visible at a time in tabs)
      expect(screen.getByTestId('account-settings')).toBeInTheDocument()
    })
  })

  test('has tab for Account settings', () => {
    const store = createMockStore()
    render(
      <Provider store={store}>
        <SettingsPage />
      </Provider>
    )

    expect(screen.getByTestId('tab-account')).toBeInTheDocument()
  })

  test('has tab for Notifications settings', () => {
    const store = createMockStore()
    render(
      <Provider store={store}>
        <SettingsPage />
      </Provider>
    )

    expect(screen.getByTestId('tab-notifications')).toBeInTheDocument()
  })

  test('has tab for Subscription settings', () => {
    const store = createMockStore()
    render(
      <Provider store={store}>
        <SettingsPage />
      </Provider>
    )

    expect(screen.getByTestId('tab-subscription')).toBeInTheDocument()
  })

  test('has tab for Advanced settings', () => {
    const store = createMockStore()
    render(
      <Provider store={store}>
        <SettingsPage />
      </Provider>
    )

    expect(screen.getByTestId('tab-advanced')).toBeInTheDocument()
  })

  test('mobile layout uses horizontal tabs', () => {
    mockUseMediaQuery.mockReturnValue([true])
    const store = createMockStore()
    render(
      <Provider store={store}>
        <SettingsPage />
      </Provider>
    )

    expect(screen.getByTestId('settings-mobile-tabs')).toBeInTheDocument()
  })

  test('desktop layout uses vertical tabs', () => {
    mockUseMediaQuery.mockReturnValue([false])
    const store = createMockStore()
    render(
      <Provider store={store}>
        <SettingsPage />
      </Provider>
    )

    expect(screen.getByTestId('settings-desktop-tabs')).toBeInTheDocument()
  })
})
