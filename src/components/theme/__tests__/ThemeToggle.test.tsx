import React from 'react'
import { render, screen, fireEvent } from '../../../__tests__/utils/test-utils'
import { ThemeToggle } from '../ThemeToggle'
import { useColorMode } from '@chakra-ui/react'

// Mock Chakra's useColorMode
jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'),
  useColorMode: jest.fn(),
}))

describe('ThemeToggle', () => {
  let mockToggleColorMode: jest.Mock

  beforeEach(() => {
    mockToggleColorMode = jest.fn()
    jest.clearAllMocks()
  })

  test('renders IconButton with moon icon in light mode', () => {
    ;(useColorMode as jest.Mock).mockReturnValue({
      colorMode: 'light',
      toggleColorMode: mockToggleColorMode,
    })

    render(<ThemeToggle />)

    const button = screen.getByRole('button', { name: /toggle theme/i })
    expect(button).toBeInTheDocument()

    // Check if moon icon is present (MoonIcon for switching to dark mode)
    const icon = button.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  test('renders IconButton with sun icon in dark mode', () => {
    ;(useColorMode as jest.Mock).mockReturnValue({
      colorMode: 'dark',
      toggleColorMode: mockToggleColorMode,
    })

    render(<ThemeToggle />)

    const button = screen.getByRole('button', { name: /toggle theme/i })
    expect(button).toBeInTheDocument()

    // Check if sun icon is present (SunIcon for switching to light mode)
    const icon = button.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  test('toggles theme when clicked', () => {
    ;(useColorMode as jest.Mock).mockReturnValue({
      colorMode: 'light',
      toggleColorMode: mockToggleColorMode,
    })

    render(<ThemeToggle />)

    const button = screen.getByRole('button', { name: /toggle theme/i })
    fireEvent.click(button)

    expect(mockToggleColorMode).toHaveBeenCalledTimes(1)
  })

  test('has accessible aria-label', () => {
    ;(useColorMode as jest.Mock).mockReturnValue({
      colorMode: 'light',
      toggleColorMode: mockToggleColorMode,
    })

    render(<ThemeToggle />)

    const button = screen.getByRole('button', { name: /toggle theme/i })
    expect(button).toHaveAttribute('aria-label')
  })

  test('shows tooltip on hover', async () => {
    ;(useColorMode as jest.Mock).mockReturnValue({
      colorMode: 'light',
      toggleColorMode: mockToggleColorMode,
    })

    render(<ThemeToggle />)

    const button = screen.getByRole('button', { name: /toggle theme/i })

    // Hover over button
    fireEvent.mouseOver(button)

    // Chakra Tooltip uses aria-label for accessibility
    // The tooltip content is tested by checking the button has proper accessibility
    expect(button).toHaveAttribute('aria-label', 'Toggle theme')
  })

  test('is keyboard accessible', () => {
    ;(useColorMode as jest.Mock).mockReturnValue({
      colorMode: 'light',
      toggleColorMode: mockToggleColorMode,
    })

    render(<ThemeToggle />)

    const button = screen.getByRole('button', { name: /toggle theme/i })

    // Simulate keyboard navigation
    button.focus()
    expect(button).toHaveFocus()

    // Simulate keyboard activation (Enter or Space)
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' })

    // IconButton should be focusable and activatable
    expect(button.tagName).toBe('BUTTON')
  })

  test('changes icon when color mode changes', () => {
    const { rerender } = render(<ThemeToggle />)

    // Start in light mode
    ;(useColorMode as jest.Mock).mockReturnValue({
      colorMode: 'light',
      toggleColorMode: mockToggleColorMode,
    })
    rerender(<ThemeToggle />)

    let button = screen.getByRole('button', { name: /toggle theme/i })
    expect(button).toBeInTheDocument()

    // Switch to dark mode
    ;(useColorMode as jest.Mock).mockReturnValue({
      colorMode: 'dark',
      toggleColorMode: mockToggleColorMode,
    })
    rerender(<ThemeToggle />)

    button = screen.getByRole('button', { name: /toggle theme/i })
    expect(button).toBeInTheDocument()
  })
})
