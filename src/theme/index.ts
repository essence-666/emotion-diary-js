import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

// Theme configuration for color mode
const config: ThemeConfig = {
  initialColorMode: 'system', // Use system preference by default
  useSystemColorMode: true,   // Auto-update with system changes
}

// Custom theme extending Chakra UI default theme
const theme = extendTheme({
  config,

  // Brand colors (purple theme for emotion diary)
  colors: {
    brand: {
      50: '#f5e9ff',
      100: '#ddc2ff',
      200: '#c69aff',
      300: '#af72ff',
      400: '#984aff',
      500: '#8022ff', // Primary brand color
      600: '#661bcc',
      700: '#4d1499',
      800: '#330d66',
      900: '#1a0633',
    },

    // Emotion-specific colors (from frontend.md requirements)
    emotion: {
      happy: '#fbbf24',      // yellow
      sad: '#60a5fa',        // blue
      angry: '#ef5350',      // red
      calm: '#a78bfa',       // purple
      stressed: '#fb7185',   // pink
      excited: '#ec4899',    // magenta
    },
  },

  // Semantic tokens for consistent theming across light/dark modes
  semanticTokens: {
    colors: {
      // Background colors
      'bg.primary': {
        default: 'white',
        _dark: 'gray.800',
      },
      'bg.secondary': {
        default: 'gray.50',
        _dark: 'gray.900',
      },
      'bg.tertiary': {
        default: 'gray.100',
        _dark: 'gray.700',
      },
      'bg.hover': {
        default: 'gray.100',
        _dark: 'gray.700',
      },
      'bg.active': {
        default: 'gray.200',
        _dark: 'gray.600',
      },

      // Text colors
      'text.primary': {
        default: 'gray.900',
        _dark: 'white',
      },
      'text.secondary': {
        default: 'gray.600',
        _dark: 'gray.400',
      },
      'text.muted': {
        default: 'gray.500',
        _dark: 'gray.500',
      },
      'text.inverse': {
        default: 'white',
        _dark: 'gray.900',
      },

      // Border colors
      'border.default': {
        default: 'gray.200',
        _dark: 'gray.600',
      },
      'border.muted': {
        default: 'gray.100',
        _dark: 'gray.700',
      },

      // Component-specific colors
      'card.bg': {
        default: 'white',
        _dark: 'gray.700',
      },
      'card.border': {
        default: 'gray.200',
        _dark: 'gray.600',
      },

      // Sidebar colors
      'sidebar.bg': {
        default: 'white',
        _dark: 'gray.800',
      },
      'sidebar.border': {
        default: 'gray.200',
        _dark: 'gray.700',
      },

      // Navigation colors
      'nav.active': {
        default: 'brand.500',
        _dark: 'brand.300',
      },
      'nav.hover': {
        default: 'gray.100',
        _dark: 'gray.700',
      },
    },
  },

  // Global styles
  styles: {
    global: (props: any) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
        color: props.colorMode === 'dark' ? 'white' : 'gray.900',
        transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out',
      },
      '*::placeholder': {
        color: props.colorMode === 'dark' ? 'gray.500' : 'gray.400',
      },
      '*, *::before, &::after': {
        borderColor: props.colorMode === 'dark' ? 'gray.600' : 'gray.200',
      },
    }),
  },

  // Component style overrides
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'medium',
        borderRadius: 'md',
      },
      variants: {
        solid: (props: any) => ({
          bg: props.colorMode === 'dark' ? 'brand.400' : 'brand.500',
          color: 'white',
          _hover: {
            bg: props.colorMode === 'dark' ? 'brand.500' : 'brand.600',
            _disabled: {
              bg: props.colorMode === 'dark' ? 'brand.400' : 'brand.500',
            },
          },
        }),
      },
    },

    Card: {
      baseStyle: (props: any) => ({
        container: {
          bg: props.colorMode === 'dark' ? 'gray.700' : 'white',
          borderColor: props.colorMode === 'dark' ? 'gray.600' : 'gray.200',
          boxShadow: props.colorMode === 'dark' ? 'none' : 'sm',
        },
      }),
    },

    Input: {
      variants: {
        outline: (props: any) => ({
          field: {
            bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
            borderColor: props.colorMode === 'dark' ? 'gray.600' : 'gray.300',
            _hover: {
              borderColor: props.colorMode === 'dark' ? 'gray.500' : 'gray.400',
            },
            _focus: {
              borderColor: props.colorMode === 'dark' ? 'brand.400' : 'brand.500',
              boxShadow: `0 0 0 1px ${props.colorMode === 'dark' ? 'var(--chakra-colors-brand-400)' : 'var(--chakra-colors-brand-500)'}`,
            },
          },
        }),
      },
    },

    Textarea: {
      variants: {
        outline: (props: any) => ({
          bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
          borderColor: props.colorMode === 'dark' ? 'gray.600' : 'gray.300',
          _hover: {
            borderColor: props.colorMode === 'dark' ? 'gray.500' : 'gray.400',
          },
          _focus: {
            borderColor: props.colorMode === 'dark' ? 'brand.400' : 'brand.500',
            boxShadow: `0 0 0 1px ${props.colorMode === 'dark' ? 'var(--chakra-colors-brand-400)' : 'var(--chakra-colors-brand-500)'}`,
          },
        }),
      },
    },
  },

  // Font configuration
  fonts: {
    heading: `-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
    body: `-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
  },

  // Responsive breakpoints
  breakpoints: {
    base: '0px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
})

export default theme
