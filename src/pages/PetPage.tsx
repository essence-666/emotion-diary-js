import React, { useState, useMemo, useRef, useEffect } from 'react'
import {
  Box,
  VStack,
  Flex,
  Spinner,
  Text,
  useToast,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera, CameraControls, SoftShadows } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, DepthOfField } from '@react-three/postprocessing'
import type { CameraControls as CameraControlsImpl } from '@react-three/drei'
import { PCFSoftShadowMap, ACESFilmicToneMapping } from 'three'
import { AnimatedBackground } from '../components/pet/AnimatedBackground'
import { PetAvatar, AnimationState } from '../components/pet/PetAvatar'
import { PetStats } from '../components/pet/PetStats'
import { InteractionButtons } from '../components/pet/InteractionButtons'
import { PetDialogue } from '../components/pet/PetDialogue'
import {
  useGetPetQuery,
  useFeedPetMutation,
  usePetPetMutation,
  useTalkToPetMutation,
  useGetCheckinsQuery,
  useGetDiaryEntriesQuery,
} from '../__data__/api'
import type { MoodCheckin, DiaryEntry } from '../types'
import type { PetMoodState } from '../components/pet/PetAvatar'

/**
 * Configure renderer shadow maps, tone mapping, and exposure
 * 
 * Developer Notes:
 * - ACESFilmicToneMapping: Industry-standard tone mapping that handles HDR gracefully
 *   Prevents overexposure and provides natural-looking highlights
 * - toneMappingExposure: Controls overall scene brightness (0.6-1.2 range recommended)
 *   Lower values = darker scene, higher values = brighter scene
 *   Start at 0.8 for balanced lighting, adjust based on your scene
 */
const RendererConfig: React.FC = () => {
  const { gl } = useThree()
  
  useEffect(() => {
    // Shadow configuration
    gl.shadowMap.enabled = true
    gl.shadowMap.type = PCFSoftShadowMap
    
    // Tone mapping configuration - CRITICAL for preventing overexposure
    gl.toneMapping = ACESFilmicToneMapping
    gl.toneMappingExposure = 0.8 // Balanced exposure (0.6-1.2 range)
    
    // Output color space (sRGB for web) - Modern Three.js API
    // Note: outputEncoding is deprecated in r152+, use outputColorSpace instead
    if ('outputColorSpace' in gl) {
      ;(gl as any).outputColorSpace = 'srgb'
    } else {
      // Fallback for older Three.js versions
      ;(gl as any).outputEncoding = 3001 // sRGBEncoding
    }
  }, [gl])
  
  return null
}

// Idle auto-rotate camera controller
const IdleCameraController: React.FC = () => {
  const controlsRef = useRef<CameraControlsImpl>(null)
  const lastInteractionRef = useRef(Date.now())
  const isIdleRef = useRef(false)
  const IDLE_TIMEOUT = 5000 // 5 seconds before auto-rotate kicks in

  useEffect(() => {
    const handleInteraction = () => {
      lastInteractionRef.current = Date.now()
      isIdleRef.current = false
    }

    window.addEventListener('mousemove', handleInteraction)
    window.addEventListener('touchstart', handleInteraction)
    window.addEventListener('click', handleInteraction)

    return () => {
      window.removeEventListener('mousemove', handleInteraction)
      window.removeEventListener('touchstart', handleInteraction)
      window.removeEventListener('click', handleInteraction)
    }
  }, [])

  useFrame((_, delta) => {
    if (!controlsRef.current) return

    const timeSinceLastInteraction = Date.now() - lastInteractionRef.current
    
    if (timeSinceLastInteraction > IDLE_TIMEOUT) {
      if (!isIdleRef.current) {
        isIdleRef.current = true
      }
      // Slow auto-rotate when idle (azimuth rotation)
      controlsRef.current.azimuthAngle += delta * 0.08
    }
  })

  return (
    <CameraControls
      ref={controlsRef}
      makeDefault
      dollyToCursor
      minDistance={3}
      maxDistance={10}
      minPolarAngle={Math.PI / 4}
      maxPolarAngle={Math.PI / 2.2}
      azimuthRotateSpeed={0.5}
      polarRotateSpeed={0.5}
      dollySpeed={0.5}
      truckSpeed={0.5}
    />
  )
}

