import { renderHook, act } from '@testing-library/react'
import { useDiary } from '../useDiary'
import { useGetDiaryEntriesQuery, useCreateDiaryEntryMutation, useUpdateDiaryEntryMutation, useDeleteDiaryEntryMutation } from '../../__data__/api'

jest.mock('../../__data__/api')

describe('useDiary', () => {
  const mockEntries = [{ id: 1, content: 'Hello', tags: [] }]

  beforeEach(() => {
    (useGetDiaryEntriesQuery as jest.Mock).mockReturnValue({
      data: mockEntries,
      isLoading: false,
      refetch: jest.fn(),
    })
    ;(useCreateDiaryEntryMutation as jest.Mock).mockReturnValue([jest.fn(), {}])
    ;(useUpdateDiaryEntryMutation as jest.Mock).mockReturnValue([jest.fn(), {}])
    ;(useDeleteDiaryEntryMutation as jest.Mock).mockReturnValue([jest.fn(), {}])
  })

  test('returns entries', () => {
    const { result } = renderHook(() => useDiary())
    expect(result.current.entries).toEqual(mockEntries)
  })

  test('createEntry calls mutation', () => {
    const mockCreate = jest.fn().mockResolvedValue({ ok: true })
    ;(useCreateDiaryEntryMutation as jest.Mock).mockReturnValue([mockCreate, {}])

    const { result } = renderHook(() => useDiary())

    act(() => {
      result.current.createEntry({ content: 'Test' })
    })

    expect(mockCreate).toHaveBeenCalled()
  })

  test('updateEntry calls mutation', () => {
    const mockUpdate = jest.fn().mockResolvedValue({ ok: true })
    ;(useUpdateDiaryEntryMutation as jest.Mock).mockReturnValue([mockUpdate, {}])

    const { result } = renderHook(() => useDiary())

    act(() => {
      result.current.updateEntry(1, { content: 'Updated' })
    })

    expect(mockUpdate).toHaveBeenCalled()
  })

  test('deleteEntry calls mutation', () => {
    const mockDelete = jest.fn().mockResolvedValue({ ok: true })
    ;(useDeleteDiaryEntryMutation as jest.Mock).mockReturnValue([mockDelete, {}])

    const { result } = renderHook(() => useDiary())

    act(() => {
      result.current.deleteEntry(1)
    })

    expect(mockDelete).toHaveBeenCalled()
  })
})
