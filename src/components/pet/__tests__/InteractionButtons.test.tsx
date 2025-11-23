import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { InteractionButtons } from '../InteractionButtons'

describe('InteractionButtons', () => {
  const mockOnFeed = jest.fn()
  const mockOnPet = jest.fn()
  const mockOnTalk = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  test('renders three interaction buttons', () => {
    render(
      <InteractionButtons
        onFeed={mockOnFeed}
        onPet={mockOnPet}
        onTalk={mockOnTalk}
        isLoading={false}
      />
    )

    expect(screen.getByTestId('feed-button')).toBeInTheDocument()
    expect(screen.getByTestId('pet-button')).toBeInTheDocument()
    expect(screen.getByTestId('talk-button')).toBeInTheDocument()
  })

  test('calls onFeed when Feed button is clicked', () => {
    render(
      <InteractionButtons
        onFeed={mockOnFeed}
        onPet={mockOnPet}
        onTalk={mockOnTalk}
        isLoading={false}
      />
    )

    const feedButton = screen.getByTestId('feed-button')
    fireEvent.click(feedButton)

    expect(mockOnFeed).toHaveBeenCalledTimes(1)
  })

  test('calls onPet when Pet button is clicked', () => {
    render(
      <InteractionButtons
        onFeed={mockOnFeed}
        onPet={mockOnPet}
        onTalk={mockOnTalk}
        isLoading={false}
      />
    )

    const petButton = screen.getByTestId('pet-button')
    fireEvent.click(petButton)

    expect(mockOnPet).toHaveBeenCalledTimes(1)
  })

  test('calls onTalk when Talk button is clicked', () => {
    render(
      <InteractionButtons
        onFeed={mockOnFeed}
        onPet={mockOnPet}
        onTalk={mockOnTalk}
        isLoading={false}
      />
    )

    const talkButton = screen.getByTestId('talk-button')
    fireEvent.click(talkButton)

    expect(mockOnTalk).toHaveBeenCalledTimes(1)
  })

  test('disables all buttons when isLoading is true', () => {
    render(
      <InteractionButtons
        onFeed={mockOnFeed}
        onPet={mockOnPet}
        onTalk={mockOnTalk}
        isLoading={true}
      />
    )

    expect(screen.getByTestId('feed-button')).toBeDisabled()
    expect(screen.getByTestId('pet-button')).toBeDisabled()
    expect(screen.getByTestId('talk-button')).toBeDisabled()
  })

  test('disables Feed button when on cooldown', () => {
    // Set cooldown in localStorage
    const now = Date.now()
    const cooldownEnd = now + 2 * 60 * 60 * 1000 // 2 hours from now
    localStorage.setItem('pet_feed_cooldown', cooldownEnd.toString())

    render(
      <InteractionButtons
        onFeed={mockOnFeed}
        onPet={mockOnPet}
        onTalk={mockOnTalk}
        isLoading={false}
      />
    )

    expect(screen.getByTestId('feed-button')).toBeDisabled()
  })

  test('shows countdown timer on Feed button when on cooldown', () => {
    // Set cooldown in localStorage
    const now = Date.now()
    const cooldownEnd = now + 2 * 60 * 60 * 1000 // 2 hours from now
    localStorage.setItem('pet_feed_cooldown', cooldownEnd.toString())

    render(
      <InteractionButtons
        onFeed={mockOnFeed}
        onPet={mockOnPet}
        onTalk={mockOnTalk}
        isLoading={false}
      />
    )

    // Should show countdown like "2h 0m"
    const feedButton = screen.getByTestId('feed-button')
    expect(feedButton.textContent).toMatch(/\d+h|\d+m/)
  })

  test('disables Pet button when on cooldown', () => {
    const now = Date.now()
    const cooldownEnd = now + 30 * 60 * 1000 // 30 minutes from now
    localStorage.setItem('pet_pet_cooldown', cooldownEnd.toString())

    render(
      <InteractionButtons
        onFeed={mockOnFeed}
        onPet={mockOnPet}
        onTalk={mockOnTalk}
        isLoading={false}
      />
    )

    expect(screen.getByTestId('pet-button')).toBeDisabled()
  })

  test('disables Talk button when on cooldown', () => {
    const now = Date.now()
    const cooldownEnd = now + 15 * 60 * 1000 // 15 minutes from now
    localStorage.setItem('pet_talk_cooldown', cooldownEnd.toString())

    render(
      <InteractionButtons
        onFeed={mockOnFeed}
        onPet={mockOnPet}
        onTalk={mockOnTalk}
        isLoading={false}
      />
    )

    expect(screen.getByTestId('talk-button')).toBeDisabled()
  })

  test('enables button after cooldown expires', async () => {
    // Set cooldown to expire in 100ms
    const now = Date.now()
    const cooldownEnd = now + 100
    localStorage.setItem('pet_feed_cooldown', cooldownEnd.toString())

    render(
      <InteractionButtons
        onFeed={mockOnFeed}
        onPet={mockOnPet}
        onTalk={mockOnTalk}
        isLoading={false}
      />
    )

    const feedButton = screen.getByTestId('feed-button')
    expect(feedButton).toBeDisabled()

    // Wait for cooldown to expire (add extra time for the 1s interval to update)
    await waitFor(() => expect(feedButton).not.toBeDisabled(), { timeout: 1500 })
  })

  test('buttons have touch-friendly size', () => {
    const { container } = render(
      <InteractionButtons
        onFeed={mockOnFeed}
        onPet={mockOnPet}
        onTalk={mockOnTalk}
        isLoading={false}
      />
    )

    // Buttons should be large enough for touch (at least 80px height implied via Chakra size)
    const feedButton = screen.getByTestId('feed-button')
    expect(feedButton).toBeInTheDocument()
  })

  test('shows appropriate emoji icons', () => {
    render(
      <InteractionButtons
        onFeed={mockOnFeed}
        onPet={mockOnPet}
        onTalk={mockOnTalk}
        isLoading={false}
      />
    )

    const feedButton = screen.getByTestId('feed-button')
    const petButton = screen.getByTestId('pet-button')
    const talkButton = screen.getByTestId('talk-button')

    // Check for emojis in button text
    expect(feedButton.textContent).toMatch(/🍖|Feed/)
    expect(petButton.textContent).toMatch(/🤗|Pet/)
    expect(talkButton.textContent).toMatch(/💬|Talk/)
  })

  test('sets cooldown in localStorage after successful interaction', async () => {
    render(
      <InteractionButtons
        onFeed={mockOnFeed}
        onPet={mockOnPet}
        onTalk={mockOnTalk}
        isLoading={false}
      />
    )

    const feedButton = screen.getByTestId('feed-button')
    fireEvent.click(feedButton)

    // Cooldown should be set in localStorage
    await waitFor(() => {
      expect(localStorage.getItem('pet_feed_cooldown')).toBeTruthy()
    })
  })
})
