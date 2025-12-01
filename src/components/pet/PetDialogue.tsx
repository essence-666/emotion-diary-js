import React, { useEffect } from 'react'
import { Box, Text, useColorModeValue } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'

interface PetDialogueProps {
  message: string
  messageType?: 'feed' | 'pet' | 'talk'
  onDismiss?: () => void
  index?: number
}

const MotionBox = motion(Box)

// Remove all emojis from text
const removeEmojis = (text: string): string => {
  return text
    .replace(
      /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu,
      '',
    )
    .trim()
}

export const PetDialogue: React.FC<PetDialogueProps> = ({
  message,
  messageType,
  onDismiss,
  index = 0,
}) => {
  const bgColor = useColorModeValue(
    'rgba(255, 255, 255, 0.95)',
    'rgba(45, 55, 72, 0.95)',
  )
  const textColor = useColorModeValue('gray.800', 'white')
  const borderColor = useColorModeValue('purple.400', 'purple.300')

  // Calculate bottom position based on index (stack them vertically)
  const bottomPosition = 24 + index * 80 // 24px base + 80px per message

  useEffect(() => {
    if (message && onDismiss) {
      // Auto-dismiss after 3 seconds
      const timer = setTimeout(() => {
        onDismiss()
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [message, onDismiss])

  if (!message) {
    return null
  }

  const cleanMessage = removeEmojis(message)

  return (
    <AnimatePresence>
      <MotionBox
        data-testid="pet-dialogue"
        position="fixed"
        bottom={`${bottomPosition}px`}
        right="24px"
        initial={{ opacity: 0, x: 100, y: 20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, x: 50, y: 10 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        bg={bgColor}
        color={textColor}
        borderRadius="2xl"
        px={5}
        py={3}
        minWidth="200px"
        maxWidth="320px"
        boxShadow="lg"
        borderWidth="1px"
        borderColor={borderColor}
        zIndex={1000}
        backdropFilter="blur(20px) saturate(180%)"
        pointerEvents="auto"
        _after={{
          content: '""',
          position: 'absolute',
          bottom: '8px',
          right: '-8px',
          width: 0,
          height: 0,
          borderLeft: `10px solid ${bgColor}`,
          borderTop: '6px solid transparent',
          borderBottom: '6px solid transparent',
          filter: 'drop-shadow(2px 0px 2px rgba(0, 0, 0, 0.1))',
        }}
        sx={{
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        }}
      >
        <Text
          fontSize="sm"
          textAlign="left"
          fontWeight="medium"
          lineHeight="1.4"
        >
          {cleanMessage}
        </Text>
      </MotionBox>
    </AnimatePresence>
  )
}