// Analyze user mood from checkins and diary entries
const analyzeUserMood = (
  checkins: MoodCheckin[] | undefined,
  diaryEntries: DiaryEntry[] | undefined
): { mood: PetMoodState; engagementLevel: number } => {
  if (!checkins || checkins.length === 0) {
    return { mood: 'happy', engagementLevel: 50 }
  }

  // Analyze last 7 days of checkins
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const recentCheckins = checkins.filter(
    (checkin) => new Date(checkin.created_at) >= sevenDaysAgo
  )

  if (recentCheckins.length === 0) {
    return { mood: 'happy', engagementLevel: 30 }
  }

  // Count emotions and calculate average intensity
  const emotionCounts: Record<string, number> = {}
  let totalIntensity = 0

  recentCheckins.forEach((checkin) => {
    const emotionName = checkin.emotion?.name || 'happy'
    emotionCounts[emotionName] = (emotionCounts[emotionName] || 0) + 1
    totalIntensity += checkin.intensity
  })

  const avgIntensity = totalIntensity / recentCheckins.length

  // Calculate engagement level based on checkin frequency and diary activity
  const checkinFrequency = recentCheckins.length / 7 // Checkins per day
  const diaryActivity = diaryEntries ? Math.min(diaryEntries.length / 10, 1) : 0
  const engagementLevel = Math.min(100, (checkinFrequency * 20 + diaryActivity * 30 + avgIntensity * 5))

  // Determine mood based on emotion distribution
  const happyCount = (emotionCounts.happy || 0) + (emotionCounts.excited || 0) + (emotionCounts.calm || 0)
  const sadCount = emotionCounts.sad || 0
  const anxiousCount = (emotionCounts.stressed || 0) + (emotionCounts.angry || 0)

  const totalEmotions = recentCheckins.length
  const happyRatio = happyCount / totalEmotions
  const sadRatio = sadCount / totalEmotions
  const anxiousRatio = anxiousCount / totalEmotions

  // Determine primary mood
  if (sadRatio > 0.4 && avgIntensity < 5) {
    return { mood: 'sad', engagementLevel }
  } else if (anxiousRatio > 0.3 || (anxiousRatio > 0.2 && avgIntensity > 7)) {
    return { mood: 'anxious', engagementLevel }
  } else if (happyRatio > 0.5 && avgIntensity > 6) {
    return { mood: 'happy', engagementLevel }
  } else {
    // Default to happy if mixed or unclear
    return { mood: 'happy', engagementLevel }
  }
}

// Helper function to calculate mood color from happiness and emotion
const calculateMoodColor = (happiness: number, latestCheckin: MoodCheckin | undefined): string => {
  // Map emotion_id to color hue
  // 1: happy, 2: sad, 3: angry, 4: calm, 5: stressed, 6: excited
  const emotionHues: Record<number, number> = {
    1: 60,   // Yellow (happy)
    2: 240,  // Blue (sad)
    3: 0,    // Red (angry)
    4: 180,  // Cyan (calm)
    5: 30,   // Orange (stressed)
    6: 300,  // Magenta (excited)
  }

  const emotionId = latestCheckin?.emotion_id ?? 1
  const baseHue = emotionHues[emotionId] ?? 60
  
  // Happiness affects saturation and lightness
  // High happiness = high saturation, high lightness
  // Low happiness = low saturation, low lightness
  const saturation = Math.max(30, Math.min(100, happiness * 0.7 + 30))
  const lightness = Math.max(20, Math.min(80, happiness * 0.5 + 30))
  
  return `hsl(${baseHue}, ${saturation}%, ${lightness}%)`
}

