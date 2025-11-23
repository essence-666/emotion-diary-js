import {
  Box,
  Container,
  Heading,
  Grid,
  GridItem,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  useMediaQuery,
  useColorModeValue,
} from '@chakra-ui/react'
import { MonthlyHeatmap } from '../components/diary/MonthlyHeatmap'
import { DiaryTimeline } from '../components/diary/DiaryTimeline'
import type { DiaryTag } from '../types'
import React from 'react'

const dummyTags: DiaryTag[] = []

const DiaryPage = () => {
  const [isMobile] = useMediaQuery('(max-width: 768px)')
  const [selectedDate, setSelectedDate] = React.useState<string | undefined>(undefined)
  const bgColor = useColorModeValue('gray.50', 'gray.900')

  const handleDateClick = (date: string) => {
    // Toggle date selection (click again to deselect)
    setSelectedDate(selectedDate === date ? undefined : date)
  }

  const handleClearFilter = () => {
    setSelectedDate(undefined)
  }

  return (
    <Box minH="100vh" bg={bgColor} py={6} data-testid="diary-page">
      <Container maxW="container.xl">
        <Heading mb={6} size="xl" data-testid="diary-page-title">
          My Diary
        </Heading>

        {isMobile ? (
          <Tabs variant="soft-rounded" colorScheme="purple" data-testid="diary-mobile-tabs">
            <TabList mb={4}>
              <Tab data-testid="tab-timeline">Timeline</Tab>
              <Tab data-testid="tab-heatmap">Heatmap</Tab>
            </TabList>

            <TabPanels>
              <TabPanel px={0} data-testid="tab-panel-timeline">
                <DiaryTimeline
                  popularTags={dummyTags}
                  selectedDate={selectedDate}
                  onClearDateFilter={handleClearFilter}
                />
              </TabPanel>

              <TabPanel px={0} data-testid="tab-panel-heatmap">
                <MonthlyHeatmap onDateClick={handleDateClick} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        ) : (
          <Grid
            templateColumns="320px 1fr"
            gap={6}
            alignItems="start"
            data-testid="diary-desktop-layout"
          >
            <GridItem position="sticky" top="6" data-testid="diary-sidebar">
              <MonthlyHeatmap onDateClick={handleDateClick} />
            </GridItem>

            <GridItem minW="0" data-testid="diary-main-content">
              <DiaryTimeline
                popularTags={dummyTags}
                selectedDate={selectedDate}
                onClearDateFilter={handleClearFilter}
              />
            </GridItem>
          </Grid>
        )}
      </Container>
    </Box>
  )
}

export default DiaryPage
