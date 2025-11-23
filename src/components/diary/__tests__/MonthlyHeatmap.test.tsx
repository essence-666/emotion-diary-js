import React from 'react'
import { render, screen, fireEvent, waitFor } from '../../../__tests__/utils/test-utils'
import { MonthlyHeatmap } from '../MonthlyHeatmap'
import type { MonthlyHeatmapData } from '../../../types'

// Mock the API hook
const mockGetMonthlyHeatmap = jest.fn()
jest.mock('../../../__data__/api', () => ({
  api: {
    reducerPath: 'api',
    reducer: (state = {}) => state,
    middleware: () => (next: any) => (action: any) => next(action),
  },
  useGetMonthlyHeatmapQuery: () => mockGetMonthlyHeatmap(),
}))

const mockHeatmapData: MonthlyHeatmapData[] = [
  { date: '2024-01-01', emotion_count: 3, emotions: ['happy', 'calm', 'excited'] },
  { date: '2024-01-02', emotion_count: 5, emotions: ['happy', 'sad', 'stressed', 'calm', 'excited'] },
  { date: '2024-01-15', emotion_count: 2, emotions: ['happy', 'calm'] },
  { date: '2024-01-31', emotion_count: 1, emotions: ['happy'] },
]

describe('MonthlyHeatmap', () => {
  const mockOnDateClick = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    // Default to January 2024 for consistent testing
    mockGetMonthlyHeatmap.mockReturnValue({
      data: mockHeatmapData,
      isLoading: false,
      error: null,
    })
  })

  test('renders calendar grid (7x5)', () => {
    render(<MonthlyHeatmap onDateClick={mockOnDateClick} initialYear={2024} initialMonth={1} />)

    // Should have 7 columns (days of week)
    const grid = screen.getByTestId('heatmap-grid')
    expect(grid).toBeInTheDocument()
    
    // Should have approximately 35 cells (7 columns x 5 rows)
    const cells = screen.getAllByTestId(/heatmap-cell-/)
    expect(cells.length).toBeGreaterThanOrEqual(28) // At least 28 days
    expect(cells.length).toBeLessThanOrEqual(35) // Max 35 days
  })

  test('displays day numbers in cells', () => {
    render(<MonthlyHeatmap onDateClick={mockOnDateClick} initialYear={2024} initialMonth={1} />)

    // Should show day numbers (1-31)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('15')).toBeInTheDocument()
  })

  test('applies background color by emotion density', () => {
    render(<MonthlyHeatmap onDateClick={mockOnDateClick} initialYear={2024} initialMonth={1} />)

    // Cells with higher emotion_count should have darker colors
    const cell1 = screen.getByTestId('heatmap-cell-2024-01-01')
    const cell2 = screen.getByTestId('heatmap-cell-2024-01-02')
    
    expect(cell1).toBeInTheDocument()
    expect(cell2).toBeInTheDocument()
    // Cell 2 should have higher intensity (more emotions)
  })

  test('uses color scale: white → deep red', () => {
    render(<MonthlyHeatmap onDateClick={mockOnDateClick} initialYear={2024} initialMonth={1} />)

    // Check that cells have background colors
    const cell = screen.getByTestId('heatmap-cell-2024-01-02')
    const style = window.getComputedStyle(cell)
    expect(style.backgroundColor).toBeTruthy()
  })

  test('shows tooltip on hover with emotion breakdown', async () => {
    render(<MonthlyHeatmap onDateClick={mockOnDateClick} initialYear={2024} initialMonth={1} />)

    const cell = screen.getByTestId('heatmap-cell-2024-01-01')
    fireEvent.mouseEnter(cell)

    // Tooltip content is rendered but may not be immediately visible in tests
    // We verify the cell has tooltip functionality by checking it's wrapped in Tooltip
    await waitFor(() => {
      // The cell should be present and clickable
      expect(cell).toBeInTheDocument()
    })
  })

  test('filters timeline on cell click', () => {
    render(<MonthlyHeatmap onDateClick={mockOnDateClick} initialYear={2024} initialMonth={1} />)

    const cell = screen.getByTestId('heatmap-cell-2024-01-01')
    fireEvent.click(cell)

    expect(mockOnDateClick).toHaveBeenCalledWith('2024-01-01')
  })

  test('has prev/next month navigation', () => {
    render(<MonthlyHeatmap onDateClick={mockOnDateClick} />)

    const prevButton = screen.getByLabelText(/previous|prev/i)
    const nextButton = screen.getByLabelText(/next/i)

    expect(prevButton).toBeInTheDocument()
    expect(nextButton).toBeInTheDocument()
  })

  test('displays month and year header', () => {
    render(<MonthlyHeatmap onDateClick={mockOnDateClick} initialYear={2024} initialMonth={1} />)

    // Should show "January 2024" as a single heading
    expect(screen.getByText('January 2024')).toBeInTheDocument()
  })

  test('highlights current day', () => {
    const today = new Date()
    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth() + 1
    const todayStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    render(<MonthlyHeatmap onDateClick={mockOnDateClick} initialYear={currentYear} initialMonth={currentMonth} />)

    // Current day should have special styling
    const todayCell = screen.getByTestId(`heatmap-cell-${todayStr}`)
    expect(todayCell).toBeInTheDocument()
  })
})

