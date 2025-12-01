import React, { useMemo } from 'react'
import { Sparkles, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { useThree, useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

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

// Import 3D model packs
import rockModels from '../../assets/models/low_poly_rocks.glb'
import treeModels from '../../assets/models/trees.glb'

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
// SCENE MODELS - Trees and Rocks for Dense Forest Clearing
// ============================================================================

interface ModelPlacement {
  name: string
  position: [number, number, number]
  scale: number
  rotation: number
}

const SceneModels: React.FC = () => {
  // Load both model packs
  const rocksGLTF = useLoader(GLTFLoader, rockModels)
  const treesGLTF = useLoader(GLTFLoader, treeModels)

  // Get the actual tree container
  const treeContainer = useMemo(() => {
    // Navigate to Free_Tree container which has 8 tree children
    let container = treesGLTF.scene
    container.traverse((child) => {
      if (child.name === 'Free_Tree') {
        container = child
      }
    })
    return container
  }, [treesGLTF])

  // Configuration: Tree placements using 8 trees from trees.glb
  // Trees: SM_FreeTree_01 through SM_FreeTree_08
  // Y = 0 for ground level, all positioned behind pet (negative Z), dense forest
  // Scales reduced by 1.2x, tripled quantity with filled gaps
  const treePlacements: ModelPlacement[] = useMemo(() => [
    // Dense forest row 1 (far back, Z = -9 to -9.5)
    { name: 'SM_FreeTree_01', position: [-10, 0, -9], scale: 0.00833, rotation: 0.5 },
    { name: 'SM_FreeTree_02', position: [-9, 0, -9.5], scale: 0.00917, rotation: 1.2 },
    { name: 'SM_FreeTree_03', position: [-8, 0, -9], scale: 0.00833, rotation: 2.1 },
    { name: 'SM_FreeTree_04', position: [-7, 0, -9.5], scale: 0.01, rotation: 0.9 },
    { name: 'SM_FreeTree_05', position: [-6, 0, -9.5], scale: 0.00833, rotation: 1.9 },
    { name: 'SM_FreeTree_06', position: [-5, 0, -9], scale: 0.00917, rotation: 0.3 },
    { name: 'SM_FreeTree_07', position: [-4, 0, -9], scale: 0.01, rotation: 0.8 },
    { name: 'SM_FreeTree_08', position: [-3, 0, -9.5], scale: 0.00833, rotation: 2.4 },
    { name: 'SM_FreeTree_01', position: [-2, 0, -9.5], scale: 0.00917, rotation: 2.5 },
    { name: 'SM_FreeTree_02', position: [-1, 0, -9], scale: 0.00833, rotation: 0.7 },
    { name: 'SM_FreeTree_03', position: [0, 0, -9], scale: 0.00917, rotation: 1.4 },
    { name: 'SM_FreeTree_04', position: [1, 0, -9.5], scale: 0.00833, rotation: 1.9 },
    { name: 'SM_FreeTree_05', position: [2, 0, -9.5], scale: 0.00833, rotation: 0.5 },
    { name: 'SM_FreeTree_06', position: [3, 0, -9], scale: 0.01, rotation: 1.1 },
    { name: 'SM_FreeTree_07', position: [4, 0, -9], scale: 0.00833, rotation: 2.8 },
    { name: 'SM_FreeTree_08', position: [5, 0, -9.5], scale: 0.00917, rotation: 0.6 },
    { name: 'SM_FreeTree_01', position: [6, 0, -9.5], scale: 0.01, rotation: 1.7 },
    { name: 'SM_FreeTree_02', position: [7, 0, -9], scale: 0.01, rotation: 2.2 },
    { name: 'SM_FreeTree_03', position: [8, 0, -9], scale: 0.00917, rotation: 1.5 },
    { name: 'SM_FreeTree_04', position: [9, 0, -9.5], scale: 0.00833, rotation: 2.9 },
    { name: 'SM_FreeTree_05', position: [10, 0, -9], scale: 0.01, rotation: 0.4 },

    // Dense forest row 2 (Z = -8 to -8.5)
    { name: 'SM_FreeTree_06', position: [-10, 0, -8], scale: 0.00917, rotation: 1.7 },
    { name: 'SM_FreeTree_07', position: [-9, 0, -8.5], scale: 0.00833, rotation: 2.3 },
    { name: 'SM_FreeTree_08', position: [-8, 0, -8], scale: 0.00833, rotation: 0.9 },
    { name: 'SM_FreeTree_01', position: [-7, 0, -8.5], scale: 0.01, rotation: 1.5 },
    { name: 'SM_FreeTree_02', position: [-6, 0, -8], scale: 0.00917, rotation: 2.7 },
    { name: 'SM_FreeTree_03', position: [-5, 0, -8.5], scale: 0.00833, rotation: 1.3 },
    { name: 'SM_FreeTree_04', position: [-4, 0, -8], scale: 0.00917, rotation: 0.4 },
    { name: 'SM_FreeTree_05', position: [-3, 0, -8.5], scale: 0.00833, rotation: 2.9 },
    { name: 'SM_FreeTree_06', position: [-2, 0, -8], scale: 0.01, rotation: 1.8 },
    { name: 'SM_FreeTree_07', position: [-1, 0, -8.5], scale: 0.00833, rotation: 0.8 },
    { name: 'SM_FreeTree_08', position: [0, 0, -8], scale: 0.00917, rotation: 2.0 },
    { name: 'SM_FreeTree_01', position: [1, 0, -8.5], scale: 0.00833, rotation: 1.2 },
    { name: 'SM_FreeTree_02', position: [2, 0, -8], scale: 0.00833, rotation: 2.5 },
    { name: 'SM_FreeTree_03', position: [3, 0, -8.5], scale: 0.01, rotation: 0.6 },
    { name: 'SM_FreeTree_04', position: [4, 0, -8], scale: 0.00917, rotation: 1.9 },
    { name: 'SM_FreeTree_05', position: [5, 0, -8.5], scale: 0.00833, rotation: 0.3 },
    { name: 'SM_FreeTree_06', position: [6, 0, -8], scale: 0.00917, rotation: 1.4 },
    { name: 'SM_FreeTree_07', position: [7, 0, -8.5], scale: 0.01, rotation: 2.8 },
    { name: 'SM_FreeTree_08', position: [8, 0, -8], scale: 0.00833, rotation: 0.5 },
    { name: 'SM_FreeTree_01', position: [9, 0, -8.5], scale: 0.00917, rotation: 1.7 },
    { name: 'SM_FreeTree_02', position: [10, 0, -8], scale: 0.01, rotation: 2.1 },

    // Dense forest row 3 (Z = -7 to -7.5)
    { name: 'SM_FreeTree_03', position: [-10, 0, -7], scale: 0.00833, rotation: 0.9 },
    { name: 'SM_FreeTree_04', position: [-9, 0, -7], scale: 0.00833, rotation: 0.7 },
    { name: 'SM_FreeTree_05', position: [-8, 0, -7.5], scale: 0.01, rotation: 1.4 },
    { name: 'SM_FreeTree_06', position: [-7, 0, -7.5], scale: 0.00917, rotation: 1.4 },
    { name: 'SM_FreeTree_07', position: [-6, 0, -7], scale: 0.00833, rotation: 1.9 },
    { name: 'SM_FreeTree_08', position: [-5, 0, -7], scale: 0.00833, rotation: 1.9 },
    { name: 'SM_FreeTree_01', position: [-4, 0, -7.5], scale: 0.00917, rotation: 0.5 },
    { name: 'SM_FreeTree_02', position: [-3, 0, -7.5], scale: 0.01, rotation: 0.5 },
    { name: 'SM_FreeTree_03', position: [-2, 0, -7], scale: 0.00833, rotation: 1.1 },
    { name: 'SM_FreeTree_04', position: [-1, 0, -7], scale: 0.01, rotation: 1.1 },
    { name: 'SM_FreeTree_05', position: [0, 0, -7.5], scale: 0.00917, rotation: 2.8 },
    { name: 'SM_FreeTree_06', position: [1, 0, -7.5], scale: 0.00833, rotation: 2.8 },
    { name: 'SM_FreeTree_07', position: [2, 0, -7], scale: 0.00833, rotation: 0.6 },
    { name: 'SM_FreeTree_08', position: [3, 0, -7], scale: 0.00833, rotation: 0.6 },
    { name: 'SM_FreeTree_01', position: [4, 0, -7.5], scale: 0.01, rotation: 1.7 },
    { name: 'SM_FreeTree_02', position: [5, 0, -7.5], scale: 0.0125, rotation: 1.7 },
    { name: 'SM_FreeTree_03', position: [6, 0, -7], scale: 0.00917, rotation: 2.2 },
    { name: 'SM_FreeTree_04', position: [7, 0, -7], scale: 0.01083, rotation: 2.2 },
    { name: 'SM_FreeTree_05', position: [8, 0, -7.5], scale: 0.00833, rotation: 1.5 },
    { name: 'SM_FreeTree_06', position: [9, 0, -7.5], scale: 0.00833, rotation: 1.5 },
    { name: 'SM_FreeTree_07', position: [10, 0, -7], scale: 0.00917, rotation: 0.8 },

    // Dense forest row 4 (Z = -6 to -6.5)
    { name: 'SM_FreeTree_08', position: [-10, 0, -6], scale: 0.00833, rotation: 2.4 },
    { name: 'SM_FreeTree_01', position: [-9, 0, -6.5], scale: 0.00917, rotation: 1.8 },
    { name: 'SM_FreeTree_02', position: [-8, 0, -6], scale: 0.00833, rotation: 1.7 },
    { name: 'SM_FreeTree_03', position: [-7, 0, -6.5], scale: 0.01, rotation: 2.3 },
    { name: 'SM_FreeTree_04', position: [-6, 0, -6.5], scale: 0.00833, rotation: 2.3 },
    { name: 'SM_FreeTree_05', position: [-5, 0, -6], scale: 0.00917, rotation: 0.9 },
    { name: 'SM_FreeTree_06', position: [-4, 0, -6], scale: 0.00833, rotation: 0.9 },
    { name: 'SM_FreeTree_07', position: [-3, 0, -6.5], scale: 0.01, rotation: 1.5 },
    { name: 'SM_FreeTree_08', position: [-2, 0, -6.5], scale: 0.00917, rotation: 1.5 },
    { name: 'SM_FreeTree_01', position: [-1, 0, -6], scale: 0.00833, rotation: 2.7 },
    { name: 'SM_FreeTree_02', position: [0, 0, -6], scale: 0.00917, rotation: 2.7 },
    { name: 'SM_FreeTree_03', position: [1, 0, -6.5], scale: 0.00833, rotation: 1.3 },
    { name: 'SM_FreeTree_04', position: [2, 0, -6.5], scale: 0.0075, rotation: 1.3 },
    { name: 'SM_FreeTree_05', position: [3, 0, -6], scale: 0.00833, rotation: 0.4 },
    { name: 'SM_FreeTree_06', position: [4, 0, -6], scale: 0.00917, rotation: 0.4 },
    { name: 'SM_FreeTree_07', position: [5, 0, -6.5], scale: 0.00833, rotation: 2.9 },
    { name: 'SM_FreeTree_08', position: [6, 0, -6.5], scale: 0.00833, rotation: 2.9 },
    { name: 'SM_FreeTree_01', position: [7, 0, -6], scale: 0.01, rotation: 1.8 },
    { name: 'SM_FreeTree_02', position: [8, 0, -6], scale: 0.01, rotation: 1.8 },
    { name: 'SM_FreeTree_03', position: [9, 0, -6.5], scale: 0.00917, rotation: 0.6 },
    { name: 'SM_FreeTree_04', position: [10, 0, -6], scale: 0.00833, rotation: 1.1 },

    // Dense forest row 5 (Z = -5 to -5.5)
    { name: 'SM_FreeTree_05', position: [-10, 0, -5], scale: 0.00917, rotation: 0.5 },
    { name: 'SM_FreeTree_06', position: [-9, 0, -5.5], scale: 0.00833, rotation: 1.9 },
    { name: 'SM_FreeTree_07', position: [-8, 0, -5], scale: 0.0075, rotation: 1.7 },
    { name: 'SM_FreeTree_08', position: [-7, 0, -5.5], scale: 0.00917, rotation: 2.8 },
    { name: 'SM_FreeTree_02', position: [-5, 0, -5], scale: 0.00833, rotation: 0.9 },
    { name: 'SM_FreeTree_03', position: [-4, 0, -5], scale: 0.00833, rotation: 0.9 },
    { name: 'SM_FreeTree_04', position: [-3, 0, -5.5], scale: 0.01, rotation: 1.5 },
    { name: 'SM_FreeTree_05', position: [-2, 0, -5.5], scale: 0.00917, rotation: 1.5 },
    { name: 'SM_FreeTree_06', position: [-1, 0, -5], scale: 0.00833, rotation: 2.7 },
    { name: 'SM_FreeTree_07', position: [0, 0, -5], scale: 0.0075, rotation: 2.7 },
    { name: 'SM_FreeTree_08', position: [1, 0, -5.5], scale: 0.00917, rotation: 1.3 },
    { name: 'SM_FreeTree_01', position: [2, 0, -5.5], scale: 0.00833, rotation: 1.3 },
    { name: 'SM_FreeTree_02', position: [3, 0, -5], scale: 0.00833, rotation: 0.4 },
    { name: 'SM_FreeTree_03', position: [4, 0, -5], scale: 0.00917, rotation: 0.4 },
    { name: 'SM_FreeTree_04', position: [5, 0, -5.5], scale: 0.00833, rotation: 2.9 },
    { name: 'SM_FreeTree_05', position: [6, 0, -5.5], scale: 0.00833, rotation: 2.9 },
    { name: 'SM_FreeTree_06', position: [7, 0, -5], scale: 0.01, rotation: 1.8 },
    { name: 'SM_FreeTree_04', position: [4, 0, -5.5], scale: 0.00833, rotation: 2.9 },
    { name: 'SM_FreeTree_05', position: [5, 0, -5.5], scale: 0.00833, rotation: 2.9 },
    { name: 'SM_FreeTree_06', position: [6, 0, -5], scale: 0.01, rotation: 1.8 },
    { name: 'SM_FreeTree_07', position: [8, 0, -5], scale: 0.01, rotation: 1.8 },
    { name: 'SM_FreeTree_08', position: [9, 0, -5.5], scale: 0.00917, rotation: 0.6 },
    { name: 'SM_FreeTree_01', position: [10, 0, -5], scale: 0.00833, rotation: 2.3 },
    { name: 'SM_FreeTree_04', position: [11, 0, -5.5], scale: 0.00833, rotation: 2.9 },
    { name: 'SM_FreeTree_05', position: [12, 0, -5.5], scale: 0.00833, rotation: 2.9 },
    { name: 'SM_FreeTree_06', position: [13, 0, -5], scale: 0.01, rotation: 1.8 },

    // Dense forest row 6 (Z = -4 to -4.5)
    { name: 'SM_FreeTree_02', position: [-10, 0, -3], scale: 0.00833, rotation: 1.2 },
    { name: 'SM_FreeTree_03', position: [-9, 0, -3.5], scale: 0.00917, rotation: 2.6 },
    { name: 'SM_FreeTree_04', position: [-8, 0, -3], scale: 0.00833, rotation: 0.8 },
    { name: 'SM_FreeTree_05', position: [-7, 0, -3.5], scale: 0.01, rotation: 1.7 },
    { name: 'SM_FreeTree_06', position: [-6, 0, -3], scale: 0.00917, rotation: 2.4 },
    { name: 'SM_FreeTree_07', position: [-5, 0, -3.5], scale: 0.00833, rotation: 1.1 },
    { name: 'SM_FreeTree_08', position: [-4, 0, -3], scale: 0.00917, rotation: 0.5 },
    { name: 'SM_FreeTree_01', position: [-3, 0, -3.5], scale: 0.00833, rotation: 2.7 },
    { name: 'SM_FreeTree_02', position: [-2, 0, -3], scale: 0.01, rotation: 1.6 },
    { name: 'SM_FreeTree_03', position: [-1, 0, -3.5], scale: 0.00833, rotation: 0.9 },
    { name: 'SM_FreeTree_04', position: [0, 0, -3], scale: 0.00917, rotation: 2.2 },
    { name: 'SM_FreeTree_05', position: [1, 0, -3.5], scale: 0.00833, rotation: 1.4 },
    { name: 'SM_FreeTree_06', position: [2, 0, -3], scale: 0.00833, rotation: 2.8 },
    { name: 'SM_FreeTree_07', position: [3, 0, -3.5], scale: 0.01, rotation: 0.7 },
    { name: 'SM_FreeTree_08', position: [3, 0, -3], scale: 0.00917, rotation: 1.8 },
    { name: 'SM_FreeTree_06', position: [4, 0, -3], scale: 0.00917, rotation: 1.8 },
    { name: 'SM_FreeTree_08', position: [6, 0, -3], scale: 0.00917, rotation: 1.8 },
    { name: 'SM_FreeTree_01', position: [5, 0, -3.5], scale: 0.00833, rotation: 0.4 },
    { name: 'SM_FreeTree_02', position: [6, 0, -3], scale: 0.00917, rotation: 1.5 },
    { name: 'SM_FreeTree_03', position: [7, 0, -3.5], scale: 0.01, rotation: 2.9 },
    { name: 'SM_FreeTree_04', position: [8, 0, -3], scale: 0.00833, rotation: 0.6 },
    { name: 'SM_FreeTree_05', position: [9, 0, -3.5], scale: 0.00917, rotation: 1.9 },
    { name: 'SM_FreeTree_06', position: [10, 0, -3], scale: 0.01, rotation: 2.3 },

    // Dense forest row 7 (nearest to pet, Z = -3 to -3.5)
    { name: 'SM_FreeTree_07', position: [-9, 0, -3.5], scale: 0.00833, rotation: 0.8 },
    { name: 'SM_FreeTree_08', position: [-8, 0, -3], scale: 0.00917, rotation: 2.1 },
    { name: 'SM_FreeTree_01', position: [-6, 0, -3.5], scale: 0.00833, rotation: 0.8 },
    { name: 'SM_FreeTree_02', position: [-6, 0, -3], scale: 0.00833, rotation: 1.3 },
    { name: 'SM_FreeTree_06', position: [-5, 0, -3], scale: 0.0075, rotation: 2.0 },
    { name: 'SM_FreeTree_04', position: [-4, 0, -3.5], scale: 0.00917, rotation: 1.6 },
    { name: 'SM_FreeTree_06', position: [-3, 0, -3.5], scale: 0.00833, rotation: 1.2 },
    { name: 'SM_FreeTree_02', position: [-2, 0, -3.5], scale: 0.00833, rotation: 1.2 },
    { name: 'SM_FreeTree_08', position: [-1, 0, -3.5], scale: 0.00833, rotation: 1.2 },
    { name: 'SM_FreeTree_06', position: [3, 0, -3.5], scale: 0.00833, rotation: 2.5 },
    { name: 'SM_FreeTree_06', position: [1, 0, -3.5], scale: 0.00833, rotation: 2.5 },
    { name: 'SM_FreeTree_06', position: [2, 0, -3.5], scale: 0.00833, rotation: 2.5 },
    { name: 'SM_FreeTree_07', position: [4, 0, -3], scale: 0.00917, rotation: 1.8 },
    { name: 'SM_FreeTree_08', position: [5, 0, -3], scale: 0.0075, rotation: 0.6 },
    { name: 'SM_FreeTree_01', position: [6, 0, -3.5], scale: 0.00833, rotation: 2.7 },
    { name: 'SM_FreeTree_02', position: [3, 0, -3.5], scale: 0.00833, rotation: 1.9 },
    { name: 'SM_FreeTree_02', position: [2, 0, -3.5], scale: 0.00833, rotation: 1.9 },
    { name: 'SM_FreeTree_02', position: [7, 0, -3.5], scale: 0.00833, rotation: 1.9 },
    { name: 'SM_FreeTree_03', position: [8, 0, -3], scale: 0.00917, rotation: 0.5 },
    { name: 'SM_FreeTree_04', position: [9, 0, -3.5], scale: 0.00833, rotation: 1.4 },
  ], [])

  // Configuration: Rock placements (scattered throughout)
  const rockPlacements: ModelPlacement[] = useMemo(() => [
    // Near trees
    { name: 'defaultMaterial', position: [-7, 0, -5], scale: 0.8, rotation: 0.4 },
    { name: 'defaultMaterial', position: [7.5, 0, -4], scale: 0.6, rotation: 1.8 },
    { name: 'defaultMaterial', position: [-9.5, 0, 0], scale: 0.9, rotation: 2.2 },
    { name: 'defaultMaterial', position: [9.5, 0, 1], scale: 0.7, rotation: 0.9 },

    // Scattered in mid-ground
    { name: 'defaultMaterial', position: [-4, 0, -4], scale: 0.5, rotation: 1.3 },
    { name: 'defaultMaterial', position: [3.5, 0, -5], scale: 0.6, rotation: 2.7 },
    { name: 'defaultMaterial', position: [-5, 0, 2], scale: 0.7, rotation: 0.6 },
    { name: 'defaultMaterial', position: [4, 0, 2.5], scale: 0.8, rotation: 1.9 },

    // Path markers toward pet (but not blocking)
    { name: 'defaultMaterial', position: [-2.5, 0, -2], scale: 0.4, rotation: 0.8 },
    { name: 'defaultMaterial', position: [2, 0, -2.5], scale: 0.5, rotation: 1.5 },
    { name: 'defaultMaterial', position: [-3, 0, 1], scale: 0.6, rotation: 2.1 },
    { name: 'defaultMaterial', position: [2.8, 0, 0.5], scale: 0.4, rotation: 0.3 },

    // Background rocks
    { name: 'defaultMaterial', position: [-6, 0, -8], scale: 1.0, rotation: 1.7 },
    { name: 'defaultMaterial', position: [5, 0, -8], scale: 0.9, rotation: 2.4 },
    { name: 'defaultMaterial', position: [-10, 0, -3], scale: 0.8, rotation: 1.1 },
    { name: 'defaultMaterial', position: [10, 0, -2], scale: 0.7, rotation: 2.9 },

    // Extra scattered rocks for density
    { name: 'defaultMaterial', position: [-8, 0, 2], scale: 0.5, rotation: 0.7 },
    { name: 'defaultMaterial', position: [7, 0, 2], scale: 0.6, rotation: 1.4 },
    { name: 'defaultMaterial', position: [-4.5, 0, -7], scale: 0.7, rotation: 2.0 },
    { name: 'defaultMaterial', position: [5.5, 0, -6], scale: 0.5, rotation: 0.5 },
  ], [])

  return (
    <group>
      {/* Render Trees */}
      {treePlacements.map((placement, index) => {
        const treeObject = treeContainer.getObjectByName(placement.name)
        if (!treeObject) {
          console.warn(`Tree group not found: ${placement.name}`)
          return null
        }

        // Clone the complete tree group
        const clonedTree = treeObject.clone(true)

        return (
          <primitive
            key={`tree-${index}`}
            object={clonedTree}
            position={placement.position}
            scale={placement.scale}
            rotation={[0, placement.rotation, 0]}
            castShadow
            receiveShadow
          />
        )
      })}

      {/* Render Rocks */}
      {rockPlacements.map((placement, index) => {
        const rockObject = rocksGLTF.scene.getObjectByName(placement.name)
        if (!rockObject) return null

        // Clone the rock for this instance
        const clonedRock = rockObject.clone(true)

        return (
          <primitive
            key={`rock-${index}`}
            object={clonedRock}
            position={placement.position}
            scale={placement.scale}
            rotation={[0, placement.rotation, 0]}
            castShadow
            receiveShadow
          />
        )
      })}
    </group>
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

      {/* Scene Models - Trees and Rocks */}
      <SceneModels />

      {/* Particles & Effects - Centered around pet */}
      <Sparkles
        count={200}
        scale={[4, 4, 4]}
        position={[0, 0.5, 0]}
        size={4}
        speed={0.4}
        opacity={0.5}
        color="lightyellow"
      />
      <Sparkles
        count={400}
        scale={[3, 4, 3]}
        position={[0, 1, 0]}
        size={8}
        speed={0.2}
        opacity={0.3}
        color="#ffffff"
      />
      <Sparkles
        count={200}
        scale={[10, 10, 10]}
        position={[0, 1, 0]}
        size={10}
        speed={0.3}
        opacity={0.4}
        color={particleColor}
      />
    </group>
  )
}
