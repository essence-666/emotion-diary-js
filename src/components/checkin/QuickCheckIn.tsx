import React, { useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardBody,
  VStack,
  Heading,
  Alert,
  AlertIcon,
  AlertDescription,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react'
import { EmotionSelector } from './EmotionSelector'
import { IntensitySlider } from './IntensitySlider'
import { ReflectionInput } from './ReflectionInput'
import { CheckinConfirmation } from './CheckinConfirmation'
import { useCheckin } from '../../hooks/useCheckin'

export const QuickCheckIn: React.FC = () => {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null)
  const [intensity, setIntensity] = useState<number>(5)
  const [reflection, setReflection] = useState<string>('')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [confirmationData, setConfirmationData] = useState<{
    emotionName: string
    streak: number
  } | null>(null)

  const { submit, isLoading, error } = useCheckin()
  const toast = useToast()

  const cardBg = useColorModeValue('white', 'gray.800')
  const cardShadow = useColorModeValue('xl', 'dark-lg')
  const headingColor = useColorModeValue('gray.800', 'white')
  const gradientBg = useColorModeValue(
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #434343 0%, #000000 100%)'
  )

  const handleSubmit = async () => {
    if (!selectedEmotion) return

    try {
      const result = await submit({
        emotion: selectedEmotion,
        intensity,
        reflection,
      })

      if (result.success && result.data) {
        // Show confirmation modal
        setConfirmationData({
          emotionName: result.data.emotionName,
          streak: result.data.streak,
        })
        setShowConfirmation(true)

        // Show toast notification
        toast({
          title: 'Mood logged!',
          description: `You're feeling ${result.data.emotionName}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        })

        // Reset form after successful submit
        resetForm()
      }
    } catch (err) {
      console.error('Failed to submit check-in:', err)
    }
  }

  const resetForm = () => {
    setSelectedEmotion(null)
    setIntensity(5)
    setReflection('')
  }

  const handleConfirmationClose = () => {
    setShowConfirmation(false)
  }

  const isSubmitDisabled = !selectedEmotion || isLoading

  return (
    <Box
      minH="100vh"
      bgImage={gradientBg}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Card
        maxW="600px"
        w="100%"
        bg={cardBg}
        shadow={cardShadow}
        borderRadius="xl"
      >
        <CardBody p={{ base: 6, md: 8 }}>
          <VStack spacing={6} align="stretch">
            {/* Header */}
            <Heading
              as="h2"
              size="lg"
              textAlign="center"
              color={headingColor}
              mb={2}
            >
              How are you feeling?
            </Heading>

            {/* Error Alert */}
            {error && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Emotion Selector */}
            <EmotionSelector
              selectedEmotion={selectedEmotion}
              onSelect={setSelectedEmotion}
            />

            {/* Intensity Slider */}
            <IntensitySlider value={intensity} onChange={setIntensity} />

            {/* Reflection Input */}
            <ReflectionInput value={reflection} onChange={setReflection} />

            {/* Submit Button */}
            <Button
              colorScheme="purple"
              size="lg"
              w="100%"
              onClick={handleSubmit}
              isDisabled={isSubmitDisabled}
              isLoading={isLoading}
              loadingText="Logging mood..."
              mt={4}
            >
              Log Mood
            </Button>
          </VStack>
        </CardBody>
      </Card>

      {/* Confirmation Modal */}
      {confirmationData && (
        <CheckinConfirmation
          isOpen={showConfirmation}
          onClose={handleConfirmationClose}
          emotionName={confirmationData.emotionName}
          streak={confirmationData.streak}
        />
      )}
    </Box>
  )
}
