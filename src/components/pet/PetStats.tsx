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
import { MdPets, MdFavorite, MdAccessTime } from 'react-icons/md'
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
      borderRadius="lg"
      p={3}
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow="md"
      width="100%"
      maxWidth="280px"
    >
      <VStack spacing={2} align="stretch">
        {/* Pet Name with Icon */}
        <HStack justify="center" spacing={2}>
          <Icon as={MdPets} boxSize={5} color={`${colorScheme}.500`} />
          <Heading size="md">
            {name}
          </Heading>
        </HStack>

        {/* Happiness with Heart Icon */}
        <HStack spacing={2} align="center">
          <Icon as={MdFavorite} boxSize={4} color={`${colorScheme}.500`} />
          <Text fontSize="sm" fontWeight="medium" flex={1}>
            {status}
          </Text>
          {isCritical && (
            <Icon as={WarningIcon} color="red.500" boxSize={4} />
          )}
          <Text fontSize="sm" fontWeight="bold" color={`${colorScheme}.500`}>
            {happiness}%
          </Text>
        </HStack>

        {/* Happiness Progress Bar */}
        <Progress
          value={happiness}
          colorScheme={colorScheme}
          size="sm"
          borderRadius="full"
          hasStripe
          isAnimated
        />

        {/* Last Interaction with Clock Icon */}
        <HStack spacing={1.5} justify="center">
          <Icon as={MdAccessTime} boxSize={3.5} color={useColorModeValue('gray.500', 'gray.400')} />
          <Text
            fontSize="xs"
            color={useColorModeValue('gray.600', 'gray.400')}
          >
            {lastInteractionText}
          </Text>
        </HStack>

        {/* Critical Warning */}
        {isCritical && (
          <Box
            bg="red.50"
            borderRadius="md"
            p={2}
            borderWidth="1px"
            borderColor="red.200"
          >
            <Text fontSize="xs" color="red.600" fontWeight="medium">
              ⚠️ Your pet needs attention!
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  )
}
