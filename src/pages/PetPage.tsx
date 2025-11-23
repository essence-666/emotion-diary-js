import React, { useState } from 'react'
import {
  Box,
  VStack,
  Flex,
  Spinner,
  Text,
  useColorModeValue,
  useToast,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import { AnimatedBackground } from '../components/pet/AnimatedBackground'
import { PetAvatar, AnimationState } from '../components/pet/PetAvatar'
import { PetStats } from '../components/pet/PetStats'
import { InteractionButtons } from '../components/pet/InteractionButtons'
import { PetDialogue } from '../components/pet/PetDialogue'
import {
  useGetPetQuery,
  useFeedPetMutation,
  usePetPetMutation,
  useTalkToPetMutation,
} from '../__data__/api'

const PetPage = () => {
  const toast = useToast()

  // Fetch pet data
  const { data: pet, isLoading, error } = useGetPetQuery()

  // Mutations
  const [feedPet, { isLoading: isFeedingLoading }] = useFeedPetMutation()
  const [petPet, { isLoading: isPettingLoading }] = usePetPetMutation()
  const [talkToPet, { isLoading: isTalkingLoading }] = useTalkToPetMutation()

  // Local state for optimistic updates and animations
  const [localHappiness, setLocalHappiness] = useState<number | null>(null)
  const [animationState, setAnimationState] = useState<AnimationState>('idle')
  const [dialogue, setDialogue] = useState<string>('')

  // Combined loading state
  const isInteractionLoading = isFeedingLoading || isPettingLoading || isTalkingLoading

  // Use local happiness if available, otherwise use pet data
  const currentHappiness = localHappiness ?? pet?.happiness_level ?? 50

  // Handle Feed interaction
  const handleFeed = async () => {
    if (!pet) return

    // Optimistic update
    setLocalHappiness(Math.min(100, currentHappiness + 10))
    setAnimationState('eating')
    setDialogue('That was delicious!')

    try {
      const result = await feedPet().unwrap()
      setLocalHappiness(result.happiness_level)

      toast({
        title: 'Pet fed successfully!',
        description: `Happiness +10 (now ${result.happiness_level})`,
        status: 'success',
        duration: 3000,
        position: 'top',
      })

      // Trigger vibration on mobile
      if (navigator.vibrate) {
        navigator.vibrate(100)
      }
    } catch (err) {
      // Rollback on error
      setLocalHappiness(pet.happiness_level)
      setDialogue('')

      toast({
        title: 'Failed to feed pet',
        description: 'Please try again',
        status: 'error',
        duration: 3000,
        position: 'top',
      })
    } finally {
      setTimeout(() => {
        setAnimationState('idle')
        setDialogue('')
      }, 3000)
    }
  }

  // Handle Pet interaction
  const handlePet = async () => {
    if (!pet) return

    // Optimistic update
    setLocalHappiness(Math.min(100, currentHappiness + 5))
    setAnimationState('being_petted')
    setDialogue('That feels great!')

    try {
      const result = await petPet().unwrap()
      setLocalHappiness(result.happiness_level)

      toast({
        title: 'Pet petted successfully!',
        description: `Happiness +5 (now ${result.happiness_level})`,
        status: 'success',
        duration: 3000,
        position: 'top',
      })

      // Trigger vibration on mobile
      if (navigator.vibrate) {
        navigator.vibrate([50, 50, 50])
      }
    } catch (err) {
      // Rollback on error
      setLocalHappiness(pet.happiness_level)
      setDialogue('')

      toast({
        title: 'Failed to pet',
        description: 'Please try again',
        status: 'error',
        duration: 3000,
        position: 'top',
      })
    } finally {
      setTimeout(() => {
        setAnimationState('idle')
        setDialogue('')
      }, 3000)
    }
  }

  // Handle Talk interaction
  const handleTalk = async () => {
    if (!pet) return

    // Optimistic update
    setLocalHappiness(Math.min(100, currentHappiness + 2))
    setAnimationState('talking')

    try {
      const result = await talkToPet().unwrap()
      setLocalHappiness(result.pet.happiness_level)
      setDialogue(result.dialogue)

      toast({
        title: 'Chatted with pet!',
        description: `Happiness +2 (now ${result.pet.happiness_level})`,
        status: 'success',
        duration: 3000,
        position: 'top',
      })

      // Trigger vibration on mobile
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
    } catch (err) {
      // Rollback on error
      setLocalHappiness(pet.happiness_level)
      setDialogue('...')

      toast({
        title: 'Failed to talk',
        description: 'Please try again',
        status: 'error',
        duration: 3000,
        position: 'top',
      })
    } finally {
      setTimeout(() => {
        setAnimationState('idle')
        setDialogue('')
      }, 3000)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <Box
        data-testid="pet-page"
        position="relative"
        minH="100vh"
        overflow="hidden"
      >
        <AnimatedBackground />
        <Flex
          position="relative"
          zIndex={1}
          minH="100vh"
          align="center"
          justify="center"
        >
          <VStack spacing={4}>
            <Spinner size="xl" color="purple.500" thickness="4px" />
            <Text fontSize="lg" color="white" textShadow="0 2px 4px rgba(0,0,0,0.3)">
              Loading your pet...
            </Text>
          </VStack>
        </Flex>
      </Box>
    )
  }

  // Error state
  if (error || !pet) {
    return (
      <Box
        data-testid="pet-page"
        position="relative"
        minH="100vh"
        overflow="hidden"
      >
        <AnimatedBackground />
        <Flex
          position="relative"
          zIndex={1}
          minH="100vh"
          align="center"
          justify="center"
          p={6}
        >
          <Alert
            status="error"
            maxWidth="500px"
            borderRadius="lg"
            boxShadow="xl"
            bg="red.50"
          >
            <AlertIcon />
            <VStack align="flex-start" spacing={2}>
              <Text fontWeight="bold">Failed to load pet data</Text>
              <Text fontSize="sm">
                {(error as any)?.data?.message || 'Please try refreshing the page'}
              </Text>
            </VStack>
          </Alert>
        </Flex>
      </Box>
    )
  }

  return (
    <Box
      data-testid="pet-page"
      position="relative"
      minH="100vh"
      overflow="hidden"
    >
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Game Content */}
      <Flex
        position="relative"
        zIndex={1}
        direction="column"
        align="center"
        justify="center"
        minH="100vh"
        px={4}
        py={8}
      >
        {/* Top HUD: Stats */}
        <Box
          position="fixed"
          top={4}
          left="50%"
          transform="translateX(-50%)"
          zIndex={20}
        >
          <PetStats
            name={pet.name}
            happiness={currentHappiness}
            lastInteraction={pet.last_interaction}
          />
        </Box>

        {/* Center: Pet with Dialogue */}
        <Flex
          flex={1}
          align="center"
          justify="center"
          position="relative"
          minH="500px"
        >
          <Box position="relative">
            {/* Dialogue above pet */}
            {dialogue && (
              <PetDialogue
                message={dialogue}
                onDismiss={() => setDialogue('')}
              />
            )}

            {/* Pet Avatar */}
            <PetAvatar
              happiness={currentHappiness}
              animationState={animationState}
              cosmeticSkin={pet.cosmetic_skin as any}
            />
          </Box>
        </Flex>

        {/* Bottom HUD: Interaction Buttons */}
        <Box
          position="fixed"
          bottom={8}
          left="50%"
          transform="translateX(-50%)"
          zIndex={20}
        >
          <InteractionButtons
            onFeed={handleFeed}
            onPet={handlePet}
            onTalk={handleTalk}
            isLoading={isInteractionLoading}
          />
        </Box>
      </Flex>
    </Box>
  )
}

export default PetPage
