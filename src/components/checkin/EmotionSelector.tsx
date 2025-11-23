import React from 'react'
import { SimpleGrid, Button, VStack, Text, useColorModeValue } from '@chakra-ui/react'
import { motion, Variants } from 'framer-motion'

export type EmotionType = 'happy' | 'sad' | 'angry' | 'calm' | 'stressed' | 'excited'

interface Emotion {
  id: EmotionType
  name: string
  emoji: string
  color: string
}

interface EmotionSelectorProps {
  onSelect: (emotion: EmotionType) => void
  selectedEmotion?: EmotionType | null
}

// Emotion data with colors from frontend.md
export const EMOTIONS: Emotion[] = [
  { id: 'happy', name: 'Happy', emoji: '😊', color: '#fbbf24' },
  { id: 'sad', name: 'Sad', emoji: '😢', color: '#60a5fa' },
  { id: 'angry', name: 'Angry', emoji: '😠', color: '#ef5350' },
  { id: 'calm', name: 'Calm', emoji: '😌', color: '#a78bfa' },
  { id: 'stressed', name: 'Stressed', emoji: '😰', color: '#fb7185' },
  { id: 'excited', name: 'Excited', emoji: '🎉', color: '#ec4899' },
]

// Framer Motion variants for stagger animation
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
}

const MotionButton = motion(Button)

export const EmotionSelector: React.FC<EmotionSelectorProps> = ({
  onSelect,
  selectedEmotion = null,
}) => {
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const textColor = useColorModeValue('gray.800', 'white')

  return (
    <SimpleGrid
      columns={3}
      spacing={4}
      as={motion.div}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {EMOTIONS.map((emotion) => {
        const isSelected = selectedEmotion === emotion.id

        return (
          <MotionButton
            key={emotion.id}
            variants={itemVariants}
            onClick={() => onSelect(emotion.id)}
            h="100px"
            borderRadius="xl"
            borderWidth="2px"
            borderColor={isSelected ? emotion.color : borderColor}
            bg={isSelected ? `${emotion.color}20` : 'transparent'}
            _hover={{
              bg: `${emotion.color}30`,
              transform: 'translateY(-2px)',
              boxShadow: 'lg',
            }}
            _active={{
              transform: 'scale(0.95)',
            }}
            transition="all 0.2s"
            transform={isSelected ? 'scale(1.05)' : 'scale(1)'}
            boxShadow={isSelected ? `0 0 20px ${emotion.color}80` : 'none'}
            tabIndex={0}
            aria-label={`Select ${emotion.name} emotion`}
          >
            <VStack spacing={2}>
              <Text fontSize="3xl" role="img" aria-label={emotion.name}>
                {emotion.emoji}
              </Text>
              <Text
                fontSize="sm"
                fontWeight={isSelected ? 'bold' : 'medium'}
                color={textColor}
              >
                {emotion.name}
              </Text>
            </VStack>
          </MotionButton>
        )
      })}
    </SimpleGrid>
  )
}
