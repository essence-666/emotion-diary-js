import { Box, Heading, Grid, GridItem, Tabs, TabList, Tab, TabPanels, TabPanel, useMediaQuery } from '@chakra-ui/react'
import { MonthlyHeatmap } from '../components/diary/MonthlyHeatmap'
import { DiaryTimeline } from '../components/diary/DiaryTimeline'
import type { DiaryTag } from '../types'
import React from 'react'

const dummyTags: DiaryTag[] = []

const DiaryPage = () => {
  const [isMobile] = useMediaQuery('(max-width: 768px)')

  return (
    <Box>
      <Heading mb={4}>My Diary</Heading>

      {isMobile ? (
        <Tabs>
          <TabList>
            <Tab>Timeline</Tab>
            <Tab>Heatmap</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <DiaryTimeline popularTags={dummyTags} />
            </TabPanel>

            <TabPanel>
              <MonthlyHeatmap />
            </TabPanel>
          </TabPanels>
        </Tabs>
      ) : (
        <Grid templateColumns="300px 1fr" gap={4}>
          <GridItem>
            <MonthlyHeatmap />
          </GridItem>

          <GridItem>
            <DiaryTimeline popularTags={dummyTags} />
          </GridItem>
        </Grid>
      )}
    </Box>
  )
}

export default DiaryPage
