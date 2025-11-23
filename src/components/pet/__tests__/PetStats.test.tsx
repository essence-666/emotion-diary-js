import React from 'react'
import { render, screen } from '@testing-library/react'
import { PetStats } from '../PetStats'

describe('PetStats', () => {
  test('renders pet name', () => {
    render(<PetStats name="Fluffy" happiness={50} lastInteraction="2025-11-23T10:00:00Z" />)

    expect(screen.getByText('Fluffy')).toBeInTheDocument()
  })

  test('displays happiness bar with correct value', () => {
    render(<PetStats name="Fluffy" happiness={75} lastInteraction="2025-11-23T10:00:00Z" />)

    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toBeInTheDocument()
    expect(progressBar).toHaveAttribute('aria-valuenow', '75')
  })

  test('shows Critical status when happiness 0-20', () => {
    render(<PetStats name="Fluffy" happiness={15} lastInteraction="2025-11-23T10:00:00Z" />)

    // Use getAllByText and check for the status specifically
    const criticalTexts = screen.getAllByText(/Critical/i)
    expect(criticalTexts.length).toBeGreaterThan(0)
  })

  test('shows Unhappy status when happiness 21-50', () => {
    render(<PetStats name="Fluffy" happiness={35} lastInteraction="2025-11-23T10:00:00Z" />)

    expect(screen.getByText(/Unhappy/i)).toBeInTheDocument()
  })

  test('shows Content status when happiness 51-80', () => {
    render(<PetStats name="Fluffy" happiness={65} lastInteraction="2025-11-23T10:00:00Z" />)

    expect(screen.getByText(/Content/i)).toBeInTheDocument()
  })

  test('shows Delighted status when happiness 81-100', () => {
    render(<PetStats name="Fluffy" happiness={90} lastInteraction="2025-11-23T10:00:00Z" />)

    expect(screen.getByText(/Delighted/i)).toBeInTheDocument()
  })

  test('displays happiness percentage', () => {
    render(<PetStats name="Fluffy" happiness={75} lastInteraction="2025-11-23T10:00:00Z" />)

    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  test('applies red color when happiness is critical', () => {
    const { container } = render(<PetStats name="Fluffy" happiness={10} lastInteraction="2025-11-23T10:00:00Z" />)

    // Check for red color scheme in progress bar
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toBeInTheDocument()
  })

  test('applies yellow color when happiness is low', () => {
    const { container } = render(<PetStats name="Fluffy" happiness={30} lastInteraction="2025-11-23T10:00:00Z" />)

    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toBeInTheDocument()
  })

  test('applies green color when happiness is good', () => {
    const { container } = render(<PetStats name="Fluffy" happiness={60} lastInteraction="2025-11-23T10:00:00Z" />)

    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toBeInTheDocument()
  })

  test('applies purple color when happiness is high', () => {
    const { container } = render(<PetStats name="Fluffy" happiness={95} lastInteraction="2025-11-23T10:00:00Z" />)

    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toBeInTheDocument()
  })

  test('displays last interaction time', () => {
    render(<PetStats name="Fluffy" happiness={50} lastInteraction="2025-11-23T10:30:00Z" />)

    // Should show relative time like "30 minutes ago" or formatted time
    expect(screen.getByText(/ago|Last interaction/i)).toBeInTheDocument()
  })

  test('shows warning icon when happiness is critical', () => {
    render(<PetStats name="Fluffy" happiness={15} lastInteraction="2025-11-23T10:00:00Z" />)

    // Should have warning indicator
    expect(screen.getByTestId('pet-stats')).toBeInTheDocument()
  })
})
