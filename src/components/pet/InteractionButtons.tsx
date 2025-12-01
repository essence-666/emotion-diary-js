import React, { useState, useEffect } from 'react'
import { Button, HStack, VStack, Icon } from '@chakra-ui/react'
import { MdRestaurant, MdPets, MdChat } from 'react-icons/md'

interface InteractionButtonsProps {
  onFeed: () => void
  onPet: () => void
  onTalk: () => void
  isLoading: boolean
}

// Cooldown durations in milliseconds
const COOLDOWNS = {
  feed: 4 * 60 * 60 * 1000, // 4 hours
  pet: 1 * 60 * 60 * 1000, // 1 hour
  talk: 30 * 60 * 1000, // 30 minutes
}

// Helper to format time remaining
const formatTimeRemaining = (ms: number): string => {
  const hours = Math.floor(ms / (60 * 60 * 1000))
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000))

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

// Helper to check if cooldown is active
const getCooldownRemaining = (key: string): number => {
  const cooldownEnd = localStorage.getItem(key)
  if (!cooldownEnd) return 0

  const remaining = parseInt(cooldownEnd) - Date.now()
  return remaining > 0 ? remaining : 0
}

// Helper to set cooldown
const setCooldown = (key: string, duration: number) => {
  const cooldownEnd = Date.now() + duration
  localStorage.setItem(key, cooldownEnd.toString())
}

export const InteractionButtons: React.FC<InteractionButtonsProps> = ({
  onFeed,
  onPet,
  onTalk,
  isLoading,
}) => {
  const [feedCooldown, setFeedCooldown] = useState(0)
  const [petCooldown, setPetCooldown] = useState(0)
  const [talkCooldown, setTalkCooldown] = useState(0)

  // Poll cooldowns every second
  useEffect(() => {
    const updateCooldowns = () => {
      setFeedCooldown(getCooldownRemaining('pet_feed_cooldown'))
      setPetCooldown(getCooldownRemaining('pet_pet_cooldown'))
      setTalkCooldown(getCooldownRemaining('pet_talk_cooldown'))
    }

    // Initial update
    updateCooldowns()

    // Update every second
    const interval = setInterval(updateCooldowns, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleFeed = () => {
    setCooldown('pet_feed_cooldown', COOLDOWNS.feed)
    setFeedCooldown(COOLDOWNS.feed)
    onFeed()
  }

  const handlePet = () => {
    setCooldown('pet_pet_cooldown', COOLDOWNS.pet)
    setPetCooldown(COOLDOWNS.pet)
    onPet()
  }

  const handleTalk = () => {
    setCooldown('pet_talk_cooldown', COOLDOWNS.talk)
    setTalkCooldown(COOLDOWNS.talk)
    onTalk()
  }

  const feedDisabled = isLoading || feedCooldown > 0
  const petDisabled = isLoading || petCooldown > 0
  const talkDisabled = isLoading || talkCooldown > 0

  return (
    <VStack spacing={4} width="100%" maxWidth="500px">
      <HStack spacing={4} width="100%">
        {/* Feed Button */}
        <Button
          data-testid="feed-button"
          onClick={handleFeed}
          isDisabled={feedDisabled}
          colorScheme="orange"
          size="md"
          height="70px"
          flex={1}
          fontSize="md"
          _hover={{
            transform: 'scale(1.05)',
            boxShadow: 'xl',
          }}
          transition="all 0.2s"
          paddingY={3}
          paddingX={4}
        >
          <VStack spacing={0.5}>
            <Icon as={MdRestaurant} boxSize={6} />
            <span>Feed</span>
            {feedCooldown > 0 && (
              <span style={{ fontSize: '0.75rem' }}>
                {formatTimeRemaining(feedCooldown)}
              </span>
            )}
          </VStack>
        </Button>

        {/* Pet Button */}
        <Button
          data-testid="pet-button"
          onClick={handlePet}
          isDisabled={petDisabled}
          colorScheme="pink"
          size="md"
          height="70px"
          flex={1}
          fontSize="md"
          _hover={{
            transform: 'scale(1.05)',
            boxShadow: 'xl',
          }}
          transition="all 0.2s"
          paddingY={3}
          paddingX={4}
        >
          <VStack spacing={0.5}>
            <Icon as={MdPets} boxSize={6} />
            <span>Pet</span>
            {petCooldown > 0 && (
              <span style={{ fontSize: '0.75rem' }}>
                {formatTimeRemaining(petCooldown)}
              </span>
            )}
          </VStack>
        </Button>

        {/* Talk Button */}
        <Button
          data-testid="talk-button"
          onClick={handleTalk}
          isDisabled={talkDisabled}
          colorScheme="purple"
          size="md"
          height="70px"
          flex={1}
          fontSize="md"
          _hover={{
            transform: 'scale(1.05)',
            boxShadow: 'xl',
          }}
          transition="all 0.2s"
          paddingY={3}
          paddingX={4}
        >
          <VStack spacing={0.5}>
            <Icon as={MdChat} boxSize={6} />
            <span>Talk</span>
            {talkCooldown > 0 && (
              <span style={{ fontSize: '0.75rem' }}>
                {formatTimeRemaining(talkCooldown)}
              </span>
            )}
          </VStack>
        </Button>
      </HStack>
    </VStack>
  )
}
