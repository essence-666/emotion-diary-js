import React, { useState } from 'react'
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardHeader,
  CardBody,
  Button,
  VStack,
  HStack,
  Badge,
  Icon,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react'
import { FiSmile, FiTrendingUp, FiHeart, FiCalendar } from 'react-icons/fi'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { useCreateSubscriptionMutation } from '../__data__/api'
import { useAppDispatch } from '../__data__/store'
import { updateSubscriptionTier } from '../__data__/slices/authSlice'

export const Dashboard: React.FC = () => {
  const { user, isPremium } = useAuth()
  const navigate = useNavigate()
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

  // Color mode values
  const textSecondary = useColorModeValue('gray.600', 'gray.400')
  const textTertiary = useColorModeValue('gray.700', 'gray.300')
  const upgradeBg = useColorModeValue('purple.50', 'purple.900')
  const upgradeBorder = useColorModeValue('purple.200', 'purple.600')
  const upgradeText = useColorModeValue('purple.700', 'purple.200')

  return (
    <VStack spacing={8} align="stretch">
      {/* Welcome Section */}
      <Box>
        <Heading size="lg" mb={2}>
          Welcome back, {user?.username || 'User'}! 👋
        </Heading>
        <Text color={textSecondary}>
          How are you feeling today? Track your emotions and take care of your mental health.
        </Text>
      </Box>

      {/* Quick Stats */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={4}>
        <Card>
          <CardBody>
            <Stat>
              <HStack justify="space-between">
                <Box>
                  <StatLabel>Current Streak</StatLabel>
                  <StatNumber>7 days</StatNumber>
                  <StatHelpText>Keep it up!</StatHelpText>
                </Box>
                <Icon as={FiTrendingUp} boxSize={8} color="green.500" />
              </HStack>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <HStack justify="space-between">
                <Box>
                  <StatLabel>Check-ins Today</StatLabel>
                  <StatNumber>3</StatNumber>
                  <StatHelpText>Great progress</StatHelpText>
                </Box>
                <Icon as={FiSmile} boxSize={8} color="purple.500" />
              </HStack>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <HStack justify="space-between">
                <Box>
                  <StatLabel>Pet Happiness</StatLabel>
                  <StatNumber>85%</StatNumber>
                  <StatHelpText>Very happy!</StatHelpText>
                </Box>
                <Icon as={FiHeart} boxSize={8} color="pink.500" />
              </HStack>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <HStack justify="space-between">
                <Box>
                  <StatLabel>Total Entries</StatLabel>
                  <StatNumber>42</StatNumber>
                  <StatHelpText>Since you joined</StatHelpText>
                </Box>
                <Icon as={FiCalendar} boxSize={8} color="blue.500" />
              </HStack>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <Heading size="md">Quick Actions</Heading>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <Button
              colorScheme="purple"
              size="lg"
              leftIcon={<Icon as={FiSmile} />}
              onClick={() => navigate('/checkin')}
            >
              New Check-in
            </Button>
            <Button
              variant="outline"
              colorScheme="purple"
              size="lg"
              onClick={() => navigate('/diary')}
            >
              Write in Diary
            </Button>
            <Button
              variant="outline"
              colorScheme="purple"
              size="lg"
              onClick={() => navigate('/pet')}
            >
              Visit Your Pet
            </Button>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Subscription Status */}
      {!isPremium && (
        <Card bg={upgradeBg} borderColor={upgradeBorder} borderWidth={2}>
          <CardBody>
            <VStack spacing={4} align="flex-start">
              <HStack>
                <Badge colorScheme="purple" fontSize="md" px={3} py={1}>
                  FREE PLAN
                </Badge>
                <Text fontWeight="semibold" color={upgradeText}>
                  Upgrade to unlock more features!
                </Text>
              </HStack>
              <Text color={textTertiary}>
                Get access to AI-powered insights, advanced analytics, and unlimited diary entries
                with Emotion Diary Premium.
              </Text>
              <Button
                colorScheme="purple"
                size="md"
                onClick={handleUpgrade}
                isLoading={isCreatingSubscription || isProcessing}
                loadingText="Processing..."
              >
                Upgrade to Premium
              </Button>
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* Recent Activity placeholder */}
      <Card>
        <CardHeader>
          <Heading size="md">Recent Activity</Heading>
        </CardHeader>
        <CardBody>
          <Text color={textSecondary}>
            Your recent mood check-ins and diary entries will appear here...
          </Text>
        </CardBody>
      </Card>
    </VStack>
  )
}
