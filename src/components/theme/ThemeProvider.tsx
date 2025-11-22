import React, { createContext, useContext } from 'react'
import { useColorMode } from '@chakra-ui/react'

interface ThemeContextValue {
  colorMode: 'light' | 'dark'
  toggleColorMode: () => void
  setColorMode: (mode: 'light' | 'dark') => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export interface ThemeProviderProps {
  children: React.ReactNode
}

/**
 * ThemeProvider component
 *
 * Note: System theme detection is handled by Chakra UI's built-in
 * useSystemColorMode feature (configured in src/theme/index.ts).
 * This provider just exposes the theme context for convenience.
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { colorMode, setColorMode, toggleColorMode } = useColorMode()

  const value: ThemeContextValue = {
    colorMode,
    toggleColorMode,
    setColorMode,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

/**
 * Custom hook to access theme context
 *
 * @returns Theme context value with colorMode, toggleColorMode, and setColorMode
 * @throws Error if used outside ThemeProvider
 */
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext)

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context
}
