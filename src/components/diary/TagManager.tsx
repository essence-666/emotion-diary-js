import React, { useState } from 'react'
import {
  Box,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Checkbox,
  VStack,
  HStack,
  Input,
  Text,
  Badge,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react'
import { ChevronDownIcon, AddIcon } from '@chakra-ui/icons'
import type { DiaryTag } from '../../types'

interface TagManagerProps {
  popularTags: DiaryTag[]
  onApply: (selectedTagIds: number[]) => void
  selectedTagIds?: number[]
}

export const TagManager: React.FC<TagManagerProps> = ({
  popularTags,
  onApply,
  selectedTagIds: initialSelectedTagIds = [],
}) => {
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>(initialSelectedTagIds)
  const [customTagName, setCustomTagName] = useState('')
  const [customTags, setCustomTags] = useState<DiaryTag[]>([])

  // Color mode values
  const menuBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const textSecondary = useColorModeValue('gray.600', 'gray.400')

  const handleTagToggle = (tagId: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    )
  }

  const handleAddCustomTag = () => {
    if (customTagName.trim()) {
      const newTag: DiaryTag = {
        id: Date.now(), // Temporary ID for custom tags
        name: customTagName.trim(),
        color: '#a78bfa', // Default purple color
      }
      setCustomTags((prev) => [...prev, newTag])
      setSelectedTagIds((prev) => [...prev, newTag.id])
      setCustomTagName('')
    }
  }

  const handleApply = () => {
    onApply(selectedTagIds)
  }

  const handleClear = () => {
    setSelectedTagIds([])
    setCustomTags([])
    onApply([])
  }

  const allTags = [...popularTags, ...customTags]
  const selectedCount = selectedTagIds.length

  return (
    <Menu closeOnSelect={false}>
      <MenuButton
        as={Button}
        rightIcon={<ChevronDownIcon />}
        variant="outline"
        size="md"
        data-testid="tag-manager-button"
      >
        {selectedCount > 0 ? `Filter (${selectedCount})` : 'Filter by Tags'}
      </MenuButton>
      <MenuList
        bg={menuBg}
        borderColor={borderColor}
        minW="300px"
        maxH="400px"
        overflowY="auto"
        data-testid="tag-manager-menu"
      >
        <Box p={3}>
          <Text fontSize="sm" fontWeight="semibold" mb={3} color={textSecondary}>
            Popular Tags
          </Text>
          <VStack align="stretch" spacing={2}>
            {popularTags.map((tag) => (
              <MenuItem key={tag.id} closeOnSelect={false} p={0}>
                <HStack w="full" spacing={2} p={2}>
                  <Checkbox
                    isChecked={selectedTagIds.includes(tag.id)}
                    onChange={() => handleTagToggle(tag.id)}
                    aria-label={tag.name}
                  >
                    <HStack spacing={2}>
                      <Badge
                        size="sm"
                        style={{ backgroundColor: tag.color + '20', color: tag.color }}
                        px={2}
                        py={0.5}
                      >
                        {tag.name}
                      </Badge>
                    </HStack>
                  </Checkbox>
                </HStack>
              </MenuItem>
            ))}
          </VStack>

          {customTags.length > 0 && (
            <>
              <Divider my={3} />
              <Text fontSize="sm" fontWeight="semibold" mb={3} color={textSecondary}>
                Custom Tags
              </Text>
              <VStack align="stretch" spacing={2}>
                {customTags.map((tag) => (
                  <MenuItem key={tag.id} closeOnSelect={false} p={0}>
                    <HStack w="full" spacing={2} p={2}>
                      <Checkbox
                        isChecked={selectedTagIds.includes(tag.id)}
                        onChange={() => handleTagToggle(tag.id)}
                        aria-label={tag.name}
                      >
                        <HStack spacing={2}>
                          <Badge
                            size="sm"
                            style={{ backgroundColor: tag.color + '20', color: tag.color }}
                            px={2}
                            py={0.5}
                          >
                            {tag.name}
                          </Badge>
                        </HStack>
                      </Checkbox>
                    </HStack>
                  </MenuItem>
                ))}
              </VStack>
            </>
          )}

          <Divider my={3} />

          <VStack align="stretch" spacing={2}>
            <Text fontSize="sm" fontWeight="semibold" color={textSecondary}>
              Add Custom Tag
            </Text>
            <HStack>
              <Input
                placeholder="Enter tag name"
                value={customTagName}
                onChange={(e) => setCustomTagName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddCustomTag()
                  }
                }}
                size="sm"
                data-testid="custom-tag-input"
              />
              <Button
                size="sm"
                leftIcon={<AddIcon />}
                onClick={handleAddCustomTag}
                isDisabled={!customTagName.trim()}
              >
                Add
              </Button>
            </HStack>
          </VStack>

          <Divider my={3} />

          <HStack spacing={2} justify="flex-end">
            <Button size="sm" variant="ghost" onClick={handleClear}>
              Clear
            </Button>
            <Button size="sm" colorScheme="purple" onClick={handleApply}>
              Apply
            </Button>
          </HStack>
        </Box>
      </MenuList>
    </Menu>
  )
}

