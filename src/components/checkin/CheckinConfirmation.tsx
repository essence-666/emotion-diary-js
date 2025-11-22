import React, { useEffect } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  VStack,
  Text,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react'
import { CheckCircleIcon } from '@chakra-ui/icons'
import { motion, AnimatePresence } from 'framer-motion'

interface CheckinConfirmationProps {
  isOpen: boolean
  onClose: () => void
  emotionName: string
  streak: number
}

const MotionModalContent = motion(ModalContent)

const AUTO_DISMISS_DELAY = 2000 // 2 seconds

export const CheckinConfirmation: React.FC<CheckinConfirmationProps> = ({
  isOpen,
  onClose,
  emotionName,
  streak,
}) => {
  const iconColor = useColorModeValue('green.500', 'green.300')
  const textColor = useColorModeValue('gray.800', 'white')
  const streakColor = useColorModeValue('orange.500', 'orange.300')

  // Auto-dismiss after 2 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose()
      }, AUTO_DISMISS_DELAY)

      return () => clearTimeout(timer)
    }
  }, [isOpen, onClose])

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
      <AnimatePresence>
        {isOpen && (
          <MotionModalContent
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 25,
            }}
          >
            <ModalBody py={8}>
              <VStack spacing={4}>
                {/* Large Checkmark */}
                <Icon
                  as={CheckCircleIcon}
                  boxSize={16}
                  color={iconColor}
                  as={motion.svg}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 0.1,
                    type: 'spring',
                    stiffness: 400,
                    damping: 20,
                  }}
                />

                {/* Success Message */}
                <Text
                  fontSize="2xl"
                  fontWeight="bold"
                  color={textColor}
                  textAlign="center"
                >
                  Mood logged!
                </Text>

                {/* Emotion Name */}
                <Text
                  fontSize="lg"
                  color={textColor}
                  textAlign="center"
                >
                  You're feeling <strong>{emotionName}</strong>
                </Text>

                {/* Streak Display */}
                <Text
                  fontSize="md"
                  color={streakColor}
                  fontWeight="semibold"
                  textAlign="center"
                >
                  {streak}-day streak! 🔥
                </Text>
              </VStack>
            </ModalBody>
          </MotionModalContent>
        )}
      </AnimatePresence>
    </Modal>
  )
}
