import React from 'react'
import { Box, Container, Heading, VStack, useColorModeValue } from '@chakra-ui/react'
import { LoginForm } from '../components/auth/LoginForm'

export const LoginPage: React.FC = () => {
  const bgGradient = useColorModeValue(
    'linear(to-br, purple.50, pink.50, blue.50)',
    'linear(to-br, gray.900, purple.900, blue.900)'
  )

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgGradient={bgGradient}
      data-qa-type="login-page-container"
    >
      <Container maxW="md" py={12}>
        <VStack spacing={8} align="stretch">
          {/* App Branding */}
          <Heading
            as="h1"
            size="2xl"
            textAlign="center"
            bgGradient="linear(to-r, purple.600, pink.600)"
            bgClip="text"
            paddingBottom="10px"
            fontWeight="extrabold"
          >
            Emotion Diary
          </Heading>

          {/* Login Form Card */}
          <Box
            bg={useColorModeValue('white', 'gray.800')}
            boxShadow="2xl"
            borderRadius="2xl"
            p={8}
            data-qa-type="login-card"
          >
            <LoginForm />
          </Box>
        </VStack>
      </Container>
    </Box>
  )
}