const PetPage = () => {
  const toast = useToast()

  // Fetch pet data
  const { data: pet, isLoading, error } = useGetPetQuery()
  
  // Fetch checkins for mood analysis (last 7 days worth)
  const { data: checkins } = useGetCheckinsQuery({ limit: 20, offset: 0 })
  const latestCheckin = Array.isArray(checkins) && checkins.length > 0 ? checkins[0] : undefined
  
  // Fetch recent diary entries for engagement level
  const { data: diaryEntries } = useGetDiaryEntriesQuery({ limit: 10, offset: 0 })

  // Mutations
  const [feedPet, { isLoading: isFeedingLoading }] = useFeedPetMutation()
  const [petPet, { isLoading: isPettingLoading }] = usePetPetMutation()
  const [talkToPet, { isLoading: isTalkingLoading }] = useTalkToPetMutation()

  // Local state for optimistic updates and animations
  const [localHappiness, setLocalHappiness] = useState<number | null>(null)
  const [animationState, setAnimationState] = useState<AnimationState>('idle')
  const [dialogues, setDialogues] = useState<Array<{ id: string; message: string }>>([])

  // Combined loading state
  const isInteractionLoading = isFeedingLoading || isPettingLoading || isTalkingLoading

  // Helper to add a dialogue message
  const addDialogue = (message: string) => {
    const id = `${Date.now()}-${Math.random()}`
    setDialogues((prev) => [...prev, { id, message }])
  }

  // Helper to dismiss a dialogue message
  const dismissDialogue = (id: string) => {
    setDialogues((prev) => prev.filter((d) => d.id !== id))
  }

  // Use local happiness if available, otherwise use pet data
  const currentHappiness = localHappiness ?? pet?.happiness_level ?? 50
  
  // Calculate mood color from happiness and latest emotion
  const moodColor = useMemo(
    () => calculateMoodColor(currentHappiness, latestCheckin),
    [currentHappiness, latestCheckin]
  )
  
  // Analyze user mood from checkins and diary entries
  const { mood: moodState, engagementLevel } = useMemo(
    () => analyzeUserMood(checkins, diaryEntries),
    [checkins, diaryEntries]
  )

  // Handle Feed interaction
  const handleFeed = async () => {
    if (!pet) return

    // Optimistic update
    setLocalHappiness(Math.min(100, currentHappiness + 10))
    setAnimationState('eating')
    addDialogue('That was delicious!')

    try {
      const result = await feedPet().unwrap()
      setLocalHappiness(result.happiness_level)

      toast({
        title: 'Pet fed successfully!',
        description: `Happiness +10 (now ${result.happiness_level})`,
        status: 'success',
        duration: 3000,
        position: 'top',
      })

      // Trigger vibration on mobile
      if (navigator.vibrate) {
        navigator.vibrate(100)
      }
    } catch (err) {
      // Rollback on error
      setLocalHappiness(pet.happiness_level)

      toast({
        title: 'Failed to feed pet',
        description: 'Please try again',
        status: 'error',
        duration: 3000,
        position: 'top',
      })
    } finally {
      setTimeout(() => {
        setAnimationState('idle')
      }, 3000)
    }
  }

  // Handle Pet interaction
  const handlePet = async () => {
    if (!pet) return

    // Optimistic update
    setLocalHappiness(Math.min(100, currentHappiness + 5))
    setAnimationState('being_petted')
    addDialogue('That feels great!')

    try {
      const result = await petPet().unwrap()
      setLocalHappiness(result.happiness_level)

      toast({
        title: 'Pet petted successfully!',
        description: `Happiness +5 (now ${result.happiness_level})`,
        status: 'success',
        duration: 3000,
        position: 'top',
      })

      // Trigger vibration on mobile
      if (navigator.vibrate) {
        navigator.vibrate([50, 50, 50])
      }
    } catch (err) {
      // Rollback on error
      setLocalHappiness(pet.happiness_level)

      toast({
        title: 'Failed to pet',
        description: 'Please try again',
        status: 'error',
        duration: 3000,
        position: 'top',
      })
    } finally {
      setTimeout(() => {
        setAnimationState('idle')
      }, 3000)
    }
  }

  // Handle Talk interaction
  const handleTalk = async () => {
    if (!pet) return

    // Optimistic update
    setLocalHappiness(Math.min(100, currentHappiness + 2))
    setAnimationState('talking')

    try {
      const result = await talkToPet().unwrap()
      setLocalHappiness(result.pet.happiness_level)
      addDialogue(result.dialogue)

      toast({
        title: 'Chatted with pet!',
        description: `Happiness +2 (now ${result.pet.happiness_level})`,
        status: 'success',
        duration: 3000,
        position: 'top',
      })

      // Trigger vibration on mobile
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
    } catch (err) {
      // Rollback on error
      setLocalHappiness(pet.happiness_level)
      addDialogue('...')

      toast({
        title: 'Failed to talk',
        description: 'Please try again',
        status: 'error',
        duration: 3000,
        position: 'top',
      })
    } finally {
      setTimeout(() => {
        setAnimationState('idle')
      }, 3000)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <Box
        data-testid="pet-page"
        position="relative"
        minH="calc(100vh - 64px)"
        h="calc(100vh - 64px)"
        overflow="hidden"
      >
        <Canvas
          shadows
          dpr={[1, 2]}
          gl={{ preserveDrawingBuffer: true, antialias: true }}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
        >
          <PerspectiveCamera makeDefault position={[0, 5, 10]} fov={30} />
          <RendererConfig />
          <ambientLight intensity={0.3} />
          <directionalLight position={[5, 8, 5]} intensity={0.8} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0001} shadow-camera-far={50} shadow-camera-left={-15} shadow-camera-right={15} shadow-camera-top={15} shadow-camera-bottom={-15} shadow-normalBias={0.02} />
          <AnimatedBackground moodColor="#87CEEB" happiness={50} />
        </Canvas>
        <Flex
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          zIndex={1}
          align="center"
          justify="center"
        >
          <VStack spacing={4}>
            <Spinner size="xl" color="purple.500" thickness="4px" />
            <Text fontSize="lg" color="white" textShadow="0 2px 4px rgba(0,0,0,0.3)">
              Loading your pet...
            </Text>
          </VStack>
        </Flex>
      </Box>
    )
  }

  // Error state
  if (error || !pet) {
    return (
      <Box
        data-testid="pet-page"
        position="relative"
        minH="calc(100vh - 64px)"
        h="calc(100vh - 64px)"
        overflow="hidden"
      >
        <Canvas
          shadows
          dpr={[1, 2]}
          gl={{ preserveDrawingBuffer: true, antialias: true }}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
        >
          <PerspectiveCamera makeDefault position={[0, 5, 10]} fov={30} />
          <RendererConfig />
          <ambientLight intensity={0.3} />
          <directionalLight position={[5, 8, 5]} intensity={0.8} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0001} shadow-camera-far={50} shadow-camera-left={-15} shadow-camera-right={15} shadow-camera-top={15} shadow-camera-bottom={-15} shadow-normalBias={0.02} />
          <AnimatedBackground moodColor="#87CEEB" happiness={50} />
        </Canvas>
        <Flex
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          zIndex={1}
          align="center"
          justify="center"
          p={6}
        >
          <Alert
            status="error"
            maxWidth="500px"
            borderRadius="lg"
            boxShadow="xl"
            bg="red.50"
          >
            <AlertIcon />
            <VStack align="flex-start" spacing={2}>
              <Text fontWeight="bold">Failed to load pet data</Text>
              <Text fontSize="sm">
                {(error as any)?.data?.message || 'Please try refreshing the page'}
              </Text>
            </VStack>
          </Alert>
        </Flex>
      </Box>
    )
  }

  return (
    <Box
      data-testid="pet-page"
      position="relative"
      minH="calc(100vh - 64px)"
      h="calc(100vh - 64px)"
      overflow="hidden"
    >
      {/* 3D Canvas Scene */}
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
      >
        {/* Camera - Optimized for pet + ground view */}
        <PerspectiveCamera makeDefault position={[0, 3, 8]} fov={35} />

        {/* Configure renderer: shadows, tone mapping, and exposure */}
        <RendererConfig />

        {/* Camera Controls - idle auto-rotate, dolly to cursor */}
        <IdleCameraController />

        {/* Soft Shadows for toon style */}
        {/* <SoftShadows size={25} samples={10} /> */}

        {/* Lighting Setup - Balanced for stylized pet scene */}
        {/* 
          Developer Notes:
          - Ambient light: Provides base illumination, prevents pure black shadows
            Reduced from 0.4 to 0.3 to prevent flat, over-lit appearance
          - Directional light: Main sun/key light, reduced from 1.5 to 0.8
            Position [5, 8, 5] provides nice 45-degree angle lighting
            With Environment preset="sunset" and Sky component, we get additional
            HDR lighting, so explicit lights need to be lower
        */}
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={0.8}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0001}
          shadow-camera-far={50}
          shadow-camera-left={-15}
          shadow-camera-right={15}
          shadow-camera-top={15}
          shadow-camera-bottom={-15}
          shadow-normalBias={0.02}
        />

        {/* 3D Background */}
        <AnimatedBackground moodColor={moodColor} happiness={currentHappiness} />

        {/* 3D Pet Avatar */}
        <PetAvatar
          happiness={currentHappiness}
          animationState={animationState}
          cosmeticSkin={pet.cosmetic_skin as any}
          moodState={moodState}
          engagementLevel={engagementLevel}
        />

        {/* Post-Processing Effects - Game Camera Feel */}
        {/* <EffectComposer disableNormalPass>
          <Bloom 
            luminanceThreshold={1.0} 
            intensity={0.3} 
            mipmapBlur
          />
          <Vignette 
            eskil={false} 
            offset={0.1} 
            darkness={1.1} 
          />
          <DepthOfField
            focusDistance={0.01}
            focalLength={0.05}
            bokehScale={3}
          />
        </EffectComposer> */}
      </Canvas>

      {/* Game Content - UI Overlays */}
      <Flex
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        zIndex={1}
        direction="column"
        align="center"
        justify="space-between"
        px={4}
        py={6}
        pointerEvents="none"
      >
        {/* Top HUD: Stats - positioned at top right */}
        <Box
          position="absolute"
          top={4}
          right={4}
          pointerEvents="auto"
        >
          <PetStats
            name={pet.name}
            happiness={currentHappiness}
            lastInteraction={pet.last_interaction}
          />
        </Box>

        {/* Center: Pet with Dialogue */}
        <Flex
          flex={1}
          align="center"
          justify="center"
          position="relative"
        >
          <Box position="relative" pointerEvents="auto">
            {/* Dialogue messages stack */}
            {dialogues.map((dialogue, index) => (
              <PetDialogue
                key={dialogue.id}
                message={dialogue.message}
                index={index}
                onDismiss={() => dismissDialogue(dialogue.id)}
              />
            ))}
          </Box>
        </Flex>

        {/* Bottom HUD: Interaction Buttons */}
        <Box
          pointerEvents="auto"
        >
          <InteractionButtons
            onFeed={handleFeed}
            onPet={handlePet}
            onTalk={handleTalk}
            isLoading={isInteractionLoading}
          />
        </Box>
      </Flex>
    </Box>
  )
}

export default PetPage
