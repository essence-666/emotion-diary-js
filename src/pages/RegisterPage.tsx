import React, { useState } from 'react'
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  Link,
  InputGroup,
  InputRightElement,
  IconButton,
  Alert,
  AlertIcon,
  useColorModeValue,
} from '@chakra-ui/react'
import { Link as RouterLink, Navigate } from 'react-router-dom'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import { useAuth } from '../hooks/useAuth'

export const RegisterPage: React.FC = () => {
  const { isAuthenticated, isLoading, register } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Color mode values
  const bgGradient = useColorModeValue(
    'linear(to-br, purple.50, pink.50)',
    'linear(to-br, gray.900, purple.900)'
  )
  const cardBg = useColorModeValue('white', 'gray.800')
  const textSecondary = useColorModeValue('gray.600', 'gray.400')

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/pet" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!formData.username || !formData.email || !formData.password) {
      setError('All fields are required')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      })

      if ('error' in result) {
        setError('Registration failed. Please try again.')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <Box
      minH="100vh"
      bgGradient={bgGradient}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
      data-testid="register-page-container"
    >
      <Container maxW="md">
        <VStack spacing={8}>
          {/* Logo/Title */}
          <Heading
            as="h1"
            size="2xl"
            textAlign="center"
            bgGradient="linear(to-r, purple.600, pink.600)"
            bgClip="text"
          >
            Emotion Diary
          </Heading>

          {/* Register Card */}
          <Box
            bg={cardBg}
            p={8}
            borderRadius="xl"
            boxShadow="2xl"
            w="full"
          >
            <VStack spacing={6} as="form" onSubmit={handleSubmit}>
              <Heading as="h2" size="lg" textAlign="center">
                Sign Up
              </Heading>

              <Text color={textSecondary} textAlign="center">
                Start your emotional wellness journey today
              </Text>

              {error && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  {error}
                </Alert>
              )}

              {/* Username Field */}
              <FormControl isRequired>
                <FormLabel>Username</FormLabel>
                <Input
                  name="username"
                  type="text"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="username"
                />
              </FormControl>

              {/* Email Field */}
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </FormControl>

              {/* Password Field */}
              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password (min 6 chars)"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={() => setShowPassword(!showPassword)}
                      variant="ghost"
                      size="sm"
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              {/* Confirm Password Field */}
              <FormControl isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <InputGroup>
                  <Input
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      variant="ghost"
                      size="sm"
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              {/* Submit Button */}
              <Button
                type="submit"
                colorScheme="purple"
                size="lg"
                w="full"
                isLoading={isSubmitting || isLoading}
                loadingText="Creating account..."
              >
                Sign Up
              </Button>

              {/* Login Link */}
              <Text color={textSecondary}>
                Already have an account?{' '}
                <Link
                  as={RouterLink}
                  to="/login"
                  color="purple.500"
                  fontWeight="semibold"
                >
                  Sign In
                </Link>
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  )
}
