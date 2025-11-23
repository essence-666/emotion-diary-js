import React from 'react'
import { motion, Variants } from 'framer-motion'
import { Box } from '@chakra-ui/react'

export type AnimationState = 'idle' | 'eating' | 'being_petted' | 'talking'
export type CosmeticSkin = 'default' | 'rainbow' | 'golden'

interface PetAvatarProps {
  happiness: number // 0-100
  animationState: AnimationState
  cosmeticSkin?: CosmeticSkin
}

// Helper function to get color based on happiness level
const getHappinessColors = (happiness: number, skin?: CosmeticSkin) => {
  if (skin === 'rainbow') {
    return {
      primary: 'url(#rainbow-gradient)',
      secondary: 'url(#rainbow-gradient)',
      accent: '#FFD700',
    }
  }
  if (skin === 'golden') {
    return {
      primary: '#FFD700',
      secondary: '#FFA500',
      accent: '#FF8C00',
    }
  }

  // Default fox colors adjusted by happiness
  if (happiness <= 20) {
    return {
      primary: '#8B7355', // Dull brown
      secondary: '#C8B088', // Dull beige
      accent: '#6B5D52',
    }
  } else if (happiness <= 50) {
    return {
      primary: '#D2691E', // Chocolate
      secondary: '#F4A460', // Sandy brown
      accent: '#CD853F',
    }
  } else if (happiness <= 80) {
    return {
      primary: '#FF8C42', // Orange
      secondary: '#FFD9B3', // Light orange
      accent: '#FF6B35',
    }
  } else {
    return {
      primary: '#FF7043', // Bright orange
      secondary: '#FFCCBC', // Very light orange
      accent: '#F4511E', // Deep orange
    }
  }
}

