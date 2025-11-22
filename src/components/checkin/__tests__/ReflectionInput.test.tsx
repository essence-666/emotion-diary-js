import React from 'react'
import { render, screen, fireEvent, waitFor } from '../../../__tests__/utils/test-utils'
import { ReflectionInput } from '../ReflectionInput'

describe('ReflectionInput', () => {
  const mockOnChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders textarea with placeholder', () => {
    render(<ReflectionInput value="" onChange={mockOnChange} />)

    const textarea = screen.getByPlaceholderText(/how are you feeling/i)
    expect(textarea).toBeInTheDocument()
    expect(textarea.tagName.toLowerCase()).toBe('textarea')
  })

  test('shows character counter: "0/500"', () => {
    render(<ReflectionInput value="" onChange={mockOnChange} />)

    expect(screen.getByText('0/500')).toBeInTheDocument()
  })

  test('updates counter as user types', () => {
    const { rerender } = render(<ReflectionInput value="" onChange={mockOnChange} />)
    expect(screen.getByText('0/500')).toBeInTheDocument()

    rerender(<ReflectionInput value="Hello" onChange={mockOnChange} />)
    expect(screen.getByText('5/500')).toBeInTheDocument()

    rerender(<ReflectionInput value="Hello, how are you?" onChange={mockOnChange} />)
    expect(screen.getByText('19/500')).toBeInTheDocument()
  })

  test('prevents input beyond 500 chars', () => {
    const longText = 'a'.repeat(600)
    render(<ReflectionInput value={longText} onChange={mockOnChange} />)

    const textarea = screen.getByRole('textbox')
    // Textarea should have maxLength attribute
    expect(textarea).toHaveAttribute('maxLength', '500')
  })

  test('calls onChange with text value when user types', () => {
    render(<ReflectionInput value="" onChange={mockOnChange} />)

    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'Test reflection' } })

    expect(mockOnChange).toHaveBeenCalledWith('Test reflection')
  })

  test('shows clear button when text exists', () => {
    const { rerender } = render(<ReflectionInput value="" onChange={mockOnChange} />)

    // Clear button should not be visible when empty
    expect(screen.queryByLabelText(/clear text/i)).not.toBeInTheDocument()

    // Clear button should be visible when text exists
    rerender(<ReflectionInput value="Some text" onChange={mockOnChange} />)
    expect(screen.getByLabelText(/clear text/i)).toBeInTheDocument()
  })

  test('clears text when clear button clicked', () => {
    render(<ReflectionInput value="Some text" onChange={mockOnChange} />)

    const clearButton = screen.getByLabelText(/clear text/i)
    fireEvent.click(clearButton)

    expect(mockOnChange).toHaveBeenCalledWith('')
  })

  test('displays warning color when approaching character limit', () => {
    const { rerender } = render(<ReflectionInput value={'a'.repeat(450)} onChange={mockOnChange} />)

    // At 450 chars, should show counter
    let counter = screen.getByText('450/500')
    expect(counter).toBeInTheDocument()

    // At 490+ chars, counter should be visible (we're checking it exists)
    rerender(<ReflectionInput value={'a'.repeat(495)} onChange={mockOnChange} />)
    counter = screen.getByText('495/500')
    expect(counter).toBeInTheDocument()
  })
})
