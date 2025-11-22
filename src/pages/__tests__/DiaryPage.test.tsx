import { render, screen, fireEvent } from '@testing-library/react'
import { DiaryPage } from '../DiaryPage'
import { MonthlyHeatmap } from '../../components/diary/MonthlyHeatmap'
import { DiaryTimeline } from '../../components/diary/DiaryTimeline'

jest.mock('../../components/diary/MonthlyHeatmap')
jest.mock('../../components/diary/DiaryTimeline')

describe('DiaryPage', () => {
  beforeEach(() => {
    (MonthlyHeatmap as jest.Mock).mockReturnValue(<div data-testid="heatmap" />)
    (DiaryTimeline as jest.Mock).mockReturnValue(<div data-testid="timeline" />)
  })

  test('renders page layout', () => {
    render(<DiaryPage />)
    expect(screen.getByTestId('diary-page')).toBeInTheDocument()
  })

  test('displays MonthlyHeatmap in left sidebar on desktop', () => {
    render(<DiaryPage />)
    expect(screen.getByTestId('heatmap')).toBeInTheDocument()
  })

  test('displays DiaryTimeline in main area', () => {
    render(<DiaryPage />)
    expect(screen.getByTestId('timeline')).toBeInTheDocument()
  })

  test('shows mobile tabs', () => {
    Object.defineProperty(window, 'innerWidth', { value: 400 })
    render(<DiaryPage />)
    expect(screen.getByText('Timeline')).toBeInTheDocument()
    expect(screen.getByText('Heatmap')).toBeInTheDocument()
  })

  test('switches tab on mobile', () => {
    Object.defineProperty(window, 'innerWidth', { value: 400 })
    render(<DiaryPage />)

    fireEvent.click(screen.getByText('Heatmap'))
    expect(screen.getByTestId('heatmap')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Timeline'))
    expect(screen.getByTestId('timeline')).toBeInTheDocument()
  })
})
