import React from 'react'
import {
  Box,
  Container,
  Heading,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  useMediaQuery,
  useColorModeValue,
} from '@chakra-ui/react'
import { AccountSettings } from '../components/settings/AccountSettings'
import { NotificationSettings } from '../components/settings/NotificationSettings'
import { SubscriptionSettings } from '../components/settings/SubscriptionSettings'
import { AdvancedSettings } from '../components/settings/AdvancedSettings'

const SettingsPage = () => {
  const [isMobile] = useMediaQuery('(max-width: 768px)')
  const bgColor = useColorModeValue('gray.50', 'gray.900')

  return (
    <Box minH="100vh" bg={bgColor} py={6} data-testid="settings-page">
      <Container maxW="container.xl">
        <Heading mb={6} size="xl" data-testid="settings-page-title">
          Settings
        </Heading>

        {isMobile ? (
          // Mobile Layout: Horizontal tabs at top
          <Tabs
            variant="soft-rounded"
            colorScheme="purple"
            data-testid="settings-mobile-tabs"
          >
            <TabList mb={4} overflowX="auto" overflowY="hidden">
              <Tab data-testid="tab-account" minW="fit-content">Account</Tab>
              <Tab data-testid="tab-notifications" minW="fit-content">Notifications</Tab>
              <Tab data-testid="tab-subscription" minW="fit-content">Subscription</Tab>
              <Tab data-testid="tab-advanced" minW="fit-content">Advanced</Tab>
            </TabList>

            <TabPanels>
              <TabPanel px={0}>
                <AccountSettings />
              </TabPanel>
              <TabPanel px={0}>
                <NotificationSettings />
              </TabPanel>
              <TabPanel px={0}>
                <SubscriptionSettings />
              </TabPanel>
              <TabPanel px={0}>
                <AdvancedSettings />
              </TabPanel>
            </TabPanels>
          </Tabs>
        ) : (
          // Desktop Layout: Vertical tabs on left side
          <Tabs
            orientation="vertical"
            variant="soft-rounded"
            colorScheme="purple"
            data-testid="settings-desktop-tabs"
          >
            <TabList width="200px" mr={6}>
              <Tab data-testid="tab-account" justifyContent="flex-start">
                Account
              </Tab>
              <Tab data-testid="tab-notifications" justifyContent="flex-start">
                Notifications
              </Tab>
              <Tab data-testid="tab-subscription" justifyContent="flex-start">
                Subscription
              </Tab>
              <Tab data-testid="tab-advanced" justifyContent="flex-start">
                Advanced
              </Tab>
            </TabList>

            <TabPanels flex={1}>
              <TabPanel>
                <AccountSettings />
              </TabPanel>
              <TabPanel>
                <NotificationSettings />
              </TabPanel>
              <TabPanel>
                <SubscriptionSettings />
              </TabPanel>
              <TabPanel>
                <AdvancedSettings />
              </TabPanel>
            </TabPanels>
          </Tabs>
        )}
      </Container>
    </Box>
  )
}

export default SettingsPage
