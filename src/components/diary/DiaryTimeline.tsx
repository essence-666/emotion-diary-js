import React, { useState, useEffect, useRef } from 'react'
import {
  Box,
  VStack,
  Spinner,
  Text,
  Center,
  useColorModeValue,
} from '@chakra-ui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGetDiaryEntriesQuery } from '../../__data__/api'
import { DiaryEntry } from './DiaryEntry'
import { TagManager } from './TagManager'
import type { DiaryTag } from '../../types'

interface DiaryTimelineProps {
  popularTags: DiaryTag[]
  onEntryClick?: (entry: any) => void
}

const ITEMS_PER_PAGE = 10

export const DiaryTimeline: React.FC<DiaryTimelineProps> = ({
  popularTags,
  onEntryClick,
}) => {
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [offset, setOffset] = useState(0)
  const [allEntries, setAllEntries] = useState<any[]>([])
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const prevOffsetRef = useRef(0)
  const prevTagsRef = useRef<number[]>([])

  // Build tags query string
  const tagsQuery = selectedTagIds.length > 0 ? selectedTagIds.join(',') : undefined

  // Fetch entries with RTK Query
  const { data: entries, isLoading, error, refetch } = useGetDiaryEntriesQuery({
    limit: ITEMS_PER_PAGE,
    offset: offset,
    tags: tagsQuery,
  })

  // Update allEntries when new data arrives
  useEffect(() => {
    if (entries) {
      const tagsChanged = JSON.stringify(prevTagsRef.current) !== JSON.stringify(selectedTagIds)
      const offsetReset = prevOffsetRef.current > offset

      if (offset === 0 || tagsChanged || offsetReset) {
        // Reset entries on new filter or initial load
        setAllEntries(entries)
      } else {
        // Append new entries for pagination
        setAllEntries((prev) => {
          // Avoid duplicates
          const existingIds = new Set(prev.map((e) => e.id))
          const newEntries = entries.filter((e) => !existingIds.has(e.id))
          return [...prev, ...newEntries]
        })
      }
      prevOffsetRef.current = offset
      prevTagsRef.current = [...selectedTagIds]
    }
  }, [entries, offset, selectedTagIds])

  // Reset offset when filters change
  useEffect(() => {
    const tagsChanged = JSON.stringify(prevTagsRef.current) !== JSON.stringify(selectedTagIds)
    if (tagsChanged && selectedTagIds.length !== prevTagsRef.current.length) {
      setOffset(0)
      setAllEntries([])
    }
  }, [selectedTagIds])

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    if (!loadMoreRef.current || isLoading || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && entries && entries.length > 0) {
          // Load more entries
          setOffset((prev) => prev + ITEMS_PER_PAGE)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(loadMoreRef.current)

    return () => observer.disconnect()
  }, [isLoading, allEntries.length])

  const handleTagFilter = (tagIds: number[]) => {
    setSelectedTagIds(tagIds)
  }

  const handleEntryClick = (entry: any) => {
    if (onEntryClick) {
      onEntryClick(entry)
    }
  }

  // Color mode values
  const textSecondary = useColorModeValue('gray.600', 'gray.400')
  const emptyStateBg = useColorModeValue('gray.50', 'gray.800')

  // Stagger animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  }

  return (
    <Box data-testid="diary-timeline" w="full">
      <VStack spacing={6} align="stretch">
        {/* TagManager Filter */}
        <Box>
          <TagManager popularTags={popularTags} onApply={handleTagFilter} selectedTagIds={selectedTagIds} />
        </Box>

        {/* Loading State */}
        {isLoading && allEntries.length === 0 && (
          <Center py={12}>
            <VStack spacing={4}>
              <Spinner size="lg" colorScheme="purple" />
              <Text color={textSecondary}>Loading entries...</Text>
            </VStack>
          </Center>
        )}

        {/* Error State */}
        {error && (
          <Center py={12}>
            <Text color="red.500">Failed to load entries. Please try again.</Text>
          </Center>
        )}

        {/* Empty State */}
        {!isLoading && allEntries.length === 0 && !error && (
          <Center py={12} bg={emptyStateBg} borderRadius="md">
            <VStack spacing={2}>
              <Text fontSize="lg" fontWeight="semibold" color={textSecondary}>
                No entries yet
              </Text>
              <Text fontSize="sm" color={textSecondary} textAlign="center">
                Start by logging a mood or writing in your diary!
              </Text>
            </VStack>
          </Center>
        )}

        {/* Entries List */}
        {allEntries.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              <VStack spacing={4} align="stretch">
                {allEntries.map((entry) => (
                  <motion.div key={entry.id} variants={itemVariants}>
                    <DiaryEntry
                      entry={entry}
                      onClick={handleEntryClick}
                    />
                  </motion.div>
                ))}
              </VStack>
            </AnimatePresence>
          </motion.div>
        )}

        {/* Load More Trigger */}
        {allEntries.length > 0 && (
          <Box ref={loadMoreRef} h="20px" w="full">
            {isLoading && (
              <Center py={4}>
                <Spinner size="sm" colorScheme="purple" />
              </Center>
            )}
          </Box>
        )}
      </VStack>
    </Box>
  )
}

