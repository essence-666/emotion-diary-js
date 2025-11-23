import React from 'react'
import { Box } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useColorModeValue } from '@chakra-ui/react'

const MotionBox = motion(Box)

export const AnimatedBackground: React.FC = () => {
  const skyGradient = useColorModeValue(
    'linear-gradient(180deg, #87CEEB 0%, #E0F6FF 100%)',
    'linear-gradient(180deg, #1a2332 0%, #2d3748 100%)'
  )
  const grassColor = useColorModeValue('#7CB342', '#2d5016')
  const treeColor = useColorModeValue('#2E7D32', '#1a4d1a')
  const cloudColor = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(100, 116, 139, 0.3)')

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      overflow="hidden"
      zIndex={0}
      data-testid="animated-background"
    >
      {/* Sky */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        height="70%"
        background={skyGradient}
      />

      {/* Clouds */}
      <MotionBox
        position="absolute"
        top="10%"
        left="-10%"
        width="200px"
        height="80px"
        borderRadius="50%"
        background={cloudColor}
        animate={{
          x: ['0vw', '120vw'],
        }}
        transition={{
          duration: 60,
          repeat: Infinity,
          ease: 'linear',
        }}
        _before={{
          content: '""',
          position: 'absolute',
          top: '20px',
          left: '30px',
          width: '100px',
          height: '50px',
          borderRadius: '50%',
          background: cloudColor,
        }}
        _after={{
          content: '""',
          position: 'absolute',
          top: '10px',
          left: '80px',
          width: '80px',
          height: '60px',
          borderRadius: '50%',
          background: cloudColor,
        }}
      />

      <MotionBox
        position="absolute"
        top="20%"
        left="-15%"
        width="180px"
        height="70px"
        borderRadius="50%"
        background={cloudColor}
        animate={{
          x: ['0vw', '120vw'],
        }}
        transition={{
          duration: 80,
          repeat: Infinity,
          ease: 'linear',
        }}
        _before={{
          content: '""',
          position: 'absolute',
          top: '15px',
          left: '40px',
          width: '90px',
          height: '45px',
          borderRadius: '50%',
          background: cloudColor,
        }}
      />

      {/* Ground */}
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        height="30%"
        background={grassColor}
      />

      {/* Trees in background */}
      {[...Array(6)].map((_, i) => (
        <Box
          key={`tree-${i}`}
          position="absolute"
          bottom="30%"
          left={`${-5 + i * 18}%`}
          width="120px"
          height="350px"
        >
          {/* Trunk */}
          <Box
            position="absolute"
            bottom={0}
            left="50%"
            transform="translateX(-50%)"
            width="30px"
            height="120px"
            background="#6D4C41"
            borderRadius="4px"
          />
          {/* Foliage - Layer 1 (bottom, largest) */}
          <Box
            position="absolute"
            bottom="100px"
            left="50%"
            transform="translateX(-50%)"
            width={0}
            height={0}
            borderLeft="60px solid transparent"
            borderRight="60px solid transparent"
            borderBottom={`120px solid ${treeColor}`}
          />
          {/* Foliage - Layer 2 */}
          <Box
            position="absolute"
            bottom="180px"
            left="50%"
            transform="translateX(-50%)"
            width={0}
            height={0}
            borderLeft="50px solid transparent"
            borderRight="50px solid transparent"
            borderBottom={`100px solid ${treeColor}`}
            opacity={0.9}
          />
          {/* Foliage - Layer 3 */}
          <Box
            position="absolute"
            bottom="240px"
            left="50%"
            transform="translateX(-50%)"
            width={0}
            height={0}
            borderLeft="40px solid transparent"
            borderRight="40px solid transparent"
            borderBottom={`80px solid ${treeColor}`}
            opacity={0.85}
          />
          {/* Foliage - Layer 4 (top) */}
          <Box
            position="absolute"
            bottom="280px"
            left="50%"
            transform="translateX(-50%)"
            width={0}
            height={0}
            borderLeft="30px solid transparent"
            borderRight="30px solid transparent"
            borderBottom={`60px solid ${treeColor}`}
            opacity={0.8}
          />
        </Box>
      ))}

      {/* Grass blades */}
      {[...Array(20)].map((_, i) => (
        <MotionBox
          key={`grass-${i}`}
          position="absolute"
          bottom="28%"
          left={`${i * 5}%`}
          width="4px"
          height="30px"
          background={grassColor}
          borderRadius="2px 2px 0 0"
          transformOrigin="bottom"
          animate={{
            rotate: [0, 3, -3, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Fireflies/particles */}
      {[...Array(8)].map((_, i) => (
        <MotionBox
          key={`firefly-${i}`}
          position="absolute"
          width="4px"
          height="4px"
          borderRadius="50%"
          background="rgba(255, 223, 0, 0.8)"
          boxShadow="0 0 10px rgba(255, 223, 0, 0.6)"
          animate={{
            x: [
              Math.random() * window.innerWidth,
              Math.random() * window.innerWidth,
              Math.random() * window.innerWidth,
            ],
            y: [
              Math.random() * window.innerHeight * 0.7,
              Math.random() * window.innerHeight * 0.7,
              Math.random() * window.innerHeight * 0.7,
            ],
            opacity: [0, 1, 0.5, 1, 0],
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: Math.random() * 5,
          }}
        />
      ))}

      {/* Butterflies */}
      {[...Array(3)].map((_, i) => (
        <MotionBox
          key={`butterfly-${i}`}
          position="absolute"
          animate={{
            x: ['0vw', '100vw'],
            y: [
              `${30 + Math.random() * 20}%`,
              `${20 + Math.random() * 20}%`,
              `${30 + Math.random() * 20}%`,
            ],
          }}
          transition={{
            duration: 20 + i * 5,
            repeat: Infinity,
            ease: 'linear',
            delay: i * 7,
          }}
        >
          <svg width="24" height="20" viewBox="0 0 24 20">
            <motion.path
              d="M8 10 Q6 6, 4 8 T2 10 Q4 12, 6 10 Z"
              fill="#FF69B4"
              animate={{ rotate: [0, 10, 0] }}
              transition={{ duration: 0.3, repeat: Infinity }}
            />
            <motion.path
              d="M16 10 Q18 6, 20 8 T22 10 Q20 12, 18 10 Z"
              fill="#FF1493"
              animate={{ rotate: [0, -10, 0] }}
              transition={{ duration: 0.3, repeat: Infinity }}
            />
            <path d="M12 4 L12 16" stroke="#000" strokeWidth="2" />
          </svg>
        </MotionBox>
      ))}
    </Box>
  )
}
