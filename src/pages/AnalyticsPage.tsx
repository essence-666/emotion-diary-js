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
  useColorModeValue,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  Badge,
  Icon,
  Card,
  CardHeader,
  CardBody,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react'
import {
  FaBrain,
  FaLightbulb,
  FaExclamationTriangle,
  FaChartLine,
} from 'react-icons/fa'
import {
  useGetWeeklyInsightsQuery,
  useGetTriggersQuery,
  useGetRecommendationsQuery,
} from '../__data__/api'

const AnalyticsPage = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const textSecondary = useColorModeValue('gray.600', 'gray.400')

  // Helper function to get background color based on priority
  const getPriorityBgColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          light: 'red.50',
          dark: 'red.900',
          borderColor: 'red.500',
        }
      case 'medium':
        return {
          light: 'orange.50',
          dark: 'orange.900',
          borderColor: 'orange.500',
        }
      case 'low':
        return {
          light: 'blue.50',
          dark: 'blue.900',
          borderColor: 'blue.500',
        }
      default:
        return {
          light: 'gray.50',
          dark: 'gray.700',
          borderColor: 'gray.500',
        }
    }
  }

  // Fetch insights data
  const {
    data: weeklyData,
    isLoading: weeklyLoading,
    error: weeklyError,
  } = useGetWeeklyInsightsQuery()

  const {
    data: triggersData,
    isLoading: triggersLoading,
    error: triggersError,
  } = useGetTriggersQuery()

  const {
    data: recommendationsData,
    isLoading: recommendationsLoading,
    error: recommendationsError,
  } = useGetRecommendationsQuery()

  // Loading state
  if (weeklyLoading || triggersLoading || recommendationsLoading) {
    return (
      <Box minH="100vh" bg={bgColor} py={6}>
        <Container maxW="container.xl">
          <Center py={12}>
            <VStack spacing={4}>
              <Spinner size="xl" colorScheme="purple" />
              <Text color={textSecondary}>Loading analytics...</Text>
            </VStack>
          </Center>
        </Container>
      </Box>
    )
  }

  // Error state - check for 403 (Premium required)
  const hasError = weeklyError || triggersError || recommendationsError
  const is403Error =
    (weeklyError as any)?.status === 403 ||
    (triggersError as any)?.status === 403 ||
    (recommendationsError as any)?.status === 403

  if (hasError && is403Error) {
    return (
      <Box minH="100vh" bg={bgColor} py={6}>
        <Container maxW="container.xl">
          <Alert
            status="warning"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            height="200px"
            borderRadius="lg"
          >
            <AlertIcon boxSize="40px" mr={0} />
            <AlertTitle mt={4} mb={1} fontSize="lg">
              Premium Feature Required
            </AlertTitle>
            <AlertDescription maxWidth="sm">
              Analytics and AI-powered insights are available for Premium
              members only. Please upgrade your subscription to access these
              features.
            </AlertDescription>
          </Alert>
        </Container>
      </Box>
    )
  }

  if (hasError) {
    return (
      <Box minH="100vh" bg={bgColor} py={6}>
        <Container maxW="container.xl">
          <Alert status="error" borderRadius="lg">
            <AlertIcon />
            Failed to load analytics. Please try again later.
          </Alert>
        </Container>
      </Box>
    )
  }

  return (
    <Box minH="100vh" bg={bgColor} py={6} data-testid="analytics-page">
      <Container maxW="container.xl">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Heading size="xl" data-testid="analytics-page-title">
            <HStack spacing={2}>
              <Icon as={FaChartLine} />
              <Text>Analytics & Insights</Text>
            </HStack>
          </Heading>

          {/* Weekly Statistics */}
          {weeklyData?.statistics && (
            <Card
              bg={cardBg}
              borderRadius="lg"
              borderWidth="1px"
              borderColor={borderColor}
              data-testid="weekly-stats"
            >
              <CardHeader>
                <Heading size="md">
                  <HStack spacing={2}>
                    <Icon as={FaChartLine} color="blue.500" />
                    <Text>Weekly Statistics</Text>
                  </HStack>
                </Heading>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                  <Stat>
                    <StatLabel>Total Check-ins</StatLabel>
                    <StatNumber>
                      {weeklyData.statistics.total_checkins || 0}
                    </StatNumber>
                    <StatHelpText>This week</StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Current Streak</StatLabel>
                    <StatNumber>
                      {weeklyData.statistics.streak_count || 0}
                    </StatNumber>
                    <StatHelpText>Days in a row</StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Avg Intensity</StatLabel>
                    <StatNumber>
                      {Number(weeklyData.statistics.avg_intensity || 0).toFixed(1)}
                    </StatNumber>
                    <StatHelpText>Out of 10</StatHelpText>
                  </Stat>
                  <Stat>
                    <StatLabel>Emotions Tracked</StatLabel>
                    <StatNumber>
                      {Object.keys(
                        weeklyData.statistics.emotion_distribution || {}
                      ).length}
                    </StatNumber>
                    <StatHelpText>Different types</StatHelpText>
                  </Stat>
                </SimpleGrid>
              </CardBody>
            </Card>
          )}

          {/* AI Weekly Analysis */}
          {weeklyData?.ai_analysis && (
            <Card
              bg={cardBg}
              borderRadius="lg"
              borderWidth="1px"
              borderColor={borderColor}
              data-testid="ai-weekly-analysis"
            >
              <CardHeader>
                <Heading size="md">
                  <HStack spacing={2}>
                    <Icon as={FaBrain} color="purple.500" />
                    <Text>AI Weekly Analysis</Text>
                    <Badge colorScheme="purple" fontSize="xs">
                      AI-Powered
                    </Badge>
                  </HStack>
                </Heading>
              </CardHeader>
              <CardBody>
                <Text fontSize="md" lineHeight="tall" whiteSpace="pre-wrap">
                  {weeklyData.ai_analysis}
                </Text>
              </CardBody>
            </Card>
          )}

          {/* Emotion Triggers */}
          {triggersData && (
            <Card
              bg={cardBg}
              borderRadius="lg"
              borderWidth="1px"
              borderColor={borderColor}
              data-testid="emotion-triggers"
            >
              <CardHeader>
                <Heading size="md">
                  <HStack spacing={2}>
                    <Icon as={FaExclamationTriangle} color="orange.500" />
                    <Text>Emotion Triggers</Text>
                  </HStack>
                </Heading>
              </CardHeader>
              <CardBody>
                {triggersData.triggers && triggersData.triggers.length > 0 ? (
                  <VStack spacing={4} align="stretch">
                    {triggersData.triggers.map((trigger, index) => (
                      <Box
                        key={index}
                        p={4}
                        borderWidth="1px"
                        borderColor={borderColor}
                        borderRadius="md"
                        bg={useColorModeValue('gray.50', 'gray.700')}
                      >
                        <VStack align="start" spacing={2}>
                          <HStack spacing={2}>
                            <Badge colorScheme="orange">
                              {trigger.emotion}
                            </Badge>
                            <Text fontSize="sm" color={textSecondary}>
                              Frequency: {trigger.frequency}
                            </Text>
                          </HStack>
                          <Text fontWeight="medium">{trigger.trigger}</Text>
                          <Divider />
                          <Text fontSize="sm" color={textSecondary}>
                            <strong>Recommendation:</strong>{' '}
                            {trigger.recommendation}
                          </Text>
                        </VStack>
                      </Box>
                    ))}
                  </VStack>
                ) : (
                  <Box
                    p={4}
                    bg={useColorModeValue('orange.50', 'orange.900')}
                    borderRadius="md"
                  >
                    <Text fontSize="sm" color={textSecondary}>
                      No specific triggers identified in the selected period.
                      Continue tracking your emotions to discover patterns.
                    </Text>
                  </Box>
                )}

                {triggersData.ai_analysis && (
                  <Box mt={6}>
                    <Divider mb={4} />
                    <Heading size="sm" mb={2}>
                      <HStack spacing={2}>
                        <Icon as={FaBrain} color="purple.500" />
                        <Text>AI Analysis</Text>
                      </HStack>
                    </Heading>
                    <Text fontSize="sm" lineHeight="tall" whiteSpace="pre-wrap">
                      {triggersData.ai_analysis}
                    </Text>
                  </Box>
                )}
              </CardBody>
            </Card>
          )}

          {/* Recommendations */}
          {recommendationsData?.recommendations &&
            recommendationsData.recommendations.length > 0 && (
              <Card
                bg={cardBg}
                borderRadius="lg"
                borderWidth="1px"
                borderColor={borderColor}
                data-testid="recommendations"
              >
                <CardHeader>
                  <Heading size="md">
                    <HStack spacing={2}>
                      <Icon as={FaLightbulb} color="yellow.500" />
                      <Text>Personalized Recommendations</Text>
                    </HStack>
                  </Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    {recommendationsData.recommendations.map(
                      (recommendation, index) => {
                        const colors = getPriorityBgColor(recommendation.priority)
                        return (
                          <Box
                            key={index}
                            p={4}
                            borderLeftWidth="4px"
                            borderLeftColor={colors.borderColor}
                            bg={useColorModeValue(colors.light, colors.dark)}
                            borderRadius="md"
                          >
                            <VStack align="start" spacing={2}>
                              <HStack spacing={2} width="full" justifyContent="space-between">
                                <HStack spacing={2}>
                                  <Icon as={FaLightbulb} color={colors.borderColor} />
                                  <Text fontWeight="bold" fontSize="md">
                                    {recommendation.title}
                                  </Text>
                                </HStack>
                                <Badge
                                  colorScheme={
                                    recommendation.priority === 'high'
                                      ? 'red'
                                      : recommendation.priority === 'medium'
                                      ? 'orange'
                                      : 'blue'
                                  }
                                >
                                  {recommendation.priority}
                                </Badge>
                              </HStack>
                              <Text fontSize="sm" color={textSecondary}>
                                {recommendation.description}
                              </Text>
                              {recommendation.action && (
                                <Box
                                  mt={2}
                                  p={2}
                                  bg={useColorModeValue('white', 'gray.800')}
                                  borderRadius="md"
                                  width="full"
                                >
                                  <Text fontSize="xs" fontWeight="medium">
                                    💡 {recommendation.action}
                                  </Text>
                                </Box>
                              )}
                            </VStack>
                          </Box>
                        )
                      }
                    )}
                  </VStack>

                  {recommendationsData.ai_analysis && (
                    <Box mt={6}>
                      <Divider mb={4} />
                      <Heading size="sm" mb={2}>
                        <HStack spacing={2}>
                          <Icon as={FaBrain} color="purple.500" />
                          <Text>AI Analysis</Text>
                        </HStack>
                      </Heading>
                      <Text
                        fontSize="sm"
                        lineHeight="tall"
                        whiteSpace="pre-wrap"
                      >
                        {recommendationsData.ai_analysis}
                      </Text>
                    </Box>
                  )}
                </CardBody>
              </Card>
            )}
        </VStack>
      </Container>
    </Box>
  )
}

export default AnalyticsPage
