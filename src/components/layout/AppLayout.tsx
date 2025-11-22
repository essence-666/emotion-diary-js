import React, { useState, useEffect } from 'react'
import { Box, Flex, useBreakpointValue, useColorModeValue } from '@chakra-ui/react'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'

interface AppLayoutProps {
  children: React.ReactNode;
}

const SIDEBAR_STORAGE_KEY = 'emotion-diary-sidebar-collapsed'

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  // Show sidebar on desktop (md and up), bottom nav on mobile
  const isMobile = useBreakpointValue({ base: true, md: false })
  const bgColor = useColorModeValue('gray.50', 'gray.900')

  // Sync with sidebar collapsed state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY)
      return stored !== null ? stored === 'true' : true
    }
    return true
  })

  // Listen for localStorage changes (sidebar toggle)
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY)
      setIsSidebarCollapsed(stored === 'true')
    }

    window.addEventListener('storage', handleStorageChange)
    // Also check periodically for same-tab changes
    const interval = setInterval(() => {
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY)
      const newValue = stored === 'true'
      if (newValue !== isSidebarCollapsed) {
        setIsSidebarCollapsed(newValue)
      }
    }, 100)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [isSidebarCollapsed])

  const sidebarWidth = isSidebarCollapsed ? '70px' : '250px'

  return (
    <Flex minH="100vh" bg={bgColor}>
      {/* Desktop Sidebar */}
      {!isMobile && <Sidebar />}

      {/* Main Content */}
      <Box
        flex="1"
        ml={{ base: 0, md: sidebarWidth }} // Dynamic offset for sidebar
        mb={{ base: '80px', md: 0 }} // Offset for bottom nav on mobile
        p={{ base: 4, md: 8 }}
        overflow="auto"
        transition="margin-left 0.2s ease-in-out" // Smooth transition when sidebar toggles
      >
        {children}
      </Box>

      {/* Mobile Bottom Navigation */}
      {isMobile && <BottomNav />}
    </Flex>
  )
}
