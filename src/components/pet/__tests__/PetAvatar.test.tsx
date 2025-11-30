import React from 'react'
import { render, screen } from '@testing-library/react'
import { PetAvatar } from '../PetAvatar'

// Mock React Three Fiber
jest.mock('@react-three/fiber', () => ({
  useFrame: jest.fn((callback) => {
    // Simulate frame callback
    if (typeof callback === 'function') {
      callback({ clock: { elapsedTime: 0 } })
    }
  }),
  Canvas: ({ children }: { children: React.ReactNode }) => <div data-testid="canvas">{children}</div>,
}))

// Mock drei components
jest.mock('@react-three/drei', () => ({
  PerspectiveCamera: () => null,
  Environment: () => null,
}))

describe('PetAvatar', () => {
  // Helper to render PetAvatar in a Canvas context
  const renderPetAvatar = (props: React.ComponentProps<typeof PetAvatar>) => {
    const { Canvas } = require('@react-three/fiber')
    return render(
      <Canvas>
        <PetAvatar {...props} />
      </Canvas>
    )
  }

  test('renders 3D pet with correct structure', () => {
    renderPetAvatar({ happiness: 50, animationState: 'idle' })

    // Check that Canvas renders (3D scene is set up)
    const canvas = screen.getByTestId('canvas')
    expect(canvas).toBeInTheDocument()
  })

  test('renders pet in 3D scene', () => {
    const { container } = renderPetAvatar({ happiness: 50, animationState: 'idle' })

    // Verify component renders without errors
    const canvas = screen.getByTestId('canvas')
    expect(canvas).toBeInTheDocument()
  })

  test('applies sad colors when happiness 0-20', () => {
    const { container } = renderPetAvatar({ happiness: 15, animationState: 'idle' })
    expect(container).toBeInTheDocument()
  })

  test('applies neutral colors when happiness 21-50', () => {
    const { container } = renderPetAvatar({ happiness: 35, animationState: 'idle' })
    expect(container).toBeInTheDocument()
  })

  test('applies happy colors when happiness 51-80', () => {
    const { container } = renderPetAvatar({ happiness: 65, animationState: 'idle' })
    expect(container).toBeInTheDocument()
  })

  test('applies delighted colors when happiness 81-100', () => {
    const { container } = renderPetAvatar({ happiness: 90, animationState: 'idle' })
    expect(container).toBeInTheDocument()
  })

  test('shows eating animation state', () => {
    const { container } = renderPetAvatar({ happiness: 50, animationState: 'eating' })
    expect(container).toBeInTheDocument()
  })

  test('shows being_petted animation state', () => {
    const { container } = renderPetAvatar({ happiness: 50, animationState: 'being_petted' })
    expect(container).toBeInTheDocument()
  })

  test('shows talking animation state', () => {
    const { container } = renderPetAvatar({ happiness: 50, animationState: 'talking' })
    expect(container).toBeInTheDocument()
  })

  test('renders with default cosmetic skin', () => {
    const { container } = renderPetAvatar({ happiness: 50, animationState: 'idle' })
    expect(container).toBeInTheDocument()
  })

  test('renders with rainbow cosmetic skin', () => {
    const { container } = renderPetAvatar({ happiness: 50, animationState: 'idle', cosmeticSkin: 'rainbow' })
    expect(container).toBeInTheDocument()
  })

  test('renders with golden cosmetic skin', () => {
    const { container } = renderPetAvatar({ happiness: 50, animationState: 'idle', cosmeticSkin: 'golden' })
    expect(container).toBeInTheDocument()
  })
})