// Animation variants
const bodyVariants: Variants = {
  idle: {
    y: [0, -8, 0],
    rotate: [0, -1, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
  eating: {
    y: [0, 15, 0],
    rotate: [0, 5, 0],
    transition: {
      duration: 0.6,
      repeat: 4,
    },
  },
  being_petted: {
    y: [0, -5, 0],
    rotate: [-3, 3, -3],
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.5,
      repeat: 6,
    },
  },
  talking: {
    y: [0, -10, 0],
    rotate: [0, 2, -2, 0],
    transition: {
      duration: 0.4,
      repeat: 8,
    },
  },
}

const tailVariants: Variants = {
  idle: {
    rotate: [0, 15, 0],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
  eating: {
    rotate: [0, -10, 0],
    transition: {
      duration: 0.6,
      repeat: 4,
    },
  },
  being_petted: {
    rotate: [0, 25, -25, 25, 0],
    transition: {
      duration: 0.3,
      repeat: 10,
    },
  },
  talking: {
    rotate: [0, 10, 0],
    transition: {
      duration: 0.4,
      repeat: 8,
    },
  },
}

const earVariants: Variants = {
  idle: {
    rotate: [0, -3, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
  eating: {
    rotate: [0, -8, 0],
    transition: {
      duration: 0.6,
      repeat: 4,
    },
  },
  being_petted: {
    rotate: [0, 10, -10, 0],
    transition: {
      duration: 0.4,
      repeat: 8,
    },
  },
  talking: {
    rotate: [0, 5, 0],
    transition: {
      duration: 0.4,
      repeat: 8,
    },
  },
}

export const PetAvatar: React.FC<PetAvatarProps> = ({
  happiness,
  animationState,
  cosmeticSkin = 'default',
}) => {
  const colors = getHappinessColors(happiness, cosmeticSkin)

  return (
    <Box position="relative" width="500px" height="500px">
      <motion.svg
        data-testid="pet-avatar-svg"
        width="500"
        height="500"
        viewBox="0 0 500 500"
        initial="idle"
        animate={animationState}
      >
        {/* Gradients */}
        <defs>
          <linearGradient id="rainbow-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF0080" />
            <stop offset="25%" stopColor="#FF8C00" />
            <stop offset="50%" stopColor="#FFD700" />
            <stop offset="75%" stopColor="#00FF00" />
            <stop offset="100%" stopColor="#0080FF" />
          </linearGradient>
          <radialGradient id="body-gradient">
            <stop offset="0%" stopColor={colors.secondary} />
            <stop offset="100%" stopColor={colors.primary} />
          </radialGradient>
        </defs>

        {/* Shadow */}
        <ellipse
          cx="250"
          cy="480"
          rx="120"
          ry="20"
          fill="rgba(0, 0, 0, 0.2)"
        />

        <motion.g variants={bodyVariants}>
          {/* Tail (behind body) */}
          <motion.g
            variants={tailVariants}
            style={{ originX: '160px', originY: '370px' }}
          >
            <path
              data-testid="pet-body"
              d="M 160 370 Q 120 340, 110 300 Q 105 260, 120 230 Q 130 210, 150 220 Q 140 260, 160 290 Q 180 320, 160 370 Z"
              fill={colors.primary}
              stroke={colors.accent}
              strokeWidth="2"
            />
            <path
              d="M 130 230 Q 125 250, 135 270 Q 145 290, 155 300"
              fill={colors.secondary}
              opacity="0.6"
            />
          </motion.g>

          {/* Back leg (left) */}
          <g>
            <motion.rect
              x="180"
              y="380"
              width="30"
              height="80"
              rx="15"
              fill={colors.primary}
              animate={{
                height: animationState === 'being_petted' ? [80, 75, 80] : 80,
              }}
              transition={{ duration: 0.3, repeat: animationState === 'being_petted' ? 8 : 0 }}
            />
            <ellipse cx="195" cy="465" rx="20" ry="10" fill={colors.accent} />
          </g>

          {/* Back leg (right) */}
          <g>
            <motion.rect
              x="290"
              y="380"
              width="30"
              height="80"
              rx="15"
              fill={colors.primary}
              animate={{
                height: animationState === 'being_petted' ? [80, 75, 80] : 80,
              }}
              transition={{ duration: 0.3, repeat: animationState === 'being_petted' ? 8 : 0, delay: 0.1 }}
            />
            <ellipse cx="305" cy="465" rx="20" ry="10" fill={colors.accent} />
          </g>

          {/* Main body */}
          <ellipse
            cx="250"
            cy="350"
            rx="100"
            ry="80"
            fill="url(#body-gradient)"
            stroke={colors.accent}
            strokeWidth="2"
          />

          {/* Chest/belly */}
          <ellipse
            cx="250"
            cy="360"
            rx="70"
            ry="60"
            fill={colors.secondary}
            opacity="0.8"
          />

          {/* Front leg (left) */}
          <g>
            <motion.rect
              x="200"
              y="390"
              width="28"
              height="85"
              rx="14"
              fill={colors.primary}
              animate={{
                y: animationState === 'eating' ? [390, 395, 390] : 390,
              }}
              transition={{ duration: 0.6, repeat: animationState === 'eating' ? 4 : 0 }}
            />
            <ellipse cx="214" cy="478" rx="18" ry="10" fill={colors.accent} />
          </g>

          {/* Front leg (right) */}
          <g>
            <motion.rect
              x="272"
              y="390"
              width="28"
              height="85"
              rx="14"
              fill={colors.primary}
              animate={{
                y: animationState === 'eating' ? [390, 395, 390] : 390,
              }}
              transition={{ duration: 0.6, repeat: animationState === 'eating' ? 4 : 0, delay: 0.1 }}
            />
            <ellipse cx="286" cy="478" rx="18" ry="10" fill={colors.accent} />
          </g>

          {/* Neck */}
          <ellipse
            cx="250"
            cy="300"
            rx="50"
            ry="40"
            fill={colors.primary}
          />

          {/* Head */}
          <ellipse
            cx="250"
            cy="230"
            rx="70"
            ry="65"
            fill={colors.primary}
            stroke={colors.accent}
            strokeWidth="2"
          />

          {/* Snout */}
          <ellipse
            cx="250"
            cy="260"
            rx="45"
            ry="35"
            fill={colors.secondary}
          />

          {/* Nose */}
          <ellipse
            cx="250"
            cy="275"
            rx="12"
            ry="10"
            fill="#2D3748"
          />

          {/* Mouth */}
          {happiness > 50 ? (
            <motion.path
              d="M 230 285 Q 250 295 270 285"
              stroke="#2D3748"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              animate={{
                d: animationState === 'talking'
                  ? ['M 230 285 Q 250 295 270 285', 'M 230 285 Q 250 292 270 285']
                  : 'M 230 285 Q 250 295 270 285',
              }}
              transition={{ duration: 0.2, repeat: animationState === 'talking' ? Infinity : 0 }}
            />
          ) : happiness > 20 ? (
            <line
              x1="230"
              y1="290"
              x2="270"
              y2="290"
              stroke="#2D3748"
              strokeWidth="3"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M 230 295 Q 250 288 270 295"
              stroke="#2D3748"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          )}

          {/* Left ear */}
          <motion.g
            variants={earVariants}
            style={{ originX: '220px', originY: '180px' }}
          >
            <path
              d="M 220 200 L 200 160 L 230 185 Z"
              fill={colors.primary}
              stroke={colors.accent}
              strokeWidth="2"
            />
            <path
              d="M 215 190 L 205 170 L 220 185 Z"
              fill={colors.secondary}
              opacity="0.7"
            />
          </motion.g>

          {/* Right ear */}
          <motion.g
            variants={earVariants}
            style={{ originX: '280px', originY: '180px' }}
          >
            <path
              d="M 280 200 L 300 160 L 270 185 Z"
              fill={colors.primary}
              stroke={colors.accent}
              strokeWidth="2"
            />
            <path
              d="M 285 190 L 295 170 L 280 185 Z"
              fill={colors.secondary}
              opacity="0.7"
            />
          </motion.g>

          {/* Left eye */}
          <motion.g
            animate={{
              scaleY: animationState === 'idle' ? [1, 0.1, 1] : 1,
            }}
            transition={{
              duration: 0.2,
              repeat: animationState === 'idle' ? Infinity : 0,
              repeatDelay: 4,
            }}
            style={{ originY: '235px' }}
          >
            <ellipse
              cx="225"
              cy="235"
              rx="12"
              ry="16"
              fill="white"
            />
            <ellipse
              cx="227"
              cy="237"
              rx="8"
              ry="10"
              fill="#2D3748"
            />
            <ellipse
              cx="228"
              cy="235"
              rx="3"
              ry="4"
              fill="white"
            />
          </motion.g>

          {/* Right eye */}
          <motion.g
            animate={{
              scaleY: animationState === 'idle' ? [1, 0.1, 1] : 1,
            }}
            transition={{
              duration: 0.2,
              repeat: animationState === 'idle' ? Infinity : 0,
              repeatDelay: 4,
              delay: 0.05,
            }}
            style={{ originY: '235px' }}
          >
            <ellipse
              cx="275"
              cy="235"
              rx="12"
              ry="16"
              fill="white"
            />
            <ellipse
              cx="273"
              cy="237"
              rx="8"
              ry="10"
              fill="#2D3748"
            />
            <ellipse
              cx="272"
              cy="235"
              rx="3"
              ry="4"
              fill="white"
            />
          </motion.g>

          {/* Whiskers */}
          <g opacity="0.7">
            <line x1="180" y1="250" x2="120" y2="245" stroke="#2D3748" strokeWidth="2" />
            <line x1="180" y1="260" x2="120" y2="265" stroke="#2D3748" strokeWidth="2" />
            <line x1="320" y1="250" x2="380" y2="245" stroke="#2D3748" strokeWidth="2" />
            <line x1="320" y1="260" x2="380" y2="265" stroke="#2D3748" strokeWidth="2" />
          </g>

          {/* Cheek blush (when happy) */}
          {happiness > 70 && (
            <>
              <ellipse cx="195" cy="250" rx="15" ry="12" fill="#FF69B4" opacity="0.3" />
              <ellipse cx="305" cy="250" rx="15" ry="12" fill="#FF69B4" opacity="0.3" />
            </>
          )}
        </motion.g>
      </motion.svg>
    </Box>
  )
}
