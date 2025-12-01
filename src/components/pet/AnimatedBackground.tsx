import React, { useMemo } from 'react'
import { Sparkles, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'

// Import ground textures
import colorTexture from '../../assets/ground/grass_02_base_1k.png'
import normalTexture from '../../assets/ground/grass_02_normal_gl_1k.png'
import roughnessTexture from '../../assets/ground/grass_02_roughness_1k.png'
import aoTexture from '../../assets/ground/grass_02_amibent_occlusion_1k.png'
import displacementTexture from '../../assets/ground/grass_02_height_1k.png'

// Import skybox textures
import skyPX from '../../assets/sky/px.png'
import skyNX from '../../assets/sky/nx.png'
import skyPY from '../../assets/sky/py.png'
import skyNY from '../../assets/sky/ny.png'
import skyPZ from '../../assets/sky/pz.png'
import skyNZ from '../../assets/sky/nz.png'

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

  let r = 0,
    g = 0,
    b = 0

  if (h < 1 / 6) {
    r = c
    g = x
    b = 0
  } else if (h < 2 / 6) {
    r = x
    g = c
    b = 0
  } else if (h < 3 / 6) {
    r = 0
    g = c
    b = x
  } else if (h < 4 / 6) {
    r = 0
    g = x
    b = c
  } else if (h < 5 / 6) {
    r = x
    g = 0
    b = c
  } else {
    r = c
    g = 0
    b = x
  }

  return [r + m, g + m, b + m]
}

// ============================================================================
// SKYBOX COMPONENT
// ============================================================================

const Skybox: React.FC = () => {
  const { scene } = useThree()

  useMemo(() => {
    const loader = new THREE.CubeTextureLoader()
    const texture = loader.load([
      skyPX, // positive x
      skyNX, // negative x
      skyPY, // positive y
      skyNY, // negative y
      skyPZ, // positive z
      skyNZ, // negative z
    ])

    scene.background = texture

    return () => {
      // Cleanup on unmount
      if (scene.background === texture) {
        scene.background = null
      }
      texture.dispose()
    }
  }, [scene])

  return null
}

// ============================================================================
// GROUND WITH TEXTURE MAPS
// ============================================================================

const TexturedGround: React.FC = () => {
  // Load all texture maps using useTexture hook
  const [colorMap, normalMap, roughnessMap, aoMap, heightMap] = useTexture([
    colorTexture,
    normalTexture,
    roughnessTexture,
    aoTexture,
    displacementTexture,
  ])

  // Configure textures with wrapping and tiling
  useMemo(() => {
    ;[colorMap, normalMap, roughnessMap, aoMap, heightMap].forEach((tex) => {
      tex.wrapS = THREE.RepeatWrapping
      tex.wrapT = THREE.RepeatWrapping
      tex.repeat.set(10, 10) // Adjust tiling density
    })
  }, [colorMap, normalMap, roughnessMap, aoMap])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[50, 50, 300, 300]} />
      <meshStandardMaterial
        map={colorMap}
        normalMap={normalMap}
        roughnessMap={roughnessMap}
        aoMap={aoMap}
        displacementMap={heightMap}
        displacementScale={0.6}
        aoMapIntensity={1.0}
        roughness={1.0}
      />
    </mesh>
  )
}
// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  moodColor,
  happiness,
}) => {
  const particleColor = useMemo(() => {
    const [r, g, b] = hslToRgb(moodColor)
    return new THREE.Color(r, g, b)
  }, [moodColor])

  return (
    <group>
      {/* Skybox */}
      <Skybox />

      {/* Ground - Textured Plane */}
      <TexturedGround />

      {/* Particles & Effects - Disabled */}
      <Sparkles
        count={200}
        scale={12}
        size={4}
        speed={0.4}
        opacity={0.5}
        color="lightyellow"
      />
      <Sparkles
        count={100}
        scale={[15, 6, 15]}
        position={[0, 2, -5]}
        size={2}
        speed={0.2}
        opacity={0.3}
        color="#ffffff"
      />
      <Sparkles
        count={50}
        scale={[12, 5, 10]}
        position={[0, 1.5, -2]}
        size={3}
        speed={0.3}
        opacity={0.4}
        color={particleColor}
      />
    </group>
  )
}
