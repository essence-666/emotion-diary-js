import React from 'react'
import { IconButton, Tooltip, useColorMode } from '@chakra-ui/react'
import { MoonIcon, SunIcon } from '@chakra-ui/icons'

export interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'ghost' | 'outline' | 'solid'
}

/**
 * ThemeToggle button component
 *
 * Displays a button that toggles between light and dark modes.
 * Shows a moon icon in light mode and sun icon in dark mode.
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  size = 'md',
  variant = 'ghost',
}) => {
  const { colorMode, toggleColorMode } = useColorMode()

  // Use moon icon for light mode (to switch to dark)
  // Use sun icon for dark mode (to switch to light)
  const Icon = colorMode === 'light' ? MoonIcon : SunIcon

  const tooltipLabel = `Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`

  return (
    <Tooltip label={tooltipLabel} placement="bottom">
      <IconButton
        aria-label="Toggle theme"
        icon={<Icon />}
        onClick={toggleColorMode}
        variant={variant}
        size={size}
        colorScheme={colorMode === 'light' ? 'gray' : 'yellow'}
      />
    </Tooltip>
  )
}
