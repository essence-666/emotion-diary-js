import React, { useState } from 'react'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Alert,
  AlertIcon,
  Link,
  VStack,
} from '@chakra-ui/react'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import { Link as RouterLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

interface LoginFormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

export const LoginForm: React.FC = () => {
  const { login, isLoading, error } = useAuth()
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [submitError, setSubmitError] = useState<string>('')

  const validateForm = (): boolean => {
    const errors: FormErrors = {}

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))

    // Clear error for this field
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')

    if (!validateForm()) {
      return
    }

    const result = await login(formData.email, formData.password)

    if (result.error) {
      const errorMessage =
        (result.error as any)?.data?.message ||
        'Invalid credentials. Please try again.'
      setSubmitError(errorMessage)
    } else {
      // Clear form on success
      setFormData({ email: '', password: '' })
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <Box as="form" onSubmit={handleSubmit} width="100%" maxW="400px" noValidate>
      <VStack spacing={4} align="stretch">
        {/* Display error from API or general errors */}
        {submitError && (
          <Alert status="error" borderRadius="md" data-qa-type="login-error-alert">
            <AlertIcon />
            {submitError}
          </Alert>
        )}

        {/* Email Input */}
        <FormControl isInvalid={!!formErrors.email} isRequired>
          <FormLabel htmlFor="email">Email</FormLabel>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            data-qa-type="login-email-input"
          />
          <FormErrorMessage data-qa-type="login-email-error">{formErrors.email}</FormErrorMessage>
        </FormControl>

        {/* Password Input */}
        <FormControl isInvalid={!!formErrors.password} isRequired>
          <FormLabel htmlFor="password">Password</FormLabel>
          <InputGroup>
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              data-qa-type="login-password-input"
            />
            <InputRightElement>
              <IconButton
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                onClick={togglePasswordVisibility}
                variant="ghost"
                size="sm"
                data-qa-type="login-password-toggle"
              />
            </InputRightElement>
          </InputGroup>
          <FormErrorMessage data-qa-type="login-password-error">{formErrors.password}</FormErrorMessage>
        </FormControl>

        {/* Submit Button */}
        <Button
          type="submit"
          colorScheme="purple"
          size="lg"
          width="100%"
          isLoading={isLoading}
          loadingText="Logging in..."
          isDisabled={isLoading}
          data-qa-type="login-submit-button"
        >
          Log In
        </Button>

        {/* Sign Up Link */}
        <Box textAlign="center" fontSize="sm" color="gray.600">
          Don't have an account?{' '}
          <Link
            as={RouterLink}
            to="/register"
            color="purple.500"
            fontWeight="semibold"
            _hover={{ textDecoration: 'underline' }}
            data-qa-type="login-signup-link"
          >
            Sign up
          </Link>
        </Box>
      </VStack>
    </Box>
  )
}
