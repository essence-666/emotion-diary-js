import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import DiaryPage from '../DiaryPage'

jest.mock('../../components/diary/MonthlyHeatmap', () => ({
  MonthlyHeatmap: () => <div data-testid="monthly-heatmap" />,
}))

jest.mock('../../components/diary/DiaryTimeline', () => ({
  DiaryTimeline: () => <div data-testid="diary-timeline" />,
}))

const mockUseMediaQuery = jest.fn()
jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'),
  useMediaQuery: (query: string) => mockUseMediaQuery(query),
}))

describe('DiaryPage', () => {
  beforeEach(() => {
    // Default to desktop
    mockUseMediaQuery.mockReturnValue([false])
  })

  test('renders page layout', () => {
    render(<DiaryPage />)
    expect(screen.getByTestId('diary-page')).toBeInTheDocument()
    expect(screen.getByTestId('diary-page-title')).toBeInTheDocument()
  })

  test('displays MonthlyHeatmap in left sidebar on desktop', () => {
    render(<DiaryPage />)
    expect(screen.getByTestId('diary-desktop-layout')).toBeInTheDocument()
    expect(screen.getByTestId('diary-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('monthly-heatmap')).toBeInTheDocument()
  })

  test('displays DiaryTimeline in main area', () => {
    render(<DiaryPage />)
    expect(screen.getByTestId('diary-main-content')).toBeInTheDocument()
    expect(screen.getByTestId('diary-timeline')).toBeInTheDocument()
  })

  test('shows mobile tabs', () => {
    mockUseMediaQuery.mockReturnValue([true])
    render(<DiaryPage />)
    expect(screen.getByTestId('diary-mobile-tabs')).toBeInTheDocument()
    expect(screen.getByTestId('tab-timeline')).toBeInTheDocument()
    expect(screen.getByTestId('tab-heatmap')).toBeInTheDocument()
  })

  test('switches tab on mobile', () => {
    mockUseMediaQuery.mockReturnValue([true])
    render(<DiaryPage />)

    const heatmapTab = screen.getByTestId('tab-heatmap')
    const timelineTab = screen.getByTestId('tab-timeline')

    fireEvent.click(heatmapTab)
    expect(screen.getByTestId('tab-panel-heatmap')).toBeVisible()

    fireEvent.click(timelineTab)
    expect(screen.getByTestId('tab-panel-timeline')).toBeVisible()
  })
})
