import React from 'react'
import { render, screen, fireEvent, waitFor } from '../../../__tests__/utils/test-utils'
import { EntryEditor } from '../EntryEditor'
import type { DiaryEntry, DiaryTag } from '../../../types'

// Mock the API mutations
const mockCreateEntry = jest.fn()
const mockUpdateEntry = jest.fn()

jest.mock('../../../__data__/api', () => ({
  api: {
    reducerPath: 'api',
    reducer: (state = {}) => state,
    middleware: () => (next: any) => (action: any) => next(action),
  },
  useCreateDiaryEntryMutation: () => [mockCreateEntry, { isLoading: false }],
  useUpdateDiaryEntryMutation: () => [mockUpdateEntry, { isLoading: false }],
}))

// Mock TagManager
jest.mock('../TagManager', () => ({
  TagManager: ({ onApply, selectedTagIds }: any) => (
    <div data-testid="tag-manager">
      <button onClick={() => onApply([1, 2])}>Apply Tags</button>
      <span>Selected: {selectedTagIds?.length || 0}</span>
    </div>
  ),
}))

const mockPopularTags: DiaryTag[] = [
  { id: 1, name: 'grateful', color: '#fbbf24' },
  { id: 2, name: 'reflection', color: '#60a5fa' },
]

const mockEntry: DiaryEntry = {
  id: 1,
  user_id: 1,
  title: 'Test Entry',
  content: 'This is test content',
  created_at: '2024-01-15T10:30:00Z',
  updated_at: '2024-01-15T10:30:00Z',
  tags: [{ id: 1, name: 'grateful', color: '#fbbf24' }] as DiaryTag[],
}

describe('EntryEditor', () => {
  const mockOnClose = jest.fn()
  const mockOnSave = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateEntry.mockResolvedValue({
      data: { ok: true, entry: mockEntry },
    })
    mockUpdateEntry.mockResolvedValue({
      data: { ok: true, entry: mockEntry },
    })
  })

  test('renders modal form', () => {
    render(
      <EntryEditor
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        popularTags={mockPopularTags}
      />
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  test('has title input field', () => {
    render(
      <EntryEditor
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        popularTags={mockPopularTags}
      />
    )

    const titleInput = screen.getByLabelText(/title/i) || screen.getByPlaceholderText(/title/i)
    expect(titleInput).toBeInTheDocument()
  })

  test('has content textarea (auto-expand)', () => {
    render(
      <EntryEditor
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        popularTags={mockPopularTags}
      />
    )

    const contentTextarea = screen.getByLabelText(/content/i) || screen.getByPlaceholderText(/content|write/i)
    expect(contentTextarea).toBeInTheDocument()
    expect(contentTextarea.tagName).toBe('TEXTAREA')
  })

  test('has tag selector', () => {
    render(
      <EntryEditor
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        popularTags={mockPopularTags}
      />
    )

    expect(screen.getByTestId('tag-manager')).toBeInTheDocument()
  })

  test('calls POST on create', async () => {
    render(
      <EntryEditor
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        popularTags={mockPopularTags}
      />
    )

    const titleInput = screen.getByLabelText(/title/i) || screen.getByPlaceholderText(/title/i)
    const contentTextarea = screen.getByLabelText(/content/i) || screen.getByPlaceholderText(/content|write/i)
    const saveButton = screen.getByRole('button', { name: /save/i })

    fireEvent.change(titleInput, { target: { value: 'New Entry' } })
    fireEvent.change(contentTextarea, { target: { value: 'Entry content' } })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockCreateEntry).toHaveBeenCalledWith({
        title: 'New Entry',
        content: 'Entry content',
        tag_ids: [],
      })
    })
  })

  test('calls PUT on update', async () => {
    render(
      <EntryEditor
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        popularTags={mockPopularTags}
        entry={mockEntry}
      />
    )

    const titleInput = screen.getByLabelText(/title/i) || screen.getByPlaceholderText(/title/i)
    const saveButton = screen.getByRole('button', { name: /save/i })

    fireEvent.change(titleInput, { target: { value: 'Updated Entry' } })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(mockUpdateEntry).toHaveBeenCalledWith({
        id: mockEntry.id,
        data: {
          title: 'Updated Entry',
          content: mockEntry.content,
          tag_ids: [1],
        },
      })
    })
  })

  test('shows auto-save indicator', async () => {
    render(
      <EntryEditor
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        popularTags={mockPopularTags}
      />
    )

    const contentTextarea = screen.getByLabelText(/content/i) || screen.getByPlaceholderText(/content|write/i)
    
    fireEvent.change(contentTextarea, { target: { value: 'Test content' } })

    // Wait for debounced auto-save to trigger (2 seconds delay)
    await waitFor(() => {
      expect(screen.getByText(/Saving|Saved/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  test('closes modal on Cancel', () => {
    render(
      <EntryEditor
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        popularTags={mockPopularTags}
      />
    )

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  test('validates required fields', () => {
    render(
      <EntryEditor
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        popularTags={mockPopularTags}
      />
    )

    // Save button should be disabled when content is empty (validation)
    const saveButton = screen.getByRole('button', { name: /save/i })
    expect(saveButton).toBeDisabled()

    // Add content - button should be enabled
    const contentTextarea = screen.getByLabelText(/content/i) || screen.getByPlaceholderText(/content|write/i)
    fireEvent.change(contentTextarea, { target: { value: 'Test content' } })
    
    // Button should now be enabled
    expect(saveButton).not.toBeDisabled()
  })
})

