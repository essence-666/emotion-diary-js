import React, { useEffect } from 'react'
import { Box, Text, useColorModeValue } from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'

interface PetDialogueProps {
  message: string
  messageType?: 'feed' | 'pet' | 'talk'
  onDismiss?: () => void
}

const MotionBox = motion(Box)

// Remove all emojis from text
const removeEmojis = (text: string): string => {
  return text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim()
}

export const PetDialogue: React.FC<PetDialogueProps> = ({
  message,
  messageType,
  onDismiss,
}) => {
  const bgColor = useColorModeValue('rgba(255, 255, 255, 0.95)', 'rgba(45, 55, 72, 0.95)')
  const textColor = useColorModeValue('gray.800', 'white')
  const borderColor = useColorModeValue('purple.400', 'purple.300')

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
        position="absolute"
        top="-80px"
        left="50%"
        transform="translateX(-50%)"
        initial={{ opacity: 0, y: 20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.8 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        bg={bgColor}
        color={textColor}
        borderRadius="2xl"
        px={6}
        py={4}
        maxWidth="320px"
        boxShadow="2xl"
        borderWidth="2px"
        borderColor={borderColor}
        zIndex={10}
        backdropFilter="blur(10px)"
        _before={{
          content: '""',
          position: 'absolute',
          bottom: '-12px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '12px solid transparent',
          borderRight: '12px solid transparent',
          borderTop: `12px solid ${borderColor}`,
        }}
        _after={{
          content: '""',
          position: 'absolute',
          bottom: '-8px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '10px solid transparent',
          borderRight: '10px solid transparent',
          borderTop: `10px solid ${bgColor}`,
        }}
      >
        <Text
          fontSize="md"
          textAlign="center"
          fontWeight="medium"
          lineHeight="1.5"
        >
          {cleanMessage}
        </Text>
      </MotionBox>
    </AnimatePresence>
  )
}
