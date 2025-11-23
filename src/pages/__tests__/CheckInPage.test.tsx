import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import CheckInPage from '../CheckInPage'
import { api } from '../../__data__/api'

// Mock QuickCheckIn component
jest.mock('../../components/checkin/QuickCheckIn', () => ({
  QuickCheckIn: () => <div data-testid="quick-checkin">Quick Check-In Component</div>,
}))

const mockUseMediaQuery = jest.fn()
jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'),
  useMediaQuery: (query: string) => mockUseMediaQuery(query),
}))

// Helper to create store with mocked data
const createMockStore = (initialData: any = {}) => {
  return configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware),
    preloadedState: initialData,
  })
}

describe('CheckInPage', () => {
  beforeEach(() => {
    // Default to desktop
    mockUseMediaQuery.mockReturnValue([false])
    jest.clearAllMocks()
  })

  test('renders page layout with title', () => {
    const store = createMockStore()
    render(
      <Provider store={store}>
        <CheckInPage />
      </Provider>
    )

    expect(screen.getByTestId('checkin-page')).toBeInTheDocument()
    expect(screen.getByTestId('checkin-page-title')).toBeInTheDocument()
    expect(screen.getByTestId('checkin-page-title')).toHaveTextContent('Mood Check-In')
  })

  test('displays QuickCheckIn component', () => {
    const store = createMockStore()
    render(
      <Provider store={store}>
        <CheckInPage />
      </Provider>
    )

    expect(screen.getByTestId('quick-checkin')).toBeInTheDocument()
  })

  test('displays streak info when stats are available', async () => {
    const store = createMockStore()
    render(
      <Provider store={store}>
        <CheckInPage />
      </Provider>
    )

    // Wait for streak info to appear
    await waitFor(() => {
      expect(screen.getByTestId('streak-info')).toBeInTheDocument()
    })
  })

  test('shows recent check-ins section', () => {
    const store = createMockStore()
    render(
      <Provider store={store}>
        <CheckInPage />
      </Provider>
    )

    expect(screen.getByTestId('recent-checkins-section')).toBeInTheDocument()
  })

  test('displays loading state while fetching check-ins', () => {
    const store = createMockStore()
    render(
      <Provider store={store}>
        <CheckInPage />
      </Provider>
    )

    // Loading spinner should appear initially
    expect(screen.getByTestId('checkins-loading')).toBeInTheDocument()
  })

  test('displays check-in list when data exists', async () => {
    const store = createMockStore()
    render(
      <Provider store={store}>
        <CheckInPage />
      </Provider>
    )

    // In development mode with mocks, we should see either empty state or checkins list
    await waitFor(() => {
      const emptyState = screen.queryByTestId('checkins-empty-state')
      const checkinsList = screen.queryByTestId('checkins-list')
      expect(emptyState || checkinsList).toBeTruthy()
    })
  })

  test('renders mobile layout on small screens', () => {
    mockUseMediaQuery.mockReturnValue([true])
    const store = createMockStore()
    render(
      <Provider store={store}>
        <CheckInPage />
      </Provider>
    )

    expect(screen.getByTestId('checkin-mobile-layout')).toBeInTheDocument()
  })

  test('renders desktop layout on large screens', () => {
    mockUseMediaQuery.mockReturnValue([false])
    const store = createMockStore()
    render(
      <Provider store={store}>
        <CheckInPage />
      </Provider>
    )

    expect(screen.getByTestId('checkin-desktop-layout')).toBeInTheDocument()
  })

  test('displays statistics section with streak info', async () => {
    const store = createMockStore()
    render(
      <Provider store={store}>
        <CheckInPage />
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('statistics-section')).toBeInTheDocument()
    })
  })
})
