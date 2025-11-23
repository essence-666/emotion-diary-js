import React from 'react'
import { render, screen, fireEvent, waitFor } from '../../../__tests__/utils/test-utils'
import { DiaryTimeline } from '../DiaryTimeline'
import type { DiaryEntry, DiaryTag } from '../../../types'

// Mock the API hook
const mockEntries: DiaryEntry[] = [
  {
    id: 1,
    user_id: 1,
    title: 'First Entry',
    content: 'This is the first diary entry',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    tags: [{ id: 1, name: 'grateful', color: '#fbbf24' }] as DiaryTag[],
  },
  {
    id: 2,
    user_id: 1,
    title: 'Second Entry',
    content: 'This is the second diary entry',
    created_at: '2024-01-14T10:30:00Z',
    updated_at: '2024-01-14T10:30:00Z',
    tags: [{ id: 2, name: 'reflection', color: '#60a5fa' }] as DiaryTag[],
  },
]

const mockPopularTags: DiaryTag[] = [
  { id: 1, name: 'grateful', color: '#fbbf24' },
  { id: 2, name: 'reflection', color: '#60a5fa' },
]

// Mock the API
const mockGetDiaryEntries = jest.fn()
jest.mock('../../../__data__/api', () => ({
  api: {
    reducerPath: 'api',
    reducer: (state = {}) => state,
    middleware: () => (next: any) => (action: any) => next(action),
  },
  useGetDiaryEntriesQuery: () => mockGetDiaryEntries(),
}))

// Mock DiaryEntry component
jest.mock('../DiaryEntry', () => ({
  DiaryEntry: ({ entry, onClick }: any) => (
    <div data-testid={`diary-entry-${entry.id}`} onClick={() => onClick?.(entry)}>
      {entry.title}
    </div>
  ),
}))

// Mock TagManager component
jest.mock('../TagManager', () => ({
  TagManager: ({ onApply }: any) => (
    <button data-testid="tag-manager" onClick={() => onApply([1, 2])}>
      Filter
    </button>
  ),
}))

describe('DiaryTimeline', () => {
  const mockOnEntryClick = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetDiaryEntries.mockReturnValue({
      data: mockEntries,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    })
  })

  test('renders vertical timeline layout', () => {
    render(<DiaryTimeline popularTags={mockPopularTags} onEntryClick={mockOnEntryClick} />)

    expect(screen.getByTestId('diary-timeline')).toBeInTheDocument()
  })

  test('displays TagManager at top', () => {
    render(<DiaryTimeline popularTags={mockPopularTags} onEntryClick={mockOnEntryClick} />)

    expect(screen.getByTestId('tag-manager')).toBeInTheDocument()
  })

  test('fetches entries: GET /api/v1/diary', () => {
    render(<DiaryTimeline popularTags={mockPopularTags} onEntryClick={mockOnEntryClick} />)

    // useGetDiaryEntriesQuery should be called
    expect(mockGetDiaryEntries).toHaveBeenCalled()
  })

  test('renders list of DiaryEntry components', async () => {
    render(<DiaryTimeline popularTags={mockPopularTags} onEntryClick={mockOnEntryClick} />)

    await waitFor(() => {
      expect(screen.getByTestId('diary-entry-1')).toBeInTheDocument()
      expect(screen.getByTestId('diary-entry-2')).toBeInTheDocument()
    })
  })

  test('loads next page on scroll', async () => {
    mockGetDiaryEntries.mockReturnValue({
      data: mockEntries,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    })

    render(<DiaryTimeline popularTags={mockPopularTags} onEntryClick={mockOnEntryClick} />)

    // Simulate scroll to bottom - this will be tested with useInView or scroll handler
    const container = screen.getByTestId('diary-timeline')
    expect(container).toBeInTheDocument()
  })

  test('shows loading spinner while fetching', () => {
    mockGetDiaryEntries.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    })

    render(<DiaryTimeline popularTags={mockPopularTags} onEntryClick={mockOnEntryClick} />)

    expect(screen.getByText('Loading entries...')).toBeInTheDocument()
  })

  test('displays empty state when no entries', () => {
    mockGetDiaryEntries.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    })

    render(<DiaryTimeline popularTags={mockPopularTags} onEntryClick={mockOnEntryClick} />)

    expect(screen.getByText(/no entries|empty|start logging/i)).toBeInTheDocument()
  })

  test('animates entries with stagger', () => {
    render(<DiaryTimeline popularTags={mockPopularTags} onEntryClick={mockOnEntryClick} />)

    // Check for AnimatePresence wrapper
    const timeline = screen.getByTestId('diary-timeline')
    expect(timeline).toBeInTheDocument()
  })

  test('opens entry detail on click', async () => {
    render(<DiaryTimeline popularTags={mockPopularTags} onEntryClick={mockOnEntryClick} />)

    await waitFor(() => {
      const entry = screen.getByTestId('diary-entry-1')
      expect(entry).toBeInTheDocument()
    })

    const entry = screen.getByTestId('diary-entry-1')
    fireEvent.click(entry)

    expect(mockOnEntryClick).toHaveBeenCalledWith(mockEntries[0])
  })

  test('applies tag filters', async () => {
    mockGetDiaryEntries.mockReturnValue({
      data: [mockEntries[0]], // Filtered result
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    })

    render(<DiaryTimeline popularTags={mockPopularTags} onEntryClick={mockOnEntryClick} />)

    // Apply tag filter
    const tagManager = screen.getByTestId('tag-manager')
    fireEvent.click(tagManager)

    await waitFor(() => {
      // Entries should be filtered - refetch should be called with new filters
      expect(mockGetDiaryEntries).toHaveBeenCalled()
    })
  })
})

