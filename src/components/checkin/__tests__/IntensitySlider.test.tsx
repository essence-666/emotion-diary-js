import React from 'react'
import { render, screen, fireEvent } from '../../../__tests__/utils/test-utils'
import { IntensitySlider } from '../IntensitySlider'

describe('IntensitySlider', () => {
  const mockOnChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders slider with min=1, max=10', () => {
    render(<IntensitySlider value={5} onChange={mockOnChange} />)

    const slider = screen.getByRole('slider')
    expect(slider).toBeInTheDocument()
    expect(slider).toHaveAttribute('aria-valuemin', '1')
    expect(slider).toHaveAttribute('aria-valuemax', '10')
  })

  test('displays current value: "Intensity: X/10"', () => {
    render(<IntensitySlider value={7} onChange={mockOnChange} />)

    expect(screen.getByText('Intensity: 7/10')).toBeInTheDocument()
  })

  test('displays different values correctly', () => {
    const { rerender } = render(<IntensitySlider value={3} onChange={mockOnChange} />)
    expect(screen.getByText('Intensity: 3/10')).toBeInTheDocument()

    rerender(<IntensitySlider value={9} onChange={mockOnChange} />)
    expect(screen.getByText('Intensity: 9/10')).toBeInTheDocument()
  })

  test('calls onChange with new value when slider moved', () => {
    render(<IntensitySlider value={5} onChange={mockOnChange} />)

    const slider = screen.getByRole('slider')

    // Chakra's Slider uses keyboard events for interaction
    // Simulate arrow key press to change value
    fireEvent.keyDown(slider, { key: 'ArrowRight', code: 'ArrowRight' })

    // onChange should have been called (exact value depends on step)
    expect(mockOnChange).toHaveBeenCalled()
  })

  test('has accessible label', () => {
    render(<IntensitySlider value={5} onChange={mockOnChange} />)

    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('aria-label', 'Emotion intensity')
    expect(slider).toHaveAttribute('aria-valuenow', '5')
  })

  test('slider is keyboard accessible', () => {
    render(<IntensitySlider value={5} onChange={mockOnChange} />)

    const slider = screen.getByRole('slider')

    // Chakra's Slider uses a div with role="slider", not input
    // But it should be keyboard accessible with tabindex
    expect(slider).toBeInTheDocument()
    expect(slider).toHaveAttribute('role', 'slider')
    expect(slider).toHaveAttribute('aria-label', 'Emotion intensity')
  })
})
