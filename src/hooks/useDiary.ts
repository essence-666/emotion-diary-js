import { useCallback } from 'react'
import {
  useGetDiaryEntriesQuery,
  useCreateDiaryEntryMutation,
  useUpdateDiaryEntryMutation,
  useDeleteDiaryEntryMutation
} from '../__data__/api'

export const useDiary = () => {
  const { data: entries = [], isLoading, refetch } = useGetDiaryEntriesQuery({})
  const [createEntryMutation] = useCreateDiaryEntryMutation()
  const [updateEntryMutation] = useUpdateDiaryEntryMutation()
  const [deleteEntryMutation] = useDeleteDiaryEntryMutation()

  const createEntry = useCallback(async (data: any) => {
    return await createEntryMutation(data)
  }, [])

  const updateEntry = useCallback(async (id: number, data: any) => {
    return await updateEntryMutation({ id, data })
  }, [])

  const deleteEntry = useCallback(async (id: number) => {
    return await deleteEntryMutation(id)
  }, [])

  return {
    entries,
    isLoading,
    createEntry,
    updateEntry,
    deleteEntry,
    refetch,
  }
}
