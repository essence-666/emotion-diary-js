import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Box, Heading, Text, Button, VStack, Spinner, Center, useToast } from '@chakra-ui/react'
import { useAuth } from '../../hooks/useAuth'
import { useCreateSubscriptionMutation } from '../../__data__/api'
import { useAppDispatch } from '../../__data__/store'
import { updateSubscriptionTier } from '../../__data__/slices/authSlice'

interface ProtectedRouteProps {
  children: React.ReactNode;
  requirePremium?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requirePremium = false,
}) => {
  const { isAuthenticated, isPremium, isLoading } = useAuth()
  const dispatch = useAppDispatch()
  const [createSubscription, { isLoading: isCreatingSubscription }] = useCreateSubscriptionMutation()
  const toast = useToast()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleUpgrade = async () => {
    try {
      setIsProcessing(true)
      const result = await createSubscription({
        tier: 'premium',
        payment_method_id: 'mock_payment_method_123',
      })
      
      if ('data' in result) {
        // Update subscription tier in Redux state
        dispatch(updateSubscriptionTier('premium'))
        
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

  // Show loading spinner while checking auth status
  if (isLoading) {
    return (
      <Center minH="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="purple.500" thickness="4px" />
          <Text color="gray.600">Loading...</Text>
        </VStack>
      </Center>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Show upgrade prompt if premium is required but user is free tier
  if (requirePremium && !isPremium) {
    return (
      <Center minH="100vh" p={4}>
        <Box
          maxW="500px"
          p={8}
          borderWidth="1px"
          borderRadius="lg"
          boxShadow="lg"
          textAlign="center"
        >
          <VStack spacing={6}>
            <Box fontSize="4xl">🔒</Box>
            <Heading size="lg">Premium Feature</Heading>
            <Text color="gray.600">
              This feature is available exclusively for Premium subscribers.
              Upgrade now to unlock AI-powered insights, advanced analytics, and more!
            </Text>
            <Button
              colorScheme="purple"
              size="lg"
              onClick={handleUpgrade}
              isLoading={isCreatingSubscription || isProcessing}
              loadingText="Processing..."
            >
              Upgrade to Premium
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                window.history.back()
              }}
            >
              Go Back
            </Button>
          </VStack>
        </Box>
      </Center>
    )
  }

  // Render protected content
  return <>{children}</>
}
