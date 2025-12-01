import React, {
  useRef,
  useMemo,
  useEffect,
  ErrorInfo,
  useState,
  useCallback,
} from 'react'
import { useFrame } from '@react-three/fiber'
import { type GLTF } from 'three-stdlib'
import { useGLTF, useAnimations, ContactShadows } from '@react-three/drei'
import { Mesh, Group, MeshStandardMaterial, Box3, Vector3 } from 'three'
import * as THREE from 'three'

// Error Boundary for GLTF loading errors
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('Pet model failed to load, using procedural geometry:', error)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

export type AnimationState = 'idle' | 'eating' | 'being_petted' | 'talking'
export type CosmeticSkin = 'default' | 'rainbow' | 'golden'
export type PetMoodState = 'happy' | 'sad' | 'anxious'
export type PetAnimationName =
  | 'Idle_Happy'
  | 'Idle_Sad'
  | 'Eating'
  | 'Being_Petted'
  | 'Talking'

interface MaterialState {
  emissive: THREE.Color
  roughness: number
  emissiveIntensity: number
}

interface PetAvatarProps {
  happiness: number // 0-100
  animationState: AnimationState
  cosmeticSkin?: CosmeticSkin
  moodState?: PetMoodState
  engagementLevel?: number // 0-100
}

// Helper function to get target material state based on mood
const getTargetMaterialState = (
  mood: PetMoodState,
  engagementLevel: number,
): MaterialState => {
  const baseEngagement = engagementLevel / 100

  switch (mood) {
    case 'happy':
      return {
        emissive: new THREE.Color(0xff8c42), // Warm orange
        roughness: THREE.MathUtils.lerp(0.6, 0.4, baseEngagement), // Shiny when engaged
        emissiveIntensity: THREE.MathUtils.lerp(0.2, 0.3, baseEngagement),
      }
    case 'sad':
      return {
        emissive: new THREE.Color(0x60a5fa), // Cool blue
        roughness: 0.8, // Dull
        emissiveIntensity: 0.1,
      }
    case 'anxious':
      return {
        emissive: new THREE.Color(0xa78bfa), // Purple
        roughness: 0.6,
        emissiveIntensity: 0.25, // Base, will pulse
      }
    default:
      return {
        emissive: new THREE.Color(0x888888),
        roughness: 0.7,
        emissiveIntensity: 0.2,
      }
  }
}

