import React from 'react'
import { render, screen } from '../../../__tests__/utils/test-utils'
import { ThemeProvider, useTheme } from '../ThemeProvider'
import { useColorMode } from '@chakra-ui/react'

// Mock Chakra's useColorMode
jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'),
  useColorMode: jest.fn(),
}))

// Test component to access theme context
const TestComponent = () => {
  const { colorMode, toggleColorMode } = useTheme()
  return (
    <div>
      <div data-testid="color-mode">{colorMode}</div>
      <button onClick={toggleColorMode} data-testid="toggle-button">
        Toggle
      </button>
    </div>
  )
}

describe('ThemeProvider', () => {
  let mockSetColorMode: jest.Mock
  let mockToggleColorMode: jest.Mock

  beforeEach(() => {
    mockSetColorMode = jest.fn()
    mockToggleColorMode = jest.fn()

    // Mock useColorMode hook
    ;(useColorMode as jest.Mock).mockReturnValue({
      colorMode: 'light',
      setColorMode: mockSetColorMode,
      toggleColorMode: mockToggleColorMode,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('wraps children with theme context', () => {
    render(
      <ThemeProvider>
        <div data-testid="child">Test Child</div>
      </ThemeProvider>
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  test('provides colorMode from Chakra useColorMode', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    expect(screen.getByTestId('color-mode')).toHaveTextContent('light')
  })

  test('provides dark mode when Chakra returns dark', () => {
    ;(useColorMode as jest.Mock).mockReturnValue({
      colorMode: 'dark',
      setColorMode: mockSetColorMode,
      toggleColorMode: mockToggleColorMode,
    })

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    expect(screen.getByTestId('color-mode')).toHaveTextContent('dark')
  })

  test('provides theme toggle function to children', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    const toggleButton = screen.getByTestId('toggle-button')
    toggleButton.click()

    expect(mockToggleColorMode).toHaveBeenCalled()
  })
})

describe('useTheme hook', () => {
  let mockSetColorMode: jest.Mock
  let mockToggleColorMode: jest.Mock

  beforeEach(() => {
    mockSetColorMode = jest.fn()
    mockToggleColorMode = jest.fn()

    ;(useColorMode as jest.Mock).mockReturnValue({
      colorMode: 'light',
      setColorMode: mockSetColorMode,
      toggleColorMode: mockToggleColorMode,
    })
  })

  test('returns colorMode from Chakra useColorMode', () => {
    ;(useColorMode as jest.Mock).mockReturnValue({
      colorMode: 'dark',
      setColorMode: mockSetColorMode,
      toggleColorMode: mockToggleColorMode,
    })

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    expect(screen.getByTestId('color-mode')).toHaveTextContent('dark')
  })

  test('provides toggleColorMode function', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    const toggleButton = screen.getByTestId('toggle-button')
    toggleButton.click()

    expect(mockToggleColorMode).toHaveBeenCalled()
  })

  test('throws error when used outside ThemeProvider', () => {
    // Suppress console.error for this test
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})

    const TestError = () => {
      try {
        useTheme()
        return <div>Should not render</div>
      } catch (e: any) {
        return <div data-testid="error">{e.message}</div>
      }
    }

    render(<TestError />)

    expect(screen.getByTestId('error')).toHaveTextContent(
      'useTheme must be used within a ThemeProvider'
    )

    spy.mockRestore()
  })
})
