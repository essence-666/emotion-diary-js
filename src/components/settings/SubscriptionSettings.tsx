import React from 'react'
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Badge,
  useColorModeValue,
  HStack,
  Icon,
} from '@chakra-ui/react'
import { FaMagic, FaChartBar, FaPalette, FaBell } from 'react-icons/fa'
import { useAuth } from '../../hooks/useAuth'

export const SubscriptionSettings = () => {
  const { user } = useAuth()
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const isPremium = user?.subscription_tier === 'premium'

  return (
    <Box
      bg={cardBg}
      borderRadius="lg"
      p={6}
      borderWidth="1px"
      borderColor={borderColor}
      data-testid="subscription-settings"
    >
      <Heading size="md" mb={4}>
        Subscription
      </Heading>
      <VStack spacing={4} align="stretch">
        <HStack>
          <Text>Current Plan:</Text>
          <Badge colorScheme={isPremium ? 'purple' : 'gray'} fontSize="md">
            {isPremium ? 'Premium' : 'Free'}
          </Badge>
        </HStack>

        {!isPremium ? (
          <>
            <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
              Upgrade to Premium to unlock:
            </Text>
            <VStack align="start" spacing={2} pl={4}>
              <HStack spacing={2}>
                <Icon as={FaMagic} color="purple.500" />
                <Text fontSize="sm">AI-powered insights</Text>
              </HStack>
              <HStack spacing={2}>
                <Icon as={FaChartBar} color="blue.500" />
                <Text fontSize="sm">Advanced analytics</Text>
              </HStack>
              <HStack spacing={2}>
                <Icon as={FaPalette} color="pink.500" />
                <Text fontSize="sm">Pet customization</Text>
              </HStack>
              <HStack spacing={2}>
                <Icon as={FaBell} color="orange.500" />
                <Text fontSize="sm">Priority support</Text>
              </HStack>
            </VStack>
            <Button colorScheme="purple" width="full">
              Upgrade to Premium
            </Button>
          </>
        ) : (
          <>
            <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
              Thank you for being a Premium member!
            </Text>
            <Button variant="outline" colorScheme="red">
              Cancel Subscription
            </Button>
          </>
        )}
      </VStack>
    </Box>
  )
}
