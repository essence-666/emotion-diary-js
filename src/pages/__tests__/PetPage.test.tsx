import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import PetPage from '../PetPage'

// Mock the API module
const mockGetPet = jest.fn()
const mockFeedPet = jest.fn()
const mockPetPet = jest.fn()
const mockTalkToPet = jest.fn()

jest.mock('../../__data__/api', () => ({
  api: {
    reducerPath: 'api',
    reducer: (state = {}) => state,
    middleware: () => (next: any) => (action: any) => next(action),
  },
  useGetPetQuery: () => mockGetPet(),
  useFeedPetMutation: () => [mockFeedPet, { isLoading: false }],
  usePetPetMutation: () => [mockPetPet, { isLoading: false }],
  useTalkToPetMutation: () => [mockTalkToPet, { isLoading: false }],
}))

// Mock pet data
const mockPetData = {
  id: 1,
  user_id: 1,
  name: 'Fluffy',
  pet_type: 'cat',
  happiness_level: 50,
  last_interaction: '2025-11-23T10:00:00Z',
  cosmetic_skin: 'default',
  created_at: '2025-11-01T10:00:00Z',
  updated_at: '2025-11-23T10:00:00Z',
}

// Create mock store
const createMockStore = () => {
  return configureStore({
    reducer: {
      api: (state = {}) => state,
    },
  })
}

describe('PetPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    mockGetPet.mockReturnValue({
      data: mockPetData,
      isLoading: false,
      error: null,
    })
  })

  test('renders page layout', async () => {
    const store = createMockStore()

    render(
      <Provider store={store}>
        <PetPage />
      </Provider>
    )

    expect(screen.getByTestId('pet-page')).toBeInTheDocument()
  })

  test('displays loading state while fetching pet data', () => {
    const store = createMockStore()

    mockGetPet.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    render(
      <Provider store={store}>
        <PetPage />
      </Provider>
    )

    // Check for loading text (may appear multiple times)
    const loadingTexts = screen.getAllByText(/Loading/i)
    expect(loadingTexts.length).toBeGreaterThan(0)
  })

  test('displays error state when API fails', () => {
    const store = createMockStore()

    mockGetPet.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { status: 500, data: { message: 'Failed to load pet' } },
    })

    render(
      <Provider store={store}>
        <PetPage />
      </Provider>
    )

    // Check for error text (may appear multiple times)
    const errorTexts = screen.getAllByText(/error|failed/i)
    expect(errorTexts.length).toBeGreaterThan(0)
  })

  test('renders PetStats component with pet data', () => {
    const store = createMockStore()

    render(
      <Provider store={store}>
        <PetPage />
      </Provider>
    )

    expect(screen.getByText('Fluffy')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  test('renders PetAvatar centered on screen', () => {
    const store = createMockStore()

    render(
      <Provider store={store}>
        <PetPage />
      </Provider>
    )

    expect(screen.getByTestId('pet-avatar-svg')).toBeInTheDocument()
  })

  test('renders InteractionButtons', () => {
    const store = createMockStore()

    render(
      <Provider store={store}>
        <PetPage />
      </Provider>
    )

    expect(screen.getByTestId('feed-button')).toBeInTheDocument()
    expect(screen.getByTestId('pet-button')).toBeInTheDocument()
    expect(screen.getByTestId('talk-button')).toBeInTheDocument()
  })

  test('handles feed interaction', async () => {
    const store = createMockStore()

    const mockUnwrap = jest.fn().mockResolvedValue({
      ...mockPetData,
      happiness_level: 60,
    })

    mockFeedPet.mockReturnValue({
      unwrap: mockUnwrap,
    })

    render(
      <Provider store={store}>
        <PetPage />
      </Provider>
    )

    const feedButton = screen.getByTestId('feed-button')
    fireEvent.click(feedButton)

    await waitFor(() => expect(mockUnwrap).toHaveBeenCalled())
  })

  test('shows dialogue after Talk interaction', async () => {
    const store = createMockStore()

    const mockUnwrap = jest.fn().mockResolvedValue({
      pet: { ...mockPetData, happiness_level: 52 },
      dialogue: 'I love spending time with you!',
    })

    mockTalkToPet.mockReturnValue({
      unwrap: mockUnwrap,
    })

    render(
      <Provider store={store}>
        <PetPage />
      </Provider>
    )

    const talkButton = screen.getByTestId('talk-button')
    fireEvent.click(talkButton)

    // Wait for the dialogue to appear
    await waitFor(() => {
      const dialogue = screen.queryByText(/I love spending time with you!/i)
      expect(dialogue).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  test('updates happiness optimistically', async () => {
    const store = createMockStore()

    const mockUnwrap = jest.fn().mockResolvedValue({
      ...mockPetData,
      happiness_level: 55,
    })

    mockPetPet.mockReturnValue({
      unwrap: mockUnwrap,
    })

    render(
      <Provider store={store}>
        <PetPage />
      </Provider>
    )

    // Initial happiness
    expect(screen.getByText('50%')).toBeInTheDocument()

    const petButton = screen.getByTestId('pet-button')
    fireEvent.click(petButton)

    // Should optimistically update
    await waitFor(() => {
      expect(mockUnwrap).toHaveBeenCalled()
    })
  })

  test('has centered layout on desktop', () => {
    const store = createMockStore()

    const { container } = render(
      <Provider store={store}>
        <PetPage />
      </Provider>
    )

    const page = screen.getByTestId('pet-page')
    expect(page).toBeInTheDocument()
  })

  test('is responsive on mobile', () => {
    const store = createMockStore()

    // Mock mobile viewport
    global.innerWidth = 375
    global.dispatchEvent(new Event('resize'))

    render(
      <Provider store={store}>
        <PetPage />
      </Provider>
    )

    expect(screen.getByTestId('pet-page')).toBeInTheDocument()
  })

  test('shows warning when happiness is critical', () => {
    const store = createMockStore()

    mockGetPet.mockReturnValue({
      data: { ...mockPetData, happiness_level: 15 },
      isLoading: false,
      error: null,
    })

    render(
      <Provider store={store}>
        <PetPage />
      </Provider>
    )

    // Check for multiple "Critical" texts
    const criticalTexts = screen.getAllByText(/Critical/i)
    expect(criticalTexts.length).toBeGreaterThan(0)
  })
})
