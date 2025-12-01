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
import { useCreateSubscriptionMutation, useGetSubscriptionStatusQuery } from '../../__data__/api'
import { useAppDispatch } from '../../__data__/store'
import { updateSubscriptionTier } from '../../__data__/slices/authSlice'

export const SubscriptionSettings = () => {
  const { user } = useAuth()
  const dispatch = useAppDispatch()
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const isPremium = user?.subscription_tier === 'premium'
  const [createSubscription, { isLoading: isCreatingSubscription }] = useCreateSubscriptionMutation()
  const { data: subscriptionStatus, refetch: refetchSubscriptionStatus, isLoading: isCheckingStatus } = useGetSubscriptionStatusQuery()
  const toast = useToast()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleUpgrade = async () => {
    try {
      setIsProcessing(true)

      // First, check current subscription status
      const statusCheck = await refetchSubscriptionStatus()

      if (statusCheck.data?.subscription?.is_active) {
        // User already has an active subscription
        const tier = statusCheck.data.subscription.tier

        if (tier === 'premium' || tier === 'premium_annual') {
          // Update Redux state
          dispatch(updateSubscriptionTier('premium'))

          toast({
            title: 'Subscription already active',
            description: 'Your Premium subscription is already active! Please refresh the page to see changes.',
            status: 'info',
            duration: 5000,
            isClosable: true,
          })
          return
        }
      }

      // Proceed with creating subscription
      const result = await createSubscription({
        tier: 'premium',
        payment_method_id: 'mock_payment_method_123',
      })

      if ('data' in result) {
        // Update subscription tier in Redux state
        dispatch(updateSubscriptionTier('premium'))

        toast({
          title: 'Subscription created',
          description: 'Your Premium subscription has been activated! Please refresh the page to access premium features.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
      } else if ('error' in result) {
        // Check if error is due to existing subscription
        const error = result.error as any
        const errorMessage = error?.data?.message || ''

        if (errorMessage.includes('активная подписка') || errorMessage.includes('already')) {
          // User already has an active subscription - sync status from backend
          toast({
            title: 'Subscription already active',
            description: 'Synchronizing your subscription status...',
            status: 'info',
            duration: 3000,
            isClosable: true,
          })

          // Fetch current subscription status
          const statusResult = await refetchSubscriptionStatus()

          if (statusResult.data?.subscription?.is_active) {
            const tier = statusResult.data.subscription.tier
            // Update Redux state with actual subscription tier
            if (tier === 'premium' || tier === 'premium_annual') {
              dispatch(updateSubscriptionTier('premium'))

              toast({
                title: 'Subscription synchronized',
                description: 'Your Premium subscription is active! Please refresh the page to access premium features.',
                status: 'success',
                duration: 5000,
                isClosable: true,
              })
            }
          }
        } else {
          toast({
            title: 'Subscription failed',
            description: 'Failed to create subscription. Please try again.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
        }
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
              isLoading={isCreatingSubscription || isProcessing || isCheckingStatus}
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
