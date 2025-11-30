import React, { useMemo } from 'react'
import { 
  Sparkles, 
  Cloud, 
  Stars, 
  Sky, 
  Environment, 
  SoftShadows,
  useGLTF
} from '@react-three/drei'
import { Mesh } from 'three'
import * as THREE from 'three'
import groundModel from '../../assets/models/ground.glb'

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  fog: { color: '#f0f0f0', density: 0.01 },
} as const

// ============================================================================
// TYPES
// ============================================================================

interface AnimatedBackgroundProps {
  moodColor: string
  happiness: number
}

// ============================================================================
// UTILITIES
// ============================================================================

const hslToRgb = (hsl: string): [number, number, number] => {
  const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
  if (!match) return [0.53, 0.81, 0.92]

  const h = parseInt(match[1]) / 360
  const s = parseInt(match[2]) / 100
  const l = parseInt(match[3]) / 100

  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1))
  const m = l - c / 2

  let r = 0, g = 0, b = 0

  if (h < 1 / 6) { r = c; g = x; b = 0 }
  else if (h < 2 / 6) { r = x; g = c; b = 0 }
  else if (h < 3 / 6) { r = 0; g = c; b = x }
  else if (h < 4 / 6) { r = 0; g = x; b = c }
  else if (h < 5 / 6) { r = x; g = 0; b = c }
  else { r = c; g = 0; b = x }

  return [r + m, g + m, b + m]
}

// ============================================================================
// GROUND MODEL COMPONENT
// ============================================================================

const GroundModel: React.FC = () => {
  // useGLTF is a Suspense hook - it will suspend if loading
  // React Suspense will handle the loading state
  const { scene } = useGLTF(groundModel, true)

  // Align model to ground (in case author shifted pivot)
  const cloned = useMemo(() => {
    if (!scene) {
      console.warn('Ground model scene is not available')
      return null
    }

    const g = scene.clone(true)

    // Calculate positioning
    const box = new THREE.Box3().setFromObject(g)
    const minY = box.min.y
    const size = new THREE.Vector3()
    box.getSize(size)

    console.log('Ground model bounds:', { minY, size: { x: size.x, y: size.y, z: size.z } })

    // Shift model up so it touches Y=0 (minY is essentially 0, so this should be minimal)
    g.position.y -= minY

    // Make sure the group itself is visible
    g.visible = true

    // Enable shadows and make sure materials are visible
    g.traverse((obj) => {
      if (obj instanceof Mesh) {
        obj.castShadow = true
        obj.receiveShadow = true
        obj.visible = true
        obj.frustumCulled = false // Don't cull the ground
        
        if (obj.material) {
          // Ensure material is visible
          if (Array.isArray(obj.material)) {
            obj.material.forEach((mat: any) => {
              if (mat) {
                mat.needsUpdate = true
                // Make sure material is not transparent
                if (mat.transparent !== undefined) {
                  mat.transparent = false
                }
                if (mat.opacity !== undefined && mat.opacity < 1) {
                  mat.opacity = 1
                }
              }
            })
          } else {
            obj.material.needsUpdate = true
            // Make sure material is not transparent
            if ((obj.material as any).transparent !== undefined) {
              (obj.material as any).transparent = false
            }
            if ((obj.material as any).opacity !== undefined && (obj.material as any).opacity < 1) {
              (obj.material as any).opacity = 1
            }
          }
        }
      }
    })

    return g
  }, [scene])

  if (!cloned) {
    // Fallback: simple plane if model fails to load
    console.warn('Ground model failed to load, using fallback plane')
    return (
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>
    )
  }

  return <primitive object={cloned} />
}

// ============================================================================
// ENVIRONMENT COMPONENTS
// ============================================================================

const SceneFog: React.FC = () => (
  <fogExp2 attach="fog" args={[CONFIG.fog.color, CONFIG.fog.density]} />
)

// Proper clouds high up in the sky
const CloudLayer: React.FC = () => (
  <>
    <Cloud position={[-8, 5, -15]} segments={40} bounds={[10, 2, 10]} volume={10} color="white" />
    <Cloud position={[8, 5.5, -18]} segments={40} bounds={[12, 2, 10]} volume={10} color="white" />
    <Cloud position={[0, 6, -20]} segments={40} bounds={[15, 3, 10]} volume={10} color="#f8f8ff" />
    <Cloud position={[-12, 5.2, -16]} segments={40} bounds={[8, 2, 10]} volume={10} color="white" />
  </>
)

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ moodColor, happiness }) => {
  // const particleColor = useMemo(() => {
  //   const [r, g, b] = hslToRgb(moodColor)
  //   return new THREE.Color(r, g, b)
  // }, [moodColor])

  return (
    <group>
      {/* Atmosphere */}
      {/* <SceneFog /> */}
      {/* <SoftShadows size={25} samples={16} focus={0.5} /> */}
      {/* <Sky sunPosition={[100, 20, 100]} turbidity={0.1} rayleigh={0.5} mieCoefficient={0.005} mieDirectionalG={0.8} /> */}
      {/* <Environment preset="sunset" /> */}
      
      {/* Ground Model */}
      <GroundModel />
      
      {/* Sky Elements */}
      {/* <Stars radius={100} depth={50} count={happiness > 50 ? 300 : 150} factor={2} saturation={0.2} fade speed={0.2} /> */}
      {/* <CloudLayer /> */}

      {/* Particles & Effects */}
      {/* <Sparkles count={200} scale={12} size={4} speed={0.4} opacity={0.5} color="lightyellow" /> */}
      {/* <Sparkles count={100} scale={[15, 6, 15]} position={[0, 2, -5]} size={2} speed={0.2} opacity={0.3} color="#ffffff" /> */}
      {/* <Sparkles count={50} scale={[12, 5, 10]} position={[0, 1.5, -2]} size={3} speed={0.3} opacity={0.4} color={particleColor} /> */}
    </group>
  )
}
