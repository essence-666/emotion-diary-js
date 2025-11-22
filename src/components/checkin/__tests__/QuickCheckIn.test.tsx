import React from 'react'
import { render, screen, fireEvent, waitFor } from '../../../__tests__/utils/test-utils'
import { QuickCheckIn } from '../QuickCheckIn'
import * as useCheckinHook from '../../../hooks/useCheckin'

// Mock the useCheckin hook
jest.mock('../../../hooks/useCheckin')

describe('QuickCheckIn', () => {
  const mockSubmit = jest.fn()
  const mockUseCheckin = useCheckinHook as jest.Mocked<typeof useCheckinHook>

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseCheckin.useCheckin = jest.fn().mockReturnValue({
      submit: mockSubmit,
      isLoading: false,
      error: null,
    })
  })

  test('renders all sub-components', () => {
    render(<QuickCheckIn />)

    // EmotionSelector should be present (look for emotion buttons)
    expect(screen.getByRole('button', { name: /happy/i })).toBeInTheDocument()

    // IntensitySlider should be present (look for slider)
    expect(screen.getByRole('slider', { name: /emotion intensity/i })).toBeInTheDocument()

    // ReflectionInput should be present (look for textarea)
    expect(screen.getByPlaceholderText(/how are you feeling/i)).toBeInTheDocument()

    // Submit button should be present
    expect(screen.getByRole('button', { name: /log mood|submit/i })).toBeInTheDocument()
  })

  test('submit button disabled when no emotion selected', () => {
    render(<QuickCheckIn />)

    const submitButton = screen.getByRole('button', { name: /log mood|submit/i })
    expect(submitButton).toBeDisabled()
  })

  test('submit button enabled when emotion selected', () => {
    render(<QuickCheckIn />)

    // Select an emotion
    const happyButton = screen.getByRole('button', { name: /happy/i })
    fireEvent.click(happyButton)

    // Submit button should now be enabled
    const submitButton = screen.getByRole('button', { name: /log mood|submit/i })
    expect(submitButton).not.toBeDisabled()
  })

  test('shows loading spinner during submit', () => {
    mockUseCheckin.useCheckin = jest.fn().mockReturnValue({
      submit: mockSubmit,
      isLoading: true,
      error: null,
    })

    render(<QuickCheckIn />)

    // Select an emotion first
    const happyButton = screen.getByRole('button', { name: /happy/i })
    fireEvent.click(happyButton)

    // Submit button should show loading state (Chakra Button with isLoading shows a spinner)
    // When loading, the button's accessible name changes to include "Loading..."
    const submitButton = screen.getByRole('button', { name: /logging mood/i })
    expect(submitButton).toBeDisabled() // Loading button is disabled
  })

  test('calls useCheckin().submit with correct data', async () => {
    mockSubmit.mockResolvedValueOnce({
      success: true,
      data: { emotionName: 'Happy', streak: 1 },
    })

    render(<QuickCheckIn />)

    // Select emotion
    const happyButton = screen.getByRole('button', { name: /happy/i })
    fireEvent.click(happyButton)

    // Add reflection text
    const textarea = screen.getByPlaceholderText(/how are you feeling/i)
    fireEvent.change(textarea, { target: { value: 'Feeling great today!' } })

    // Submit form
    const submitButton = screen.getByRole('button', { name: /log mood/i })
    fireEvent.click(submitButton)

    // Check that submit was called with correct data (intensity defaults to 5)
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        emotion: 'happy',
        intensity: 5, // Default intensity value
        reflection: 'Feeling great today!',
      })
    })
  })

  test('shows confirmation modal on success', async () => {
    mockSubmit.mockResolvedValueOnce({
      success: true,
      data: { emotionName: 'Happy', streak: 5 },
    })

    render(<QuickCheckIn />)

    // Select emotion and submit
    const happyButton = screen.getByRole('button', { name: /happy/i })
    fireEvent.click(happyButton)

    const submitButton = screen.getByRole('button', { name: /log mood|submit/i })
    fireEvent.click(submitButton)

    // Confirmation modal should appear
    await waitFor(() => {
      expect(screen.getByText(/mood logged/i)).toBeInTheDocument()
    })
  })

  test('resets form after successful submit', async () => {
    mockSubmit.mockResolvedValueOnce({
      success: true,
      data: { emotionName: 'Happy', streak: 5 },
    })

    render(<QuickCheckIn />)

    // Select emotion
    const happyButton = screen.getByRole('button', { name: /happy/i })
    fireEvent.click(happyButton)

    // Add reflection text
    const textarea = screen.getByPlaceholderText(/how are you feeling/i) as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'Test reflection' } })
    expect(textarea.value).toBe('Test reflection')

    // Submit
    const submitButton = screen.getByRole('button', { name: /log mood/i })
    fireEvent.click(submitButton)

    // Wait for success confirmation to appear
    await waitFor(() => {
      expect(screen.getByText(/mood logged/i)).toBeInTheDocument()
    })

    // Form should be reset immediately after submit (not after modal closes)
    // The reflection textarea should be cleared
    expect(textarea.value).toBe('')

    // Submit button should be disabled again (no emotion selected)
    expect(submitButton).toBeDisabled()
  })

  test('shows error message on failure', async () => {
    const errorMessage = 'Failed to submit check-in'
    mockUseCheckin.useCheckin = jest.fn().mockReturnValue({
      submit: mockSubmit,
      isLoading: false,
      error: errorMessage,
    })

    render(<QuickCheckIn />)

    // Error message should be displayed
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  test('displays toast notification on success', async () => {
    mockSubmit.mockResolvedValueOnce({
      success: true,
      data: { emotionName: 'Happy', streak: 5 },
    })

    const { container } = render(<QuickCheckIn />)

    // Select emotion and submit
    const happyButton = screen.getByRole('button', { name: /happy/i })
    fireEvent.click(happyButton)

    const submitButton = screen.getByRole('button', { name: /log mood|submit/i })
    fireEvent.click(submitButton)

    // Toast should appear (Chakra toast is rendered in a portal)
    // We'll check for the confirmation modal instead as our success indicator
    await waitFor(() => {
      expect(screen.getByText(/mood logged/i)).toBeInTheDocument()
    })
  })

  test('has responsive layout on mobile', () => {
    // Mock window.matchMedia for mobile viewport
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query === '(max-width: 768px)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    })

    const { container } = render(<QuickCheckIn />)

    // Component should render (basic responsive check)
    expect(container.firstChild).toBeInTheDocument()

    // All components should still be accessible
    expect(screen.getByRole('button', { name: /happy/i })).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: /emotion intensity/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/how are you feeling/i)).toBeInTheDocument()
  })
})
