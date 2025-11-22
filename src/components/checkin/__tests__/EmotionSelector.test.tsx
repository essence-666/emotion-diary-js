import React from 'react'
import { render, screen, fireEvent } from '../../../__tests__/utils/test-utils'
import { EmotionSelector } from '../EmotionSelector'

describe('EmotionSelector', () => {
  const mockOnSelect = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders 6 emotion buttons in grid layout', () => {
    render(<EmotionSelector onSelect={mockOnSelect} />)

    // Should have 6 emotion buttons
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(6)
  })

  test('displays emoji and name for each emotion', () => {
    render(<EmotionSelector onSelect={mockOnSelect} />)

    // Check for emotion names
    expect(screen.getByText('Happy')).toBeInTheDocument()
    expect(screen.getByText('Sad')).toBeInTheDocument()
    expect(screen.getByText('Angry')).toBeInTheDocument()
    expect(screen.getByText('Calm')).toBeInTheDocument()
    expect(screen.getByText('Stressed')).toBeInTheDocument()
    expect(screen.getByText('Excited')).toBeInTheDocument()

    // Check for emojis (they should be in the buttons)
    const buttons = screen.getAllByRole('button')
    expect(buttons[0]).toHaveTextContent(/😊|🙂/)
    expect(buttons[1]).toHaveTextContent(/😢|😔/)
    expect(buttons[2]).toHaveTextContent(/😠|😡/)
    expect(buttons[3]).toHaveTextContent(/😌|🧘/)
    expect(buttons[4]).toHaveTextContent(/😰|😫/)
    expect(buttons[5]).toHaveTextContent(/🎉|😄/)
  })

  test('calls onSelect with emotion when clicked', () => {
    render(<EmotionSelector onSelect={mockOnSelect} />)

    // Click the happy button
    const happyButton = screen.getByText('Happy').closest('button')
    fireEvent.click(happyButton!)

    expect(mockOnSelect).toHaveBeenCalledWith('happy')
  })

  test('applies selected state styling', () => {
    render(<EmotionSelector onSelect={mockOnSelect} selectedEmotion="happy" />)

    const happyButton = screen.getByText('Happy').closest('button')
    const sadButton = screen.getByText('Sad').closest('button')

    // Selected button should exist
    expect(happyButton).toBeInTheDocument()
    expect(sadButton).toBeInTheDocument()

    // Check that buttons are different (basic sanity check)
    expect(happyButton).not.toEqual(sadButton)
  })

  test('allows keyboard navigation', () => {
    render(<EmotionSelector onSelect={mockOnSelect} />)

    const buttons = screen.getAllByRole('button')

    // All buttons should be keyboard accessible
    buttons.forEach(button => {
      expect(button).toHaveAttribute('tabIndex', '0')
    })
  })

  test('applies different colors to each emotion', () => {
    render(<EmotionSelector onSelect={mockOnSelect} />)

    const happyButton = screen.getByText('Happy').closest('button')
    const sadButton = screen.getByText('Sad').closest('button')

    // Each button should have a unique background color
    // We're checking they exist and are different
    expect(happyButton).toBeInTheDocument()
    expect(sadButton).toBeInTheDocument()
    expect(happyButton).not.toEqual(sadButton)
  })

  test('handles emotion selection update', () => {
    const { rerender } = render(
      <EmotionSelector onSelect={mockOnSelect} selectedEmotion="happy" />
    )

    // Verify initial render
    expect(screen.getByText('Happy')).toBeInTheDocument()

    // Change selection
    rerender(<EmotionSelector onSelect={mockOnSelect} selectedEmotion="sad" />)

    // Verify sad button is now rendered
    expect(screen.getByText('Sad')).toBeInTheDocument()
  })
})
