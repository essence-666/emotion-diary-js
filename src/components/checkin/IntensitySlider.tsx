import React from 'react'
import {
  Box,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'

interface IntensitySliderProps {
  value: number
  onChange: (value: number) => void
}

export const IntensitySlider: React.FC<IntensitySliderProps> = ({ value, onChange }) => {
  const labelColor = useColorModeValue('gray.700', 'gray.200')
  const thumbBg = useColorModeValue('white', 'gray.200')
  const thumbBorder = useColorModeValue('purple.500', 'purple.300')

  // Calculate the color based on intensity (green to red gradient)
  // 1-3: green, 4-7: yellow/orange, 8-10: red
  const getColorForValue = (val: number): string => {
    if (val <= 3) return '#48bb78' // green.500
    if (val <= 5) return '#ecc94b' // yellow.400
    if (val <= 7) return '#ed8936' // orange.400
    return '#f56565' // red.400
  }

  const currentColor = getColorForValue(value)

  return (
    <VStack spacing={4} w="full" align="stretch">
      {/* Value Display */}
      <Text
        fontSize="lg"
        fontWeight="semibold"
        textAlign="center"
        color={labelColor}
      >
        Intensity: {value}/10
      </Text>

      {/* Slider */}
      <Box px={2}>
        <Slider
          aria-label="Emotion intensity"
          min={1}
          max={10}
          step={1}
          value={value}
          onChange={onChange}
          focusThumbOnChange={false}
        >
          <SliderTrack
            bg="gray.200"
            h="8px"
            borderRadius="full"
            overflow="hidden"
          >
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bgGradient="linear(to-r, green.500, yellow.400, orange.400, red.400)"
            />
            <SliderFilledTrack bg="transparent" />
          </SliderTrack>
          <SliderThumb
            boxSize={6}
            bg={thumbBg}
            borderWidth="3px"
            borderColor={currentColor}
            boxShadow={`0 0 0 3px ${currentColor}40`}
            _focus={{
              boxShadow: `0 0 0 3px ${currentColor}60`,
            }}
            _active={{
              transform: 'scale(1.2)',
            }}
            transition="all 0.2s"
          />
        </Slider>
      </Box>

      {/* Intensity Labels */}
      <Box display="flex" justifyContent="space-between" px={2}>
        <Text fontSize="sm" color={labelColor}>
          Low
        </Text>
        <Text fontSize="sm" color={labelColor}>
          High
        </Text>
      </Box>
    </VStack>
  )
}
