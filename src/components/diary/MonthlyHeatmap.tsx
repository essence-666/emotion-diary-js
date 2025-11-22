import React, { useState, useMemo } from 'react'
import {
  Box,
  Grid,
  GridItem,
  Heading,
  HStack,
  IconButton,
  Text,
  Tooltip,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react'
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons'
import { useGetMonthlyHeatmapQuery } from '../../__data__/api'
import type { MonthlyHeatmapData } from '../../types'

interface MonthlyHeatmapProps {
  onDateClick?: (date: string) => void
  initialYear?: number
  initialMonth?: number
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MAX_EMOTION_COUNT = 10 // Maximum expected emotion count for color scaling

export const MonthlyHeatmap: React.FC<MonthlyHeatmapProps> = ({
  onDateClick,
  initialYear,
  initialMonth,
}) => {
  const now = new Date()
  const [currentYear, setCurrentYear] = useState(initialYear || now.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(initialMonth || now.getMonth() + 1)

  // Fetch heatmap data
  const { data: heatmapData, isLoading } = useGetMonthlyHeatmapQuery({
    year: currentYear,
    month: currentMonth,
  })

  // Calculate calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth - 1, 1)
    const lastDay = new Date(currentYear, currentMonth, 0)
    const daysInMonth = lastDay.getDate()
    const startDayOfWeek = firstDay.getDay()

    const days: Array<{ day: number; date: string; data?: MonthlyHeatmapData }> = []

    // Add empty cells for days before month starts
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ day: 0, date: '' })
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const dayData = heatmapData?.find((d) => d.date === dateStr)
      days.push({ day, date: dateStr, data: dayData })
    }

    return days
  }, [currentYear, currentMonth, heatmapData])

  // Calculate color intensity based on emotion count
  const getColorIntensity = (emotionCount: number): string => {
    if (emotionCount === 0) return 'gray.100'
    
    const intensity = Math.min(emotionCount / MAX_EMOTION_COUNT, 1)
    const redIntensity = Math.floor(intensity * 255)
    const greenIntensity = Math.floor((1 - intensity) * 200)
    const blueIntensity = Math.floor((1 - intensity) * 200)
    
    return `rgb(${redIntensity}, ${greenIntensity}, ${blueIntensity})`
  }

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const handleCellClick = (date: string) => {
    if (date && onDateClick) {
      onDateClick(date)
    }
  }

  const isToday = (date: string): boolean => {
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    return date === todayStr
  }

  const monthName = new Date(currentYear, currentMonth - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const textColor = useColorModeValue('gray.800', 'white')
  const emptyCellBg = useColorModeValue('gray.50', 'gray.700')

  return (
    <Box
      bg={bgColor}
      borderRadius="lg"
      p={4}
      borderWidth="1px"
      borderColor={borderColor}
      data-testid="monthly-heatmap"
    >
      <VStack spacing={4} align="stretch">
        {/* Header with navigation */}
        <HStack justifyContent="space-between" alignItems="center">
          <IconButton
            aria-label="Previous month"
            icon={<ChevronLeftIcon />}
            onClick={handlePrevMonth}
            size="sm"
            variant="ghost"
          />
          <Heading size="md" textAlign="center" color={textColor}>
            {monthName}
          </Heading>
          <IconButton
            aria-label="Next month"
            icon={<ChevronRightIcon />}
            onClick={handleNextMonth}
            size="sm"
            variant="ghost"
          />
        </HStack>

        {/* Days of week header */}
        <Grid templateColumns="repeat(7, 1fr)" gap={1}>
          {DAYS_OF_WEEK.map((day) => (
            <GridItem key={day} textAlign="center" py={2}>
              <Text fontSize="xs" fontWeight="semibold" color={textColor}>
                {day}
              </Text>
            </GridItem>
          ))}
        </Grid>

        {/* Calendar grid */}
        <Grid templateColumns="repeat(7, 1fr)" gap={1} data-testid="heatmap-grid">
          {calendarDays.map(({ day, date, data }, index) => {
            if (day === 0) {
              // Empty cell
              return (
                <GridItem
                  key={`empty-${index}`}
                  bg={emptyCellBg}
                  borderRadius="md"
                  minH="40px"
                />
              )
            }

            const emotionCount = data?.emotion_count || 0
            const backgroundColor = getColorIntensity(emotionCount)
            const isCurrentDay = isToday(date)
            const cellBorder = isCurrentDay ? '2px solid' : '1px solid'
            const cellBorderColor = isCurrentDay ? 'blue.500' : borderColor

            const tooltipContent = data ? (
              <VStack align="stretch" spacing={1}>
                <Text fontWeight="bold">{date}</Text>
                <Text fontSize="sm">Emotions: {emotionCount}</Text>
                {data.emotions && data.emotions.length > 0 && (
                  <Text fontSize="xs">{data.emotions.join(', ')}</Text>
                )}
              </VStack>
            ) : (
              <Text>{date}</Text>
            )

            return (
              <Tooltip key={date} label={tooltipContent} hasArrow>
                <GridItem
                  data-testid={`heatmap-cell-${date}`}
                  bg={backgroundColor}
                  border={cellBorder}
                  borderColor={cellBorderColor}
                  borderRadius="md"
                  minH="40px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  cursor={date ? 'pointer' : 'default'}
                  onClick={() => handleCellClick(date)}
                  _hover={date ? { opacity: 0.8, transform: 'scale(1.05)' } : {}}
                  transition="all 0.2s"
                >
                  <Text fontSize="sm" fontWeight={isCurrentDay ? 'bold' : 'normal'} color={textColor}>
                    {day}
                  </Text>
                </GridItem>
              </Tooltip>
            )
          })}
        </Grid>

        {/* Loading state */}
        {isLoading && (
          <Text fontSize="sm" color={textColor} textAlign="center">
            Loading...
          </Text>
        )}
      </VStack>
    </Box>
  )
}

