import React, { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  Button,
  Text,
  Avatar,
  Flex,
  Badge,
  Icon,
  HStack,
  IconButton,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  FiHome,
  FiSmile,
  FiBook,
  FiHeart,
  FiBarChart2,
  FiSettings,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import { ThemeToggle } from '../theme/ThemeToggle'

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  requiresPremium?: boolean;
}

// Pet-first navigation order as requested
const navItems: NavItem[] = [
  { label: 'My Pet', path: '/pet', icon: FiHeart },
  { label: 'Mood Check-in', path: '/checkin', icon: FiSmile },
  { label: 'Dashboard', path: '/dashboard', icon: FiHome },
  { label: 'Diary', path: '/diary', icon: FiBook },
  { label: 'Analytics', path: '/analytics', icon: FiBarChart2, requiresPremium: true },
  { label: 'Settings', path: '/settings', icon: FiSettings },
]

const SIDEBAR_STORAGE_KEY = 'emotion-diary-sidebar-collapsed'

export const Sidebar: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isPremium, logout } = useAuth()

  // Load collapsed state from localStorage (default: collapsed/icon-only)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY)
    return stored !== null ? stored === 'true' : true // Default to collapsed
  })

  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isCollapsed))
  }, [isCollapsed])

  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const headerText = useColorModeValue('purple.600', 'purple.300')
  const textMuted = useColorModeValue('gray.500', 'gray.400')

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const sidebarWidth = isCollapsed ? '70px' : '250px'

  return (
    <Box
      position="fixed"
      left={0}
      top={0}
      bottom={0}
      w={sidebarWidth}
      bg={bgColor}
      borderRight="1px"
      borderColor={borderColor}
      display="flex"
      flexDirection="column"
      transition="width 0.2s ease-in-out"
      zIndex={100}
    >
      {/* Header with Toggle */}
      <Box p={isCollapsed ? 4 : 6} borderBottom="1px" borderColor={borderColor}>
        {isCollapsed ? (
          <Flex justify="center">
            <Icon as={FiBook} boxSize={6} color={headerText} />
          </Flex>
        ) : (
          <HStack justify="space-between">
            <Text fontSize="2xl" fontWeight="bold" color={headerText}>
              Emotion Diary
            </Text>
            <IconButton
              aria-label="Collapse sidebar"
              icon={<FiChevronLeft />}
              size="sm"
              variant="ghost"
              onClick={() => setIsCollapsed(true)}
            />
          </HStack>
        )}
      </Box>

      {/* Expand button when collapsed */}
      {isCollapsed && (
        <Box px={2} pt={2}>
          <Tooltip label="Expand sidebar" placement="right">
            <IconButton
              aria-label="Expand sidebar"
              icon={<FiChevronRight />}
              size="sm"
              variant="ghost"
              w="full"
              onClick={() => setIsCollapsed(false)}
            />
          </Tooltip>
        </Box>
      )}

      {/* User Info */}
      {user && !isCollapsed && (
        <Box p={4} borderBottom="1px" borderColor={borderColor}>
          <Flex align="center" gap={3}>
            <Avatar size="sm" name={user.username || user.email} />
            <Box flex="1" minW={0}>
              <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                {user.username || 'User'}
              </Text>
              <Badge
                colorScheme={isPremium ? 'purple' : 'gray'}
                fontSize="xs"
              >
                {isPremium ? 'Premium' : 'Free'}
              </Badge>
            </Box>
          </Flex>
        </Box>
      )}

      {/* User Avatar (collapsed mode) */}
      {user && isCollapsed && (
        <Box p={2} borderBottom="1px" borderColor={borderColor}>
          <Flex justify="center">
            <Tooltip label={user.username || user.email} placement="right">
              <Avatar size="sm" name={user.username || user.email} />
            </Tooltip>
          </Flex>
        </Box>
      )}

      {/* Navigation */}
      <VStack flex="1" spacing={1} p={2} align="stretch" overflowY="auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          const isLocked = item.requiresPremium && !isPremium

          if (isCollapsed) {
            // Icon-only mode
            return (
              <Tooltip key={item.path} label={item.label} placement="right">
                <IconButton
                  aria-label={item.label}
                  icon={<Icon as={item.icon} boxSize={5} />}
                  variant={isActive ? 'solid' : 'ghost'}
                  colorScheme={isActive ? 'purple' : 'gray'}
                  onClick={() => navigate(item.path)}
                  isDisabled={isLocked}
                  w="full"
                  h="50px"
                />
              </Tooltip>
            )
          }

          // Full mode
          return (
            <Button
              key={item.path}
              leftIcon={<Icon as={item.icon} />}
              justifyContent="flex-start"
              variant={isActive ? 'solid' : 'ghost'}
              colorScheme={isActive ? 'purple' : 'gray'}
              onClick={() => navigate(item.path)}
              isDisabled={isLocked}
              position="relative"
            >
              {item.label}
              {isLocked && (
                <Badge
                  position="absolute"
                  right={2}
                  colorScheme="yellow"
                  fontSize="xs"
                >
                  Premium
                </Badge>
              )}
            </Button>
          )
        })}
      </VStack>

      {/* Footer with Theme Toggle and Logout */}
      <Box p={2} borderTop="1px" borderColor={borderColor}>
        {isCollapsed ? (
          // Icon-only mode
          <VStack spacing={2}>
            <ThemeToggle size="sm" />
            <Tooltip label="Logout" placement="right">
              <IconButton
                aria-label="Logout"
                icon={<Icon as={FiLogOut} />}
                variant="ghost"
                colorScheme="red"
                w="full"
                onClick={handleLogout}
              />
            </Tooltip>
          </VStack>
        ) : (
          // Full mode
          <>
            <HStack spacing={2} mb={2}>
              <ThemeToggle size="sm" />
              <Text fontSize="xs" color={textMuted}>
                Theme
              </Text>
            </HStack>
            <Button
              leftIcon={<Icon as={FiLogOut} />}
              variant="ghost"
              colorScheme="red"
              w="full"
              justifyContent="flex-start"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </>
        )}
      </Box>
    </Box>
  )
}
