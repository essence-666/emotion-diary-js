import React from 'react'
import {
  Box,
  VStack,
  Heading,
  Switch,
  FormControl,
  FormLabel,
  Select,
  Button,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react'
import { useGetPreferencesQuery, useUpdatePreferencesMutation } from '../../__data__/api'

export const NotificationSettings = () => {
  const toast = useToast()
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  const { data: preferencesData } = useGetPreferencesQuery()
  const [updatePreferences, { isLoading }] = useUpdatePreferencesMutation()

  const preferences = preferencesData?.preferences

  const handleNotificationToggle = async (enabled: boolean) => {
    try {
      await updatePreferences({ notifications_enabled: enabled }).unwrap()
      toast({
        title: 'Notification settings updated',
        status: 'success',
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: 'Failed to update settings',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const handleTimeChange = async (time: string) => {
    try {
      await updatePreferences({ notification_time: time }).unwrap()
      toast({
        title: 'Notification time updated',
        status: 'success',
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: 'Failed to update time',
        status: 'error',
        duration: 3000,
      })
    }
  }

  return (
    <Box
      bg={cardBg}
      borderRadius="lg"
      p={6}
      borderWidth="1px"
      borderColor={borderColor}
      data-testid="notification-settings"
    >
      <Heading size="md" mb={4}>
        Notification Settings
      </Heading>
      <VStack spacing={4} align="stretch">
        <FormControl display="flex" alignItems="center">
          <FormLabel mb={0}>Enable Notifications</FormLabel>
          <Switch
            isChecked={preferences?.notifications_enabled || false}
            onChange={(e) => handleNotificationToggle(e.target.checked)}
            isDisabled={isLoading}
          />
        </FormControl>

        {preferences?.notifications_enabled && (
          <FormControl>
            <FormLabel>Notification Time</FormLabel>
            <Select
              value={preferences?.notification_time || '09:00'}
              onChange={(e) => handleTimeChange(e.target.value)}
              isDisabled={isLoading}
            >
              <option value="07:00">7:00 AM</option>
              <option value="08:00">8:00 AM</option>
              <option value="09:00">9:00 AM</option>
              <option value="10:00">10:00 AM</option>
              <option value="18:00">6:00 PM</option>
              <option value="19:00">7:00 PM</option>
              <option value="20:00">8:00 PM</option>
              <option value="21:00">9:00 PM</option>
            </Select>
          </FormControl>
        )}
      </VStack>
    </Box>
  )
}
