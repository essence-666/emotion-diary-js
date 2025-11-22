import React, { useState, useEffect, useCallback } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Textarea,
  VStack,
  HStack,
  Text,
  useColorModeValue,
  Box,
} from '@chakra-ui/react'
import { useCreateDiaryEntryMutation, useUpdateDiaryEntryMutation } from '../../__data__/api'
import { TagManager } from './TagManager'
import type { DiaryEntry, DiaryTag } from '../../types'

interface EntryEditorProps {
  isOpen: boolean
  onClose: () => void
  onSave?: (entry: DiaryEntry) => void
  popularTags: DiaryTag[]
  entry?: DiaryEntry | null
}

const AUTO_SAVE_DELAY = 2000 // 2 seconds

export const EntryEditor: React.FC<EntryEditorProps> = ({
  isOpen,
  onClose,
  onSave,
  popularTags,
  entry,
}) => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({})
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null)

  const [createEntry, { isLoading: isCreating }] = useCreateDiaryEntryMutation()
  const [updateEntry, { isLoading: isUpdating }] = useUpdateDiaryEntryMutation()

  const isLoading = isCreating || isUpdating

  // Initialize form with entry data if editing
  useEffect(() => {
    if (entry) {
      setTitle(entry.title || '')
      setContent(entry.content || '')
      setSelectedTagIds(entry.tags?.map((tag) => tag.id) || [])
    } else {
      // Reset form for new entry
      setTitle('')
      setContent('')
      setSelectedTagIds([])
    }
    setErrors({})
    setSaveStatus('idle')
  }, [entry, isOpen])

  // Auto-save with debounce
  const handleAutoSave = useCallback(async () => {
    if (!content.trim()) return // Don't auto-save empty content

    setSaveStatus('saving')

    try {
      if (entry) {
        // Update existing entry
        const result = await updateEntry({
          id: entry.id,
          data: {
            title: title.trim() || undefined,
            content: content.trim(),
            tag_ids: selectedTagIds,
          },
        }).unwrap()

        if (result.ok) {
          setSaveStatus('saved')
          if (onSave) onSave(result.entry)
        } else {
          setSaveStatus('error')
        }
      } else {
        // Create new entry
        const result = await createEntry({
          title: title.trim() || undefined,
          content: content.trim(),
          tag_ids: selectedTagIds,
        }).unwrap()

        if (result.ok) {
          setSaveStatus('saved')
          if (onSave) onSave(result.entry)
        } else {
          setSaveStatus('error')
        }
      }
    } catch (error) {
      setSaveStatus('error')
    }
  }, [content, title, selectedTagIds, entry, createEntry, updateEntry, onSave])

  // Debounced auto-save
  useEffect(() => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
    }

    if (content.trim() && isOpen) {
      const timer = setTimeout(() => {
        handleAutoSave()
      }, AUTO_SAVE_DELAY)

      setAutoSaveTimer(timer)
    }

    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer)
      }
    }
  }, [content, title, selectedTagIds, isOpen])

  const validate = (): boolean => {
    const newErrors: { title?: string; content?: string } = {}

    if (!content.trim()) {
      newErrors.content = 'Content is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return

    setSaveStatus('saving')

    try {
      if (entry) {
        // Update existing entry
        const result = await updateEntry({
          id: entry.id,
          data: {
            title: title.trim() || undefined,
            content: content.trim(),
            tag_ids: selectedTagIds,
          },
        }).unwrap()

        if (result.ok) {
          setSaveStatus('saved')
          if (onSave) onSave(result.entry)
          setTimeout(() => {
            onClose()
          }, 500)
        } else {
          setSaveStatus('error')
        }
      } else {
        // Create new entry
        const result = await createEntry({
          title: title.trim() || undefined,
          content: content.trim(),
          tag_ids: selectedTagIds,
        }).unwrap()

        if (result.ok) {
          setSaveStatus('saved')
          if (onSave) onSave(result.entry)
          setTimeout(() => {
            onClose()
          }, 500)
        } else {
          setSaveStatus('error')
        }
      }
    } catch (error) {
      setSaveStatus('error')
    }
  }

  const handleCancel = () => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
    }
    setTitle('')
    setContent('')
    setSelectedTagIds([])
    setErrors({})
    setSaveStatus('idle')
    onClose()
  }

  const handleTagApply = (tagIds: number[]) => {
    setSelectedTagIds(tagIds)
  }

  const textSecondary = useColorModeValue('gray.600', 'gray.400')
  const saveStatusColor = useColorModeValue('gray.600', 'gray.400')

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Saving...'
      case 'saved':
        return 'Saved ✓'
      case 'error':
        return 'Error saving'
      default:
        return ''
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {entry ? 'Edit Entry' : 'New Entry'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl isInvalid={!!errors.title}>
              <FormLabel>Title (optional)</FormLabel>
              <Input
                placeholder="Enter entry title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                aria-label="Title"
              />
              {errors.title && <FormErrorMessage>{errors.title}</FormErrorMessage>}
            </FormControl>

            <FormControl isInvalid={!!errors.content} isRequired>
              <FormLabel>Content</FormLabel>
              <Textarea
                placeholder="Write your thoughts here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                minH="200px"
                resize="vertical"
                aria-label="Content"
              />
              {errors.content && <FormErrorMessage>{errors.content}</FormErrorMessage>}
            </FormControl>

            <Box>
              <FormLabel mb={2}>Tags</FormLabel>
              <TagManager
                popularTags={popularTags}
                onApply={handleTagApply}
                selectedTagIds={selectedTagIds}
              />
            </Box>

            {saveStatus !== 'idle' && (
              <Text fontSize="sm" color={saveStatusColor}>
                {getSaveStatusText()}
              </Text>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              colorScheme="purple"
              onClick={handleSave}
              isLoading={isLoading}
              isDisabled={!content.trim()}
            >
              Save
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

