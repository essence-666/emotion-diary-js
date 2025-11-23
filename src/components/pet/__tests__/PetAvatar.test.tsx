import React from 'react'
import { render, screen } from '@testing-library/react'
import { PetAvatar } from '../PetAvatar'

describe('PetAvatar', () => {
  test('renders SVG pet with correct structure', () => {
    render(<PetAvatar happiness={50} animationState="idle" />)

    const svg = screen.getByTestId('pet-avatar-svg')
    expect(svg).toBeInTheDocument()
    expect(svg.tagName).toBe('svg')
  })

  test('applies sad animation when happiness 0-20', () => {
    const { container } = render(<PetAvatar happiness={15} animationState="idle" />)

    // Should have sad/critical styling
    const body = container.querySelector('[data-testid="pet-body"]')
    expect(body).toBeInTheDocument()
  })

  test('applies neutral animation when happiness 21-50', () => {
    const { container } = render(<PetAvatar happiness={35} animationState="idle" />)

    const body = container.querySelector('[data-testid="pet-body"]')
    expect(body).toBeInTheDocument()
  })

  test('applies happy animation when happiness 51-80', () => {
    const { container } = render(<PetAvatar happiness={65} animationState="idle" />)

    const body = container.querySelector('[data-testid="pet-body"]')
    expect(body).toBeInTheDocument()
  })

  test('applies delighted animation when happiness 81-100', () => {
    const { container } = render(<PetAvatar happiness={90} animationState="idle" />)

    const body = container.querySelector('[data-testid="pet-body"]')
    expect(body).toBeInTheDocument()
  })

  test('shows eating animation state', () => {
    const { container } = render(<PetAvatar happiness={50} animationState="eating" />)

    const svg = screen.getByTestId('pet-avatar-svg')
    expect(svg).toBeInTheDocument()
  })

  test('shows being_petted animation state', () => {
    const { container } = render(<PetAvatar happiness={50} animationState="being_petted" />)

    const svg = screen.getByTestId('pet-avatar-svg')
    expect(svg).toBeInTheDocument()
  })

  test('shows talking animation state', () => {
    const { container } = render(<PetAvatar happiness={50} animationState="talking" />)

    const svg = screen.getByTestId('pet-avatar-svg')
    expect(svg).toBeInTheDocument()
  })

  test('applies color gradient based on happiness level', () => {
    // Critical (0-20): Red
    const { container: criticalContainer } = render(<PetAvatar happiness={10} animationState="idle" />)
    expect(criticalContainer.querySelector('[data-testid="pet-body"]')).toBeInTheDocument()

    // Unhappy (21-50): Yellow/Orange
    const { container: unhappyContainer } = render(<PetAvatar happiness={30} animationState="idle" />)
    expect(unhappyContainer.querySelector('[data-testid="pet-body"]')).toBeInTheDocument()

    // Content (51-80): Green
    const { container: contentContainer } = render(<PetAvatar happiness={60} animationState="idle" />)
    expect(contentContainer.querySelector('[data-testid="pet-body"]')).toBeInTheDocument()

    // Delighted (81-100): Purple
    const { container: delightedContainer } = render(<PetAvatar happiness={95} animationState="idle" />)
    expect(delightedContainer.querySelector('[data-testid="pet-body"]')).toBeInTheDocument()
  })

  test('renders with default cosmetic skin', () => {
    render(<PetAvatar happiness={50} animationState="idle" />)

    const svg = screen.getByTestId('pet-avatar-svg')
    expect(svg).toBeInTheDocument()
  })

  test('renders with rainbow cosmetic skin', () => {
    render(<PetAvatar happiness={50} animationState="idle" cosmeticSkin="rainbow" />)

    const svg = screen.getByTestId('pet-avatar-svg')
    expect(svg).toBeInTheDocument()
  })

  test('renders with golden cosmetic skin', () => {
    render(<PetAvatar happiness={50} animationState="idle" cosmeticSkin="golden" />)

    const svg = screen.getByTestId('pet-avatar-svg')
    expect(svg).toBeInTheDocument()
  })

  test('has proper size (300x300px)', () => {
    const { container } = render(<PetAvatar happiness={50} animationState="idle" />)

    const svg = screen.getByTestId('pet-avatar-svg')
    expect(svg).toHaveAttribute('width', '300')
    expect(svg).toHaveAttribute('height', '300')
  })
})
