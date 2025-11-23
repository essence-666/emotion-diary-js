import React from 'react'
import {
  Box,
  Card,
  CardBody,
  Heading,
  Text,
  HStack,
  VStack,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import type { DiaryEntry as DiaryEntryType } from '../../types'

interface DiaryEntryProps {
  entry: DiaryEntryType
  onClick?: (entry: DiaryEntryType) => void
  moodData?: Array<{ emotion: string; color: string }> // Optional mood data for heat map
}

// Utility function to format date
const formatDate = (dateString: string): { date: string; dayOfWeek: string } => {
  const date = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
  const dayOptions: Intl.DateTimeFormatOptions = { weekday: 'long' }
  
  return {
    date: date.toLocaleDateString('en-US', options),
    dayOfWeek: date.toLocaleDateString('en-US', dayOptions),
  }
}

// Utility function to calculate reading time
const calculateReadingTime = (content: string): string => {
  const wordsPerMinute = 200
  const wordCount = content.trim().split(/\s+/).length
  const minutes = Math.ceil(wordCount / wordsPerMinute)
  return `${minutes} min read`
}

// Utility function to truncate content
const truncateContent = (content: string, maxLength: number = 200): string => {
  if (content.length <= maxLength) return content
  return content.substring(0, maxLength).trim() + '...'
}

// Utility function to get auto-title from content
const getAutoTitle = (content: string, maxLength: number = 50): string => {
  if (content.length <= maxLength) return content
  return content.substring(0, maxLength).trim() + '...'
}

const MotionCard = motion(Card)

export const DiaryEntry: React.FC<DiaryEntryProps> = ({ entry, onClick, moodData = [] }) => {
  const { date, dayOfWeek } = formatDate(entry.created_at)
  const readingTime = calculateReadingTime(entry.content)
  const previewContent = truncateContent(entry.content, 200)
  const displayTitle = entry.title || getAutoTitle(entry.content, 50)

  // Color mode values
  const cardBg = useColorModeValue('white', 'gray.700')
  const cardBorder = useColorModeValue('gray.200', 'gray.600')
  const textSecondary = useColorModeValue('gray.600', 'gray.400')
  const textMuted = useColorModeValue('gray.500', 'gray.500')
  const hoverShadow = useColorModeValue('xl', 'dark-lg')

  // Default mood colors if no mood data provided
  const defaultMoods = [
    { emotion: 'happy', color: '#fbbf24' },
    { emotion: 'sad', color: '#60a5fa' },
    { emotion: 'angry', color: '#ef5350' },
    { emotion: 'calm', color: '#a78bfa' },
    { emotion: 'stressed', color: '#fb7185' },
  ]

  const moodsToShow = moodData.length > 0 ? moodData.slice(0, 5) : defaultMoods.slice(0, 5)

  const handleClick = () => {
    if (onClick) {
      onClick(entry)
    }
  }

  return (
    <MotionCard
      data-testid="diary-entry-card"
      bg={cardBg}
      borderColor={cardBorder}
      borderWidth="1px"
      borderRadius="md"
      p={4}
      cursor={onClick ? 'pointer' : 'default'}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          handleClick()
        }
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{
        scale: 1.02,
        boxShadow: hoverShadow,
      }}
      _hover={{
        transform: 'scale(1.02)',
        transition: 'transform 0.2s ease-in-out',
      }}
    >
      <CardBody p={0}>
        <VStack align="stretch" spacing={3}>
          {/* Header: Date and Day */}
          <HStack justify="space-between" align="flex-start">
            <VStack align="flex-start" spacing={0}>
              <Text fontSize="sm" fontWeight="semibold" color={textSecondary}>
                {date}
              </Text>
              <Text fontSize="xs" color={textMuted}>
                {dayOfWeek}
              </Text>
            </VStack>
            <Text fontSize="xs" color={textMuted}>
              {readingTime}
            </Text>
          </HStack>

          {/* Title */}
          <Heading size="md" noOfLines={2}>
            {displayTitle}
          </Heading>

          {/* Mood Heat Map (5 circles) */}
          <HStack spacing={2}>
            {moodsToShow.map((mood, index) => (
              <Box
                key={index}
                data-testid={`mood-circle-${index}`}
                w="8px"
                h="8px"
                borderRadius="full"
                bg={mood.color}
                opacity={moodData.length > 0 ? 1 : 0.3} // Dimmed if no actual mood data
              />
            ))}
          </HStack>

          {/* Content Preview */}
          <Text fontSize="sm" color={textSecondary} noOfLines={4}>
            {previewContent}
          </Text>

          {/* Tags */}
          {entry.tags && entry.tags.length > 0 && (
            <HStack spacing={2} flexWrap="wrap">
              {entry.tags.map((tag) => (
                <Badge
                  key={tag.id}
                  colorScheme="purple"
                  variant="subtle"
                  fontSize="xs"
                  px={2}
                  py={1}
                  style={{ backgroundColor: tag.color + '20', color: tag.color }}
                >
                  {tag.name}
                </Badge>
              ))}
            </HStack>
          )}
        </VStack>
      </CardBody>
    </MotionCard>
  )
}

