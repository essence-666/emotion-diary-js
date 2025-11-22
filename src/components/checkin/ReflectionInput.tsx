import React from 'react'
import {
  Box,
  Textarea,
  FormControl,
  FormLabel,
  Text,
  HStack,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react'
import { CloseIcon } from '@chakra-ui/icons'

interface ReflectionInputProps {
  value: string
  onChange: (value: string) => void
  maxLength?: number
}

export const ReflectionInput: React.FC<ReflectionInputProps> = ({
  value,
  onChange,
  maxLength = 500,
}) => {
  const labelColor = useColorModeValue('gray.700', 'gray.200')
  const counterColor = useColorModeValue('gray.500', 'gray.400')
  const warningColor = useColorModeValue('orange.500', 'orange.300')
  const borderColor = useColorModeValue('gray.300', 'gray.600')
  const focusBorderColor = useColorModeValue('purple.500', 'purple.300')

  const charCount = value.length
  const isNearLimit = charCount >= maxLength * 0.9 // 90% of max length

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  const handleClear = () => {
    onChange('')
  }

  return (
    <FormControl>
      <FormLabel color={labelColor} fontWeight="semibold">
        Reflection
      </FormLabel>

      <Box position="relative">
        <Textarea
          value={value}
          onChange={handleChange}
          placeholder="How are you feeling? What's on your mind?"
          maxLength={maxLength}
          rows={6}
          resize="vertical"
          borderColor={borderColor}
          focusBorderColor={focusBorderColor}
          _hover={{
            borderColor: focusBorderColor,
          }}
          pr={value ? '40px' : '12px'} // Add padding for clear button when text exists
        />

        {/* Clear Button */}
        {value && (
          <IconButton
            aria-label="Clear text"
            icon={<CloseIcon boxSize={3} />}
            size="sm"
            variant="ghost"
            position="absolute"
            top="8px"
            right="8px"
            onClick={handleClear}
            colorScheme="gray"
          />
        )}
      </Box>

      {/* Character Counter */}
      <HStack justify="flex-end" mt={2}>
        <Text
          fontSize="sm"
          color={isNearLimit ? warningColor : counterColor}
          fontWeight={isNearLimit ? 'semibold' : 'normal'}
        >
          {charCount}/{maxLength}
        </Text>
      </HStack>
    </FormControl>
  )
}
