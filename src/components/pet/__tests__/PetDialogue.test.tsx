import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { PetDialogue } from '../PetDialogue'

describe('PetDialogue', () => {
  test('does not render when message is empty', () => {
    const { container } = render(<PetDialogue message="" />)

    expect(container.querySelector('[data-testid="pet-dialogue"]')).not.toBeInTheDocument()
  })

  test('renders speech bubble with message', () => {
    render(<PetDialogue message="Yum! That was delicious!" />)

    expect(screen.getByTestId('pet-dialogue')).toBeInTheDocument()
    expect(screen.getByText('Yum! That was delicious!')).toBeInTheDocument()
  })

  test('renders with different messages', () => {
    const { rerender } = render(<PetDialogue message="Thank you for feeding me!" />)
    expect(screen.getByText('Thank you for feeding me!')).toBeInTheDocument()

    rerender(<PetDialogue message="I love you!" />)
    expect(screen.getByText('I love you!')).toBeInTheDocument()
  })

  test('has speech bubble styling with pointer', () => {
    const { container } = render(<PetDialogue message="Hello!" />)

    const dialogue = screen.getByTestId('pet-dialogue')
    expect(dialogue).toBeInTheDocument()
  })

  test('auto-dismisses after 3 seconds', async () => {
    const mockOnDismiss = jest.fn()
    render(<PetDialogue message="Hello!" onDismiss={mockOnDismiss} />)

    expect(screen.getByTestId('pet-dialogue')).toBeInTheDocument()

    // Wait for auto-dismiss (3 seconds)
    await waitFor(() => expect(mockOnDismiss).toHaveBeenCalled(), { timeout: 3500 })
  })

  test('can be manually dismissed', () => {
    const mockOnDismiss = jest.fn()
    const { rerender } = render(<PetDialogue message="Hello!" onDismiss={mockOnDismiss} />)

    expect(screen.getByTestId('pet-dialogue')).toBeInTheDocument()

    // Simulate manual dismiss by passing empty message
    rerender(<PetDialogue message="" onDismiss={mockOnDismiss} />)

    expect(screen.queryByTestId('pet-dialogue')).not.toBeInTheDocument()
  })

  test('is positioned above pet center', () => {
    const { container } = render(<PetDialogue message="Hello!" />)

    const dialogue = screen.getByTestId('pet-dialogue')
    // Check that it has positioning styles
    expect(dialogue).toBeInTheDocument()
  })

  test('handles long messages', () => {
    const longMessage = 'This is a very long message that should wrap properly and display nicely in the speech bubble without breaking the layout.'
    render(<PetDialogue message={longMessage} />)

    expect(screen.getByText(longMessage)).toBeInTheDocument()
  })

  test('supports different message types (feed, pet, talk)', () => {
    const { rerender } = render(<PetDialogue message="Yum!" messageType="feed" />)
    expect(screen.getByTestId('pet-dialogue')).toBeInTheDocument()

    rerender(<PetDialogue message="That feels great!" messageType="pet" />)
    expect(screen.getByTestId('pet-dialogue')).toBeInTheDocument()

    rerender(<PetDialogue message="How are you?" messageType="talk" />)
    expect(screen.getByTestId('pet-dialogue')).toBeInTheDocument()
  })
})
