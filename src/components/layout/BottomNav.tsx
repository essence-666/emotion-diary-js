import React from 'react'
import { Box, Flex, IconButton, Text, VStack, Badge, useColorModeValue } from '@chakra-ui/react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  FiHome,
  FiSmile,
  FiBook,
  FiHeart,
  FiSettings,
} from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import { ThemeToggle } from '../theme/ThemeToggle'

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  requiresPremium?: boolean;
}

// Pet-first navigation order
const navItems: NavItem[] = [
  { label: 'Pet', path: '/pet', icon: FiHeart },
  { label: 'Mood', path: '/checkin', icon: FiSmile },
  { label: 'Diary', path: '/diary', icon: FiBook },
  { label: 'Dashboard', path: '/dashboard', icon: FiHome },
  { label: 'Settings', path: '/settings', icon: FiSettings },
]

export const BottomNav: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isPremium } = useAuth()

  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const activeColor = useColorModeValue('purple.600', 'purple.300')
  const inactiveColor = useColorModeValue('gray.600', 'gray.400')
  const textColor = useColorModeValue('gray.600', 'gray.400')

  return (
    <Box
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      bg={bgColor}
      borderTop="1px"
      borderColor={borderColor}
      boxShadow="0 -2px 10px rgba(0,0,0,0.1)"
      zIndex={1000}
    >
      <Flex justify="space-around" align="center" h="80px" px={2}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          const isLocked = item.requiresPremium && !isPremium
          const Icon = item.icon

          return (
            <VStack
              key={item.path}
              spacing={1}
              flex="1"
              onClick={() => !isLocked && navigate(item.path)}
              cursor={isLocked ? 'not-allowed' : 'pointer'}
              opacity={isLocked ? 0.5 : 1}
              position="relative"
            >
              <IconButton
                aria-label={item.label}
                icon={<Icon size={24} />}
                variant="ghost"
                colorScheme={isActive ? 'purple' : 'gray'}
                color={isActive ? activeColor : inactiveColor}
                isDisabled={isLocked}
                _disabled={{
                  opacity: 0.5,
                  cursor: 'not-allowed',
                }}
              />
              <Text
                fontSize="xs"
                fontWeight={isActive ? 'semibold' : 'normal'}
                color={isActive ? activeColor : textColor}
              >
                {item.label}
              </Text>
              {isLocked && (
                <Badge
                  position="absolute"
                  top={-1}
                  right="20%"
                  colorScheme="yellow"
                  fontSize="9px"
                  borderRadius="full"
                >
                  PRO
                </Badge>
              )}
            </VStack>
          )
        })}

        {/* Theme Toggle */}
        <VStack spacing={1} flex="1">
          <ThemeToggle size="sm" variant="ghost" />
          <Text fontSize="xs" color={textColor}>
            Theme
          </Text>
        </VStack>
      </Flex>
    </Box>
  )
}
