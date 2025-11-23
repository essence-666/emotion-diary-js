import React from 'react'
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Progress,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react'
import { WarningIcon } from '@chakra-ui/icons'
import { formatDistanceToNow } from 'date-fns'

interface PetStatsProps {
  name: string
  happiness: number // 0-100
  lastInteraction: string // ISO timestamp
}

// Helper function to get status text based on happiness
const getHappinessStatus = (happiness: number): string => {
  if (happiness <= 20) return 'Critical'
  if (happiness <= 50) return 'Unhappy'
  if (happiness <= 80) return 'Content'
  return 'Delighted'
}

// Helper function to get color scheme based on happiness
const getHappinessColorScheme = (happiness: number): string => {
  if (happiness <= 20) return 'red'
  if (happiness <= 50) return 'yellow'
  if (happiness <= 80) return 'green'
  return 'purple'
}

export const PetStats: React.FC<PetStatsProps> = ({
  name,
  happiness,
  lastInteraction,
}) => {
  const status = getHappinessStatus(happiness)
  const colorScheme = getHappinessColorScheme(happiness)
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const isCritical = happiness <= 20

  // Format last interaction time
  const lastInteractionText = lastInteraction
    ? `Last interaction: ${formatDistanceToNow(new Date(lastInteraction), { addSuffix: true })}`
    : 'Never interacted'

  return (
    <Box
      data-testid="pet-stats"
      bg={cardBg}
      borderRadius="xl"
      p={6}
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow="md"
      width="100%"
      maxWidth="400px"
    >
      <VStack spacing={4} align="stretch">
        {/* Pet Name */}
        <Heading size="lg" textAlign="center">
          {name}
        </Heading>

        {/* Happiness Status */}
        <HStack justify="space-between">
          <HStack>
            <Text fontSize="lg" fontWeight="bold">
              {status}
            </Text>
            {isCritical && (
              <Icon as={WarningIcon} color="red.500" boxSize={5} />
            )}
          </HStack>
          <Text fontSize="lg" fontWeight="bold" color={`${colorScheme}.500`}>
            {happiness}%
          </Text>
        </HStack>

        {/* Happiness Progress Bar */}
        <Progress
          value={happiness}
          colorScheme={colorScheme}
          size="lg"
          borderRadius="full"
          hasStripe
          isAnimated
        />

        {/* Last Interaction */}
        <Text
          fontSize="sm"
          color={useColorModeValue('gray.600', 'gray.400')}
          textAlign="center"
        >
          {lastInteractionText}
        </Text>

        {/* Critical Warning */}
        {isCritical && (
          <Box
            bg="red.50"
            borderRadius="md"
            p={3}
            borderWidth="1px"
            borderColor="red.200"
          >
            <Text fontSize="sm" color="red.600" fontWeight="medium">
              ⚠️ Your pet needs attention! Happiness is critically low.
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  )
}
