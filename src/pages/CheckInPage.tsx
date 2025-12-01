import React from 'react'
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Spinner,
  Center,
  useMediaQuery,
  useColorModeValue,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
} from '@chakra-ui/react'
import { QuickCheckIn } from '../components/checkin/QuickCheckIn'
import { useGetCheckinsQuery, useGetCheckinStatsQuery } from '../__data__/api'
import type { MoodCheckin } from '../types'

const CheckInPage = () => {
  const [isMobile] = useMediaQuery('(max-width: 768px)')
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const textSecondary = useColorModeValue('gray.600', 'gray.400')

  // Fetch check-in data
  const { data: checkins = [], isLoading: checkinsLoading } = useGetCheckinsQuery({ page: 1, limit: 10 })
  const { data: stats, isLoading: statsLoading } = useGetCheckinStatsQuery({ days: 7 })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getEmotionEmoji = (emotionId: number): string => {
    const emojiMap: Record<number, string> = {
      1: '😊', // happy
      2: '😢', // sad
      3: '😡', // angry
      4: '😌', // calm
      5: '😰', // stressed
      6: '🎉', // excited
    }
    return emojiMap[emotionId] || '😐'
  }

  return (
    <Box minH="100vh" bg={bgColor} py={6} data-testid="checkin-page">
      <Container maxW="container.xl">
        {/* Header */}
        <VStack spacing={6} align="stretch">
          <Heading size="xl" data-testid="checkin-page-title">
            Mood Check-In
          </Heading>

          {/* Layout: Mobile stacked, Desktop side-by-side */}
          {isMobile ? (
            <VStack spacing={6} align="stretch" data-testid="checkin-mobile-layout">
              {/* Statistics Section */}
              <Box
                bg={cardBg}
                borderRadius="lg"
                p={6}
                borderWidth="1px"
                borderColor={borderColor}
                data-testid="statistics-section"
              >
                <Heading size="md" mb={4}>
                  Your Progress
                </Heading>
                {statsLoading ? (
                  <Center py={4}>
                    <Spinner size="sm" />
                  </Center>
                ) : (
                  <SimpleGrid columns={2} spacing={4} data-testid="streak-info">
                    <Stat>
                      <StatLabel>Current Streak</StatLabel>
                      <StatNumber>{stats?.streak_count || 0}</StatNumber>
                      <StatHelpText>days in a row</StatHelpText>
                    </Stat>
                    <Stat>
                      <StatLabel>Total Check-ins</StatLabel>
                      <StatNumber>{stats?.total_checkins || 0}</StatNumber>
                      <StatHelpText>all time</StatHelpText>
                    </Stat>
                  </SimpleGrid>
                )}
              </Box>

              {/* Quick Check-In Form */}
              <Box
                bg={cardBg}
                borderRadius="lg"
                p={6}
                borderWidth="1px"
                borderColor={borderColor}
              >
                <QuickCheckIn />
              </Box>

              {/* Recent Check-ins */}
              <Box
                bg={cardBg}
                borderRadius="lg"
                p={6}
                borderWidth="1px"
                borderColor={borderColor}
                data-testid="recent-checkins-section"
              >
                <Heading size="md" mb={4}>
                  Recent Check-Ins
                </Heading>
                {checkinsLoading ? (
                  <Center py={8} data-testid="checkins-loading">
                    <VStack spacing={4}>
                      <Spinner size="lg" colorScheme="purple" />
                      <Text color={textSecondary}>Loading check-ins...</Text>
                    </VStack>
                  </Center>
                ) : checkins.length === 0 ? (
                  <Center py={8} data-testid="checkins-empty-state">
                    <VStack spacing={3}>
                      <Text fontSize="4xl">📊</Text>
                      <Text fontSize="lg" fontWeight="bold" color={textSecondary}>
                        No check-ins yet
                      </Text>
                      <Text fontSize="sm" color={textSecondary} textAlign="center">
                        Start tracking your emotions by creating your first check-in above!
                      </Text>
                    </VStack>
                  </Center>
                ) : (
                  <VStack spacing={3} align="stretch" data-testid="checkins-list">
                    {checkins.map((checkin: MoodCheckin) => (
                      <Box
                        key={checkin.id}
                        p={4}
                        borderWidth="1px"
                        borderColor={borderColor}
                        borderRadius="md"
                        _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
                        transition="all 0.2s"
                      >
                        <HStack justifyContent="space-between" alignItems="start">
                          <HStack spacing={3}>
                            <Text fontSize="2xl">{getEmotionEmoji(checkin.emotion_id)}</Text>
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="medium">
                                Intensity: {checkin.intensity}/10
                              </Text>
                              {checkin.reflection_text && (
                                <Text fontSize="sm" color={textSecondary} noOfLines={2}>
                                  {checkin.reflection_text}
                                </Text>
                              )}
                            </VStack>
                          </HStack>
                          <Text fontSize="xs" color={textSecondary}>
                            {formatDate(checkin.created_at)}
                          </Text>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                )}
              </Box>
            </VStack>
          ) : (
            <SimpleGrid columns={2} spacing={6} data-testid="checkin-desktop-layout">
              {/* Left Column: Quick Check-In + Statistics */}
              <VStack spacing={6} align="stretch">
                {/* Statistics Section */}
                <Box
                  bg={cardBg}
                  borderRadius="lg"
                  p={6}
                  borderWidth="1px"
                  borderColor={borderColor}
                  data-testid="statistics-section"
                >
                  <Heading size="md" mb={4}>
                    Your Progress
                  </Heading>
                  {statsLoading ? (
                    <Center py={4}>
                      <Spinner size="sm" />
                    </Center>
                  ) : (
                    <SimpleGrid columns={2} spacing={4} data-testid="streak-info">
                      <Stat>
                        <StatLabel>Current Streak</StatLabel>
                        <StatNumber>{stats?.streak_count || 0}</StatNumber>
                        <StatHelpText>days in a row</StatHelpText>
                      </Stat>
                      <Stat>
                        <StatLabel>Total Check-ins</StatLabel>
                        <StatNumber>{stats?.total_checkins || 0}</StatNumber>
                        <StatHelpText>all time</StatHelpText>
                      </Stat>
                    </SimpleGrid>
                  )}
                </Box>

                {/* Quick Check-In Form */}
                <Box
                  bg={cardBg}
                  borderRadius="lg"
                  p={6}
                  borderWidth="1px"
                  borderColor={borderColor}
                >
                  <QuickCheckIn />
                </Box>
              </VStack>

              {/* Right Column: Recent Check-ins */}
              <Box
                bg={cardBg}
                borderRadius="lg"
                p={6}
                borderWidth="1px"
                borderColor={borderColor}
                data-testid="recent-checkins-section"
              >
                <Heading size="md" mb={4}>
                  Recent Check-Ins
                </Heading>
                {checkinsLoading ? (
                  <Center py={8} data-testid="checkins-loading">
                    <VStack spacing={4}>
                      <Spinner size="lg" colorScheme="purple" />
                      <Text color={textSecondary}>Loading check-ins...</Text>
                    </VStack>
                  </Center>
                ) : checkins.length === 0 ? (
                  <Center py={8} data-testid="checkins-empty-state">
                    <VStack spacing={3}>
                      <Text fontSize="4xl">📊</Text>
                      <Text fontSize="lg" fontWeight="bold" color={textSecondary}>
                        No check-ins yet
                      </Text>
                      <Text fontSize="sm" color={textSecondary} textAlign="center">
                        Start tracking your emotions by creating your first check-in!
                      </Text>
                    </VStack>
                  </Center>
                ) : (
                  <VStack spacing={3} align="stretch" data-testid="checkins-list">
                    {checkins.map((checkin: MoodCheckin) => (
                      <Box
                        key={checkin.id}
                        p={4}
                        borderWidth="1px"
                        borderColor={borderColor}
                        borderRadius="md"
                        _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
                        transition="all 0.2s"
                      >
                        <HStack justifyContent="space-between" alignItems="start">
                          <HStack spacing={3}>
                            <Text fontSize="2xl">{getEmotionEmoji(checkin.emotion_id)}</Text>
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="medium">
                                Intensity: {checkin.intensity}/10
                              </Text>
                              {checkin.reflection_text && (
                                <Text fontSize="sm" color={textSecondary} noOfLines={2}>
                                  {checkin.reflection_text}
                                </Text>
                              )}
                            </VStack>
                          </HStack>
                          <Text fontSize="xs" color={textSecondary}>
                            {formatDate(checkin.created_at)}
                          </Text>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                )}
              </Box>
            </SimpleGrid>
          )}
        </VStack>
      </Container>
    </Box>
  )
}

export default CheckInPage
