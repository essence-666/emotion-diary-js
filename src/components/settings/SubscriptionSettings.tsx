import React, { useState } from 'react'
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
  useToast,
} from '@chakra-ui/react'
import { FaMagic, FaChartBar, FaPalette, FaBell } from 'react-icons/fa'
import { useAuth } from '../../hooks/useAuth'
import { useCreateSubscriptionMutation } from '../../__data__/api'
import { useAppDispatch } from '../../__data__/store'
import { updateSubscriptionTier } from '../../__data__/slices/authSlice'

export const SubscriptionSettings = () => {
  const { user } = useAuth()
  const dispatch = useAppDispatch()
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const isPremium = user?.subscription_tier === 'premium'
  const [createSubscription, { isLoading: isCreatingSubscription }] = useCreateSubscriptionMutation()
  const toast = useToast()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleUpgrade = async () => {
    try {
      setIsProcessing(true)
      const result = await createSubscription()
      
      if ('data' in result && result.data) {
        // Update subscription tier in Redux state
        dispatch(updateSubscriptionTier(result.data.tier))
        
        toast({
          title: 'Subscription created',
          description: 'Your Premium subscription has been activated!',
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
      } else if ('error' in result) {
        toast({
          title: 'Subscription failed',
          description: 'Failed to create subscription. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsProcessing(false)
    }
  }

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
            <Button 
              colorScheme="purple" 
              width="full"
              onClick={handleUpgrade}
              isLoading={isCreatingSubscription || isProcessing}
              loadingText="Processing..."
            >
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
