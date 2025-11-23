import React from 'react'
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  useColorModeValue,
  useToast,
  SimpleGrid,
} from '@chakra-ui/react'
import { useAuth } from '../../hooks/useAuth'
import { useExportDataQuery, useCustomizePetMutation } from '../../__data__/api'

export const AdvancedSettings = () => {
  const { user } = useAuth()
  const toast = useToast()
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const isPremium = user?.subscription_tier === 'premium'

  const { data: exportData, refetch: refetchExport, isFetching } = useExportDataQuery(undefined, {
    skip: true, // Don't auto-fetch
  })

  const [customizePet] = useCustomizePetMutation()

  const handleExport = async () => {
    try {
      const result = await refetchExport().unwrap()
      const dataStr = JSON.stringify(result.data, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `emotion-diary-export-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)

      toast({
        title: 'Data exported successfully',
        status: 'success',
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: 'Failed to export data',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const handlePetSkinChange = async (skin: string) => {
    try {
      await customizePet({ cosmetic_skin: skin }).unwrap()
      toast({
        title: 'Pet skin updated',
        status: 'success',
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: 'Failed to update pet skin',
        status: 'error',
        duration: 3000,
      })
    }
  }

  return (
    <VStack spacing={6} align="stretch" data-testid="advanced-settings">
      {/* Data Export */}
      <Box
        bg={cardBg}
        borderRadius="lg"
        p={6}
        borderWidth="1px"
        borderColor={borderColor}
      >
        <Heading size="md" mb={2}>
          Export Data
        </Heading>
        <Text fontSize="sm" mb={4} color={useColorModeValue('gray.600', 'gray.400')}>
          Download all your data in JSON format
        </Text>
        <Button onClick={handleExport} isLoading={isFetching} width="full">
          📥 Export My Data
        </Button>
      </Box>

      {/* Pet Customization (Premium) */}
      <Box
        bg={cardBg}
        borderRadius="lg"
        p={6}
        borderWidth="1px"
        borderColor={borderColor}
      >
        <Heading size="md" mb={2}>
          Pet Customization
        </Heading>
        <Text fontSize="sm" mb={4} color={useColorModeValue('gray.600', 'gray.400')}>
          {isPremium ? 'Choose a cosmetic skin for your pet' : 'Upgrade to Premium to unlock pet customization'}
        </Text>
        <SimpleGrid columns={3} spacing={4}>
          <Button
            onClick={() => handlePetSkinChange('default')}
            isDisabled={!isPremium}
            variant="outline"
          >
            Default
          </Button>
          <Button
            onClick={() => handlePetSkinChange('rainbow')}
            isDisabled={!isPremium}
            variant="outline"
            colorScheme="purple"
          >
            Rainbow
          </Button>
          <Button
            onClick={() => handlePetSkinChange('golden')}
            isDisabled={!isPremium}
            variant="outline"
            colorScheme="yellow"
          >
            Golden
          </Button>
        </SimpleGrid>
      </Box>
    </VStack>
  )
}