// Helper function to get color based on happiness level
const getHappinessColors = (happiness: number, skin?: CosmeticSkin) => {
  if (skin === 'rainbow') {
    return {
      primary: '#FF0080',
      secondary: '#FFD700',
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

// Tail component with wagging animation
const Tail: React.FC<{
  colors: ReturnType<typeof getHappinessColors>
  animationState: AnimationState
}> = ({ colors, animationState }) => {
  const tailRef = useRef<Group>(null)

  // TEMPORARILY DISABLED - Step 4: Remove animations
  /*
  useFrame((state) => {
    if (!tailRef.current) return

    const time = state.clock.elapsedTime
    if (animationState === 'idle') {
      tailRef.current.rotation.z = Math.sin(time * 1.5) * 0.3
    } else if (animationState === 'being_petted') {
      tailRef.current.rotation.z = Math.sin(time * 15) * 0.5
    } else if (animationState === 'eating') {
      tailRef.current.rotation.z = Math.sin(time * 3) * 0.2
    } else if (animationState === 'talking') {
      tailRef.current.rotation.z = Math.sin(time * 8) * 0.25
    }
  })
  */

  return (
    <group ref={tailRef} position={[-0.4, 0.2, 0]} rotation={[0, 0, -0.3]}>
      <mesh castShadow>
        <coneGeometry args={[0.15, 0.6, 8]} />
        <meshStandardMaterial color={colors.primary} />
      </mesh>
      <mesh position={[0, -0.2, 0]} castShadow>
        <coneGeometry args={[0.12, 0.4, 8]} />
        <meshStandardMaterial color={colors.secondary} />
      </mesh>
    </group>
  )
}

// Ear component
const Ear: React.FC<{
  side: 'left' | 'right'
  colors: ReturnType<typeof getHappinessColors>
  animationState: AnimationState
}> = ({ side, colors, animationState }) => {
  const earRef = useRef<Group>(null)
  const xPos = side === 'left' ? -0.25 : 0.25

  // TEMPORARILY DISABLED - Step 4: Remove animations
  /*
  useFrame((state) => {
    if (!earRef.current) return

    const time = state.clock.elapsedTime
    if (animationState === 'being_petted') {
      earRef.current.rotation.z = Math.sin(time * 12) * 0.2 * (side === 'left' ? 1 : -1)
    } else if (animationState === 'idle') {
      earRef.current.rotation.z = Math.sin(time * 1) * 0.05 * (side === 'left' ? 1 : -1)
    }
  })
  */

  return (
    <group ref={earRef} position={[xPos, 0.35, 0.1]}>
      <mesh castShadow>
        <coneGeometry args={[0.08, 0.2, 4]} />
        <meshStandardMaterial color={colors.primary} />
      </mesh>
      <mesh position={[0, 0.05, 0]} castShadow>
        <coneGeometry args={[0.05, 0.12, 4]} />
        <meshStandardMaterial color={colors.secondary} />
      </mesh>
    </group>
  )
}

// Eye component with blinking
const Eye: React.FC<{
  side: 'left' | 'right'
  happiness: number
  animationState: AnimationState
}> = ({ side, happiness, animationState }) => {
  const eyeRef = useRef<Mesh>(null)
  const xPos = side === 'left' ? -0.12 : 0.12

  // TEMPORARILY DISABLED - Step 4: Remove animations
  /*
  useFrame((state) => {
    if (!eyeRef.current || animationState !== 'idle') {
      if (eyeRef.current) eyeRef.current.scale.y = 1
      return
    }

    const time = state.clock.elapsedTime
    // Blink every 4 seconds
    const blinkCycle = (time % 4)
    if (blinkCycle > 3.9 && blinkCycle < 4.0) {
      eyeRef.current.scale.y = Math.max(0.1, (4.0 - blinkCycle) * 10)
    } else {
      eyeRef.current.scale.y = 1
    }
  })
  */

  return (
    <group position={[xPos, 0.15, 0.25]}>
      {/* White of eye */}
      <mesh castShadow>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* Pupil */}
      <mesh ref={eyeRef} position={[0, 0, 0.02]} castShadow>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial color="#2D3748" />
      </mesh>
      {/* Highlight */}
      <mesh position={[0.01, 0.01, 0.03]} castShadow>
        <sphereGeometry args={[0.01, 8, 8]} />
        <meshStandardMaterial color="white" />
      </mesh>
    </group>
  )
}

// Import the model file - webpack will handle it as an asset
import petModelUrl from '../../assets/models/low_poly_rabbit.glb'

/**
 * Creates custom procedural animations for pet interactions
 * Uses VectorKeyframeTrack to create position/rotation/scale animations
 * targetBones: object containing bone names to target for animations
 */
const createCustomAnimation = (
  type: 'feed' | 'pet' | 'talk',
  targetBones?: { body?: string; head?: string; ears?: string[] },
): THREE.AnimationClip => {
  const tracks: THREE.KeyframeTrack[] = []

  if (type === 'feed') {
    // Bounce up animation - target body/root bone
    const times = [0, 0.3, 0.6, 0.9, 1.2, 1.5]
    const positionValues = [
      0, 0, 0,    // start
      0, 0.15, 0, // jump up
      0, 0, 0,    // land
      0, 0.1, 0,  // small bounce
      0, 0, 0,    // land
      0, 0, 0,    // end
    ]

    // If we have bone names, target the body bone, otherwise target root
    const bonePath = targetBones?.body || '.'
    tracks.push(
      new THREE.VectorKeyframeTrack(
        `${bonePath}.position`,
        times,
        positionValues,
      ),
    )

    return new THREE.AnimationClip('custom_feed', 1.5, tracks)
  }

  if (type === 'pet') {
    // Happy wiggle - target head and body
    const times = [0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0]

    // Head rotation (wiggle)
    const headRotationValues = [
      0, 0, 0,          // start
      0, 0, 0.15,       // wiggle right
      0, 0, -0.15,      // wiggle left
      0, 0, 0.12,       // wiggle right
      0, 0, -0.12,      // wiggle left
      0, 0, 0.08,       // wiggle right
      0, 0, -0.08,      // wiggle left
      0, 0, 0.05,       // small wiggle
      0, 0, -0.05,      // small wiggle
      0, 0, 0,          // center
      0, 0, 0,          // end
    ]

    // Body scale pulse
    const bodyScaleValues = [
      1, 1, 1,          // start
      1.03, 1.03, 1.03, // grow
      1, 1, 1,          // normal
      1.03, 1.03, 1.03, // grow
      1, 1, 1,          // normal
      1.02, 1.02, 1.02, // small grow
      1, 1, 1,          // normal
      1.02, 1.02, 1.02, // small grow
      1, 1, 1,          // normal
      1, 1, 1,          // normal
      1, 1, 1,          // end
    ]

    const headPath = targetBones?.head || '.'
    const bodyPath = targetBones?.body || '.'

    tracks.push(
      new THREE.VectorKeyframeTrack(`${headPath}.rotation`, times, headRotationValues),
      new THREE.VectorKeyframeTrack(`${bodyPath}.scale`, times, bodyScaleValues),
    )

    // Add ear wiggles if ear bones are provided
    if (targetBones?.ears && targetBones.ears.length > 0) {
      targetBones.ears.forEach((earPath, index) => {
        const direction = index % 2 === 0 ? 1 : -1 // Alternate directions
        const earRotationValues = headRotationValues.map((v, i) =>
          i % 3 === 2 ? v * 0.5 * direction : v // Only modify Z rotation
        )
        tracks.push(
          new THREE.VectorKeyframeTrack(`${earPath}.rotation`, times, earRotationValues),
        )
      })
    }

    return new THREE.AnimationClip('custom_pet', 2.0, tracks)
  }

  if (type === 'talk') {
    // Head bob with gentle sway
    const times = [0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.5]

    // Head position (bob up and down)
    const headPositionValues = [
      0, 0, 0,      // start
      0, 0.08, 0,   // up
      0, 0, 0,      // down
      0, 0.06, 0,   // up
      0, 0, 0,      // down
      0, 0.05, 0,   // up
      0, 0, 0,      // down
      0, 0, 0,      // end
    ]

    // Head rotation (sway)
    const headRotationValues = [
      0, 0, 0,       // start
      0, 0.08, 0,    // turn right
      0, -0.08, 0,   // turn left
      0, 0.06, 0,    // turn right
      0, -0.06, 0,   // turn left
      0, 0.04, 0,    // turn right
      0, 0, 0,       // center
      0, 0, 0,       // end
    ]

    const headPath = targetBones?.head || '.'

    tracks.push(
      new THREE.VectorKeyframeTrack(`${headPath}.position`, times, headPositionValues),
      new THREE.VectorKeyframeTrack(`${headPath}.rotation`, times, headRotationValues),
    )

    return new THREE.AnimationClip('custom_talk', 1.5, tracks)
  }

  // Fallback: return empty clip
  return new THREE.AnimationClip('custom_idle', 0, [])
}

/**
 * Finds bones in the GLTF scene for animation targeting
 * Returns paths to head, body, and ear bones if found
 */
const findAnimationBones = (scene: THREE.Object3D): {
  body?: string
  head?: string
  ears?: string[]
} => {
  const bones: { body?: string; head?: string; ears?: string[] } = { ears: [] }

  scene.traverse((child) => {
    const name = child.name.toLowerCase()

    // Look for head bone
    if (!bones.head && (name.includes('head') || name.includes('neck'))) {
      bones.head = child.name
      console.log('Found head bone:', child.name)
    }

    // Look for body/spine bone
    if (!bones.body && (name.includes('spine') || name.includes('body') || name.includes('hips'))) {
      bones.body = child.name
      console.log('Found body bone:', child.name)
    }

    // Look for ear bones
    if (name.includes('ear')) {
      bones.ears!.push(child.name)
      console.log('Found ear bone:', child.name)
    }
  })

  return bones
}

/**
 * Fixes a GLTF model to sit on the ground (Y=0) and enables shadows
 * - Computes bounding box to find the lowest point
 * - Applies Y correction so lowest point sits at Y=0
 * - Normalizes scale if model is extremely large or small
 * - Enables castShadow and receiveShadow on all meshes
 */
const fixModelOnGround = (gltf: GLTF): { yOffset: number; scale: number } => {
  if (!gltf.scene) {
    return { yOffset: 0, scale: 1 }
  }

  // Compute bounding box for the entire scene
  const box = new Box3()
  box.setFromObject(gltf.scene)

  // Get the size and center
  const size = new Vector3()
  const center = new Vector3()
  box.getSize(size)
  box.getCenter(center)

  // Calculate Y offset to place lowest point at Y=0
  const minY = box.min.y
  const yOffset = -minY

  // Normalize scale if model is extremely large or small
  // Target size: roughly 1-3 units in the largest dimension
  const maxDimension = Math.max(size.x, size.y, size.z)
  let scale = 1

  if (maxDimension > 10) {
    // Model is too large, scale down
    scale = 2 / maxDimension // Target ~2 units
  } else if (maxDimension < 0.1) {
    // Model is too small, scale up
    scale = 1 / maxDimension // Target ~1 unit
  }

  // Apply Y offset to center the model at Y=0
  gltf.scene.position.y = yOffset * scale

  // Apply scale if needed
  if (scale !== 1) {
    gltf.scene.scale.multiplyScalar(scale)
  }

  // Traverse all meshes and enable shadows
  gltf.scene.traverse((child: any) => {
    if (child.isMesh) {
      child.castShadow = true
      child.receiveShadow = true
    }
  })

  return { yOffset: yOffset * scale, scale }
}

// GLTF Model Component (separate to handle hook calls)
const PetModel: React.FC<{
  groupRef: React.RefObject<Group>
  animationState: AnimationState
  moodState: PetMoodState
  materialRefs: React.RefObject<MeshStandardMaterial[]>
  onLoadSuccess?: () => void
}> = ({ groupRef, animationState, moodState, materialRefs, onLoadSuccess }) => {
  // useGLTF must be called unconditionally
  // Use the imported URL - webpack will provide the correct path
  // The hook will suspend if loading, and errors are handled by Suspense/ErrorBoundary
  const gltf = useGLTF(petModelUrl, true) as any

  // Extract animations
  const { actions, mixer } = useAnimations(gltf?.animations || [], groupRef)

  // Store custom actions in a ref so we can access them
  const customActionsRef = useRef<{
    custom_feed?: THREE.AnimationAction
    custom_pet?: THREE.AnimationAction
    custom_talk?: THREE.AnimationAction
  }>({})

  // Fix model position on ground and clone materials on mount
  useEffect(() => {
    if (!gltf?.scene) return

    // Fix model to sit on ground (Y=0)
    fixModelOnGround(gltf)

    // Debug: Log available animations
    console.log(
      'Available animations:',
      gltf.animations?.map((a) => a.name),
    )

    // Notify that model loaded successfully
    if (onLoadSuccess) {
      onLoadSuccess()
    }

    const materials: MeshStandardMaterial[] = []
    gltf.scene.traverse((child: any) => {
      if (child.isMesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((mat: any) => {
            if (mat instanceof MeshStandardMaterial) {
              const cloned = mat.clone()
              child.material = cloned
              materials.push(cloned)
            }
          })
        } else if (child.material instanceof MeshStandardMaterial) {
          const cloned = child.material.clone()
          child.material = cloned
          materials.push(cloned)
        }
      }
    })
    materialRefs.current = materials
  }, [gltf, materialRefs, onLoadSuccess])

  // Map animationState to animation names
  // Rabbit model has: 'Armature.001|Die', 'Armature.001|Idle', 'Armature.001|Run'
  // We use 'Armature.001|Idle' for idle state and custom animations for actions
  const getAnimationName = (state: AnimationState): string | null => {
    switch (state) {
      case 'idle':
        return 'Armature.001|Idle' // Use built-in Idle animation
      case 'eating':
        return 'custom_feed' // Custom animation
      case 'being_petted':
        return 'custom_pet' // Custom animation
      case 'talking':
        return 'custom_talk' // Custom animation
      default:
        return 'Armature.001|Idle'
    }
  }

  // Create and add custom animations to mixer on mount
  useEffect(() => {
    if (!mixer || !groupRef.current || !gltf?.scene) return

    console.log(
      'Creating custom animations for groupRef:',
      groupRef.current.uuid,
    )

    // Find bones in the model for animation targeting
    const bones = findAnimationBones(gltf.scene)
    console.log('Animation bones found:', bones)

    // Create custom animation clips targeting the found bones
    const feedClip = createCustomAnimation('feed', bones)
    const petClip = createCustomAnimation('pet', bones)
    const talkClip = createCustomAnimation('talk', bones)

    console.log('Feed clip:', feedClip.name, 'tracks:', feedClip.tracks.length)
    feedClip.tracks.forEach((track) => {
      console.log('  Track:', track.name, 'times:', track.times.length)
    })
    console.log('Pet clip:', petClip.name, 'tracks:', petClip.tracks.length)
    petClip.tracks.forEach((track) => {
      console.log('  Track:', track.name, 'times:', track.times.length)
    })
    console.log('Talk clip:', talkClip.name, 'tracks:', talkClip.tracks.length)
    talkClip.tracks.forEach((track) => {
      console.log('  Track:', track.name, 'times:', track.times.length)
    })

    // Create actions from custom clips, applying them to the gltf.scene (where the bones are)
    const feedAction = mixer.clipAction(feedClip, gltf.scene)
    const petAction = mixer.clipAction(petClip, gltf.scene)
    const talkAction = mixer.clipAction(talkClip, gltf.scene)

    console.log('Feed action created:', !!feedAction)
    console.log('Pet action created:', !!petAction)
    console.log('Talk action created:', !!talkAction)

    // Configure actions
    feedAction.setLoop(THREE.LoopOnce, 1)
    petAction.setLoop(THREE.LoopOnce, 1)
    talkAction.setLoop(THREE.LoopOnce, 1)

    feedAction.clampWhenFinished = true
    petAction.clampWhenFinished = true
    talkAction.clampWhenFinished = true

    // Store in ref for later access
    customActionsRef.current = {
      custom_feed: feedAction,
      custom_pet: petAction,
      custom_talk: talkAction,
    }

    console.log('Custom animations created and stored in ref')
  }, [mixer, groupRef, gltf])

  // Play animations when state changes
  useEffect(() => {
    if (!mixer || !groupRef.current) return

    const animationName = getAnimationName(animationState)
    if (!animationName) return

    console.log('Switching to animation:', animationName)

    // Get the action - either from built-in animations or custom ones
    let action: THREE.AnimationAction | null = null

    if (animationName.startsWith('custom_')) {
      // Custom animation - get from our ref
      action = customActionsRef.current[animationName as keyof typeof customActionsRef.current] || null
      console.log('Found custom action from ref:', !!action)
      if (action) {
        console.log('Custom action details:', {
          name: animationName,
          time: action.time,
          isRunning: action.isRunning(),
          paused: action.paused,
        })
      }
    } else {
      // Built-in animation from GLB
      action = actions?.[animationName] || null
      console.log('Found built-in action:', !!action)
    }

    if (!action) {
      console.warn(`Animation ${animationName} not found`)
      return
    }

    // Stop all other animations
    if (actions) {
      Object.values(actions).forEach((a) => {
        if (a && a !== action) {
          a.fadeOut(0.3)
        }
      })
    }

    // Also stop other custom animations if switching away
    Object.entries(customActionsRef.current).forEach(([name, customAction]) => {
      if (customAction && customAction !== action) {
        console.log('Stopping custom animation:', name)
        customAction.fadeOut(0.3)
      }
    })

    // Play the new animation
    if (animationName.startsWith('custom_')) {
      // Custom animations play once
      action.reset()
      action.setLoop(THREE.LoopOnce, 1)
      action.clampWhenFinished = true
      action.fadeIn(0.2)
      action.play()
      console.log('Playing custom animation:', animationName, 'weight:', action.getEffectiveWeight())
    } else {
      // Built-in animations loop
      action.reset()
      action.setLoop(THREE.LoopRepeat, Infinity)
      action.fadeIn(0.3)
      action.play()
      console.log('Playing built-in animation:', animationName)
    }

    return () => {
      // Cleanup
      if (actions) {
        Object.values(actions).forEach((a) => {
          if (a) {
            a.fadeOut(0.3)
          }
        })
      }
    }
  }, [animationState, actions, mixer, groupRef])

  // Play default animation on mount
  useEffect(() => {
    if (!actions || Object.keys(actions).length === 0) return

    console.log('Available actions:', Object.keys(actions))

    const defaultAnimation = 'Armature.001|Idle'
    const action = actions[defaultAnimation]
    if (action) {
      console.log('Playing default Idle animation')
      action.play()
    } else {
      console.warn('Idle animation not found in actions')
    }
  }, [actions])

  // Update mixer in useFrame
  useFrame((state, delta) => {
    if (mixer) {
      mixer.update(delta)
    }
  })

  if (!gltf?.scene) return null

  // Model is already positioned and scaled by fixModelOnGround
  // Apply additional scale if needed and rotation
  return (
    <group position={[0, 0, 0]}>
      <group position={[0, 0, 0]}>
        <primitive
          object={gltf.scene}
          scale={[0.5, 0.5, 0.5]}
          rotation={[0, Math.PI, 0]}
        />
      </group>
      <ContactShadows
        position={[0, 0, 0]}
        scale={[2, 2]}
        opacity={0.4}
        blur={2.5}
        far={1.5}
      />
    </group>
  )
}

export const PetAvatar: React.FC<PetAvatarProps> = ({
  happiness,
  animationState,
  cosmeticSkin = 'default',
  moodState = 'happy',
  engagementLevel = 50,
}) => {
  const colors = useMemo(
    () => getHappinessColors(happiness, cosmeticSkin),
    [happiness, cosmeticSkin],
  )
  const groupRef = useRef<Group>(null)

  // Track if GLTF model loaded successfully
  const [modelLoaded, setModelLoaded] = useState(false)
  const handleModelLoadSuccess = useCallback(() => {
    setModelLoaded(true)
  }, [])

  // Material refs for dynamic updates
  const materialRefs = useRef<MeshStandardMaterial[]>([])
  const currentMaterialState = useRef<MaterialState>({
    emissive: new THREE.Color(0x888888),
    roughness: 0.7,
    emissiveIntensity: 0.2,
  })

  // Get target material state
  const targetMaterialState = useMemo(
    () => getTargetMaterialState(moodState, engagementLevel),
    [moodState, engagementLevel],
  )

  // Smoothly interpolate material properties
  useFrame((state) => {
    if (materialRefs.current.length === 0) return

    const lerpSpeed = 0.08
    const time = state.clock.elapsedTime

    // Lerp emissive color
    currentMaterialState.current.emissive.lerp(
      targetMaterialState.emissive,
      lerpSpeed,
    )

    // Lerp roughness
    currentMaterialState.current.roughness = THREE.MathUtils.lerp(
      currentMaterialState.current.roughness,
      targetMaterialState.roughness,
      lerpSpeed,
    )

    // Lerp emissive intensity (with pulsing for anxious)
    let targetIntensity = targetMaterialState.emissiveIntensity
    if (moodState === 'anxious') {
      // Pulse effect
      targetIntensity =
        targetMaterialState.emissiveIntensity + Math.sin(time * 2) * 0.2
    }

    currentMaterialState.current.emissiveIntensity = THREE.MathUtils.lerp(
      currentMaterialState.current.emissiveIntensity,
      targetIntensity,
      lerpSpeed,
    )

    // Apply to all materials
    materialRefs.current.forEach((material) => {
      material.emissive.copy(currentMaterialState.current.emissive)
      material.roughness = currentMaterialState.current.roughness
      material.emissiveIntensity =
        currentMaterialState.current.emissiveIntensity
    })
  })

  // Render with GLTF model attempt and fallback
  return (
    <group ref={groupRef} position={[0, 0, 0]} castShadow receiveShadow>
      {/* Try to load and render GLTF model */}
      {/* Suspense handles loading state, ErrorBoundary handles errors */}
      {/* Try to load GLTF model */}
      <React.Suspense fallback={null}>
        <ErrorBoundary fallback={null}>
          <PetModel
            groupRef={groupRef}
            animationState={animationState}
            moodState={moodState}
            materialRefs={materialRefs}
            onLoadSuccess={handleModelLoadSuccess}
          />
        </ErrorBoundary>
      </React.Suspense>

      {/* Fallback: Procedural geometry - ONLY show if GLTF model failed to load */}
      {!modelLoaded && (
        <group position={[0, 0, 0]}>
          {/* Shadow */}
          <ContactShadows
            position={[0, 0, 0]}
            scale={[2, 2]}
            opacity={0.4}
            blur={2.5}
            far={1.5}
          />

          {/* Tail */}
          <Tail colors={colors} animationState={animationState} />

          {/* Body */}
          <mesh position={[0, 0.1, 0]} scale={[0.3, 0.25, 0.35]} castShadow>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial
              color={colors.primary}
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>

          {/* Belly */}
          <mesh position={[0, 0.05, 0.1]} scale={[0.22, 0.2, 0.25]} castShadow>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial
              color={colors.secondary}
              roughness={0.8}
              metalness={0}
            />
          </mesh>

          {/* Back legs */}
          <mesh position={[-0.15, -0.15, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.25, 16]} />
            <meshStandardMaterial
              color={colors.primary}
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>
          <mesh position={[0.15, -0.15, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.25, 16]} />
            <meshStandardMaterial
              color={colors.primary}
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>

          {/* Front legs */}
          <mesh position={[-0.12, -0.12, 0.15]} castShadow>
            <cylinderGeometry args={[0.07, 0.07, 0.22, 16]} />
            <meshStandardMaterial
              color={colors.primary}
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>
          <mesh position={[0.12, -0.12, 0.15]} castShadow>
            <cylinderGeometry args={[0.07, 0.07, 0.22, 16]} />
            <meshStandardMaterial
              color={colors.primary}
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>

          {/* Neck */}
          <mesh position={[0, 0.25, 0.15]} castShadow>
            <cylinderGeometry args={[0.15, 0.2, 0.15, 16]} />
            <meshStandardMaterial
              color={colors.primary}
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>

          {/* Head */}
          <mesh position={[0, 0.4, 0.2]} castShadow>
            <sphereGeometry args={[0.2, 32, 32]} />
            <meshStandardMaterial
              color={colors.primary}
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>

          {/* Snout */}
          <mesh position={[0, 0.35, 0.35]} scale={[0.12, 0.1, 0.15]} castShadow>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial
              color={colors.secondary}
              roughness={0.8}
              metalness={0}
            />
          </mesh>

          {/* Nose */}
          <mesh position={[0, 0.32, 0.45]} castShadow>
            <sphereGeometry args={[0.03, 16, 16]} />
            <meshStandardMaterial color="#2D3748" />
          </mesh>

          {/* Mouth */}
          {happiness > 50 && (
            <mesh position={[0, 0.28, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.05, 0.08, 16]} />
              <meshStandardMaterial color="#2D3748" side={THREE.DoubleSide} />
            </mesh>
          )}

          {/* Ears */}
          <Ear side="left" colors={colors} animationState={animationState} />
          <Ear side="right" colors={colors} animationState={animationState} />

          {/* Eyes */}
          <Eye
            side="left"
            happiness={happiness}
            animationState={animationState}
          />
          <Eye
            side="right"
            happiness={happiness}
            animationState={animationState}
          />

          {/* Cheek blush (when happy) */}
          {happiness > 70 && (
            <>
              <mesh position={[-0.15, 0.25, 0.25]} castShadow>
                <sphereGeometry args={[0.05, 16, 16]} />
                <meshStandardMaterial
                  color="#FF69B4"
                  transparent
                  opacity={0.3}
                />
              </mesh>
              <mesh position={[0.15, 0.25, 0.25]} castShadow>
                <sphereGeometry args={[0.05, 16, 16]} />
                <meshStandardMaterial
                  color="#FF69B4"
                  transparent
                  opacity={0.3}
                />
              </mesh>
            </>
          )}
        </group>
      )}
    </group>
  )
}
