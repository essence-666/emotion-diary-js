import React from 'react'
import { render, screen, fireEvent, waitFor } from '../../../__tests__/utils/test-utils'
import { TagManager } from '../TagManager'
import type { DiaryTag } from '../../../types'

const mockPopularTags: DiaryTag[] = [
  { id: 1, name: 'grateful', color: '#fbbf24' },
  { id: 2, name: 'reflection', color: '#60a5fa' },
  { id: 3, name: 'stress', color: '#ef5350' },
  { id: 4, name: 'productivity', color: '#10b981' },
  { id: 5, name: 'family', color: '#a78bfa' },
]

describe('TagManager', () => {
  const mockOnApply = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders multi-select dropdown', () => {
    render(<TagManager popularTags={mockPopularTags} onApply={mockOnApply} />)

    // Should render a button or trigger to open the dropdown
    expect(screen.getByTestId('tag-manager-button')).toBeInTheDocument()
  })

  test('displays popular tags first', async () => {
    render(<TagManager popularTags={mockPopularTags} onApply={mockOnApply} />)

    // Open the dropdown
    const trigger = screen.getByTestId('tag-manager-button')
    fireEvent.click(trigger)

    await waitFor(() => {
      // Popular tags should be visible
      expect(screen.getByText('grateful')).toBeInTheDocument()
      expect(screen.getByText('reflection')).toBeInTheDocument()
    })
  })

  test('shows checkboxes for tags', async () => {
    render(<TagManager popularTags={mockPopularTags} onApply={mockOnApply} />)

    // Open the dropdown
    const trigger = screen.getByTestId('tag-manager-button')
    fireEvent.click(trigger)

    await waitFor(() => {
      // Checkboxes should be present for each tag
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes.length).toBeGreaterThan(0)
    })
  })

  test('shows tag color indicators', async () => {
    render(<TagManager popularTags={mockPopularTags} onApply={mockOnApply} />)

    // Open the dropdown
    const trigger = screen.getByTestId('tag-manager-button')
    fireEvent.click(trigger)

    await waitFor(() => {
      // Tag colors should be visible (as badges or indicators)
      const gratefulTag = screen.getByText('grateful')
      expect(gratefulTag).toBeInTheDocument()
    })
  })

  test('allows custom tag input', async () => {
    render(<TagManager popularTags={mockPopularTags} onApply={mockOnApply} />)

    // Open the dropdown
    const trigger = screen.getByTestId('tag-manager-button')
    fireEvent.click(trigger)

    await waitFor(() => {
      // Should have an input field for custom tags
      const input = screen.getByTestId('custom-tag-input') || screen.getByPlaceholderText(/enter tag name/i)
      expect(input).toBeInTheDocument()
    })
  })

  test('calls onApply with selected tags', async () => {
    render(<TagManager popularTags={mockPopularTags} onApply={mockOnApply} />)

    // Open the dropdown
    const trigger = screen.getByTestId('tag-manager-button')
    fireEvent.click(trigger)

    await waitFor(() => {
      // Select a tag
      const gratefulCheckbox = screen.getByLabelText(/grateful/i)
      fireEvent.click(gratefulCheckbox)
    })

    // Click Apply button
    const applyButton = screen.getByText(/apply/i)
    fireEvent.click(applyButton)

    await waitFor(() => {
      expect(mockOnApply).toHaveBeenCalled()
      const callArgs = mockOnApply.mock.calls[0][0]
      expect(Array.isArray(callArgs)).toBe(true)
      expect(callArgs.length).toBeGreaterThan(0)
    })
  })

  test('clears selection on Clear button', async () => {
    render(<TagManager popularTags={mockPopularTags} onApply={mockOnApply} />)

    // Open the dropdown
    const trigger = screen.getByTestId('tag-manager-button')
    fireEvent.click(trigger)

    await waitFor(() => {
      // Select a tag
      const gratefulCheckbox = screen.getByLabelText(/grateful/i)
      fireEvent.click(gratefulCheckbox)
    })

    // Click Clear button
    const clearButton = screen.getByText(/clear/i)
    fireEvent.click(clearButton)

    await waitFor(() => {
      // Selection should be cleared
      const gratefulCheckbox = screen.getByLabelText(/grateful/i)
      expect(gratefulCheckbox).not.toBeChecked()
    })
  })

  test('filters diary entries by selected tags', async () => {
    render(<TagManager popularTags={mockPopularTags} onApply={mockOnApply} />)

    // Open the dropdown
    const trigger = screen.getByTestId('tag-manager-button')
    fireEvent.click(trigger)

    await waitFor(() => {
      // Select multiple tags
      const gratefulCheckbox = screen.getByLabelText(/grateful/i)
      const reflectionCheckbox = screen.getByLabelText(/reflection/i)
      
      fireEvent.click(gratefulCheckbox)
      fireEvent.click(reflectionCheckbox)
    })

    // Click Apply
    const applyButton = screen.getByText(/apply/i)
    fireEvent.click(applyButton)

    await waitFor(() => {
      expect(mockOnApply).toHaveBeenCalled()
      const selectedTags = mockOnApply.mock.calls[0][0]
      expect(selectedTags.length).toBe(2)
    })
  })
})

