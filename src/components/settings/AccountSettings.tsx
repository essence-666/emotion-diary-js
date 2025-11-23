import React, { useState } from 'react'
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Input,
  FormControl,
  FormLabel,
  useColorModeValue,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Alert,
  AlertIcon,
  Divider,
} from '@chakra-ui/react'
import { useAuth } from '../../hooks/useAuth'
import {
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useDeleteAccountMutation,
} from '../../__data__/api'

export const AccountSettings = () => {
  const { user, logout } = useAuth()
  const toast = useToast()
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  // Username edit state
  const [isEditingUsername, setIsEditingUsername] = useState(false)
  const [newUsername, setNewUsername] = useState(user?.username || '')

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Delete account state
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [deletePassword, setDeletePassword] = useState('')

  // API mutations
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation()
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation()
  const [deleteAccount, { isLoading: isDeletingAccount }] = useDeleteAccountMutation()

  const handleUsernameEdit = async () => {
    if (newUsername.length < 3) {
      toast({
        title: 'Username too short',
        description: 'Username must be at least 3 characters',
        status: 'error',
        duration: 3000,
      })
      return
    }

    try {
      await updateProfile({ username: newUsername }).unwrap()
      toast({
        title: 'Username updated',
        status: 'success',
        duration: 3000,
      })
      setIsEditingUsername(false)
    } catch (error) {
      toast({
        title: 'Failed to update username',
        description: (error as any)?.data?.message || 'Please try again',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        status: 'error',
        duration: 3000,
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 6 characters',
        status: 'error',
        duration: 3000,
      })
      return
    }

    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      }).unwrap()
      toast({
        title: 'Password changed successfully',
        status: 'success',
        duration: 3000,
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      toast({
        title: 'Failed to change password',
        description: (error as any)?.data?.message || 'Please try again',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount({ password: deletePassword }).unwrap()
      toast({
        title: 'Account deleted',
        description: 'Your account has been permanently deleted',
        status: 'success',
        duration: 3000,
      })
      onClose()
      logout()
    } catch (error) {
      toast({
        title: 'Failed to delete account',
        description: (error as any)?.data?.message || 'Please try again',
        status: 'error',
        duration: 3000,
      })
    }
  }

  return (
    <VStack spacing={6} align="stretch" data-testid="account-info">
      {/* User Info Section */}
      <Box
        bg={cardBg}
        borderRadius="lg"
        p={6}
        borderWidth="1px"
        borderColor={borderColor}
      >
        <Heading size="md" mb={4}>
          Account Information
        </Heading>
        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Text>{user?.email}</Text>
          </FormControl>

          <FormControl>
            <FormLabel>Username</FormLabel>
            {isEditingUsername ? (
              <HStack data-testid="username-edit-form">
                <Input
                  data-testid="username-input"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
                <Button onClick={handleUsernameEdit} isLoading={isUpdatingProfile}>
                  Save
                </Button>
                <Button variant="ghost" onClick={() => setIsEditingUsername(false)}>
                  Cancel
                </Button>
              </HStack>
            ) : (
              <HStack>
                <Text>{user?.username}</Text>
                <Button
                  data-testid="edit-username-button"
                  size="sm"
                  onClick={() => {
                    setIsEditingUsername(true)
                    setNewUsername(user?.username || '')
                  }}
                >
                  Edit
                </Button>
              </HStack>
            )}
          </FormControl>
        </VStack>
      </Box>

      {/* Password Change Section */}
      <Box
        data-testid="password-change-section"
        bg={cardBg}
        borderRadius="lg"
        p={6}
        borderWidth="1px"
        borderColor={borderColor}
      >
        <Heading size="md" mb={4}>
          Change Password
        </Heading>
        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel>Current Password</FormLabel>
            <Input
              data-testid="current-password-input"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>New Password</FormLabel>
            <Input
              data-testid="new-password-input"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Confirm New Password</FormLabel>
            <Input
              data-testid="confirm-password-input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </FormControl>
          <Button
            colorScheme="purple"
            onClick={handlePasswordChange}
            isLoading={isChangingPassword}
          >
            Change Password
          </Button>
        </VStack>
      </Box>

      {/* Logout Section */}
      <Box
        bg={cardBg}
        borderRadius="lg"
        p={6}
        borderWidth="1px"
        borderColor={borderColor}
      >
        <Button
          data-testid="logout-button"
          colorScheme="gray"
          width="full"
          onClick={logout}
        >
          Logout
        </Button>
      </Box>

      {/* Danger Zone */}
      <Box
        data-testid="danger-zone"
        bg={useColorModeValue('red.50', 'red.900')}
        borderRadius="lg"
        p={6}
        borderWidth="1px"
        borderColor={useColorModeValue('red.200', 'red.600')}
      >
        <Heading size="md" mb={2} color={useColorModeValue('red.600', 'red.200')}>
          Danger Zone
        </Heading>
        <Text mb={4} fontSize="sm">
          Once you delete your account, there is no going back. Please be certain.
        </Text>
        <Button
          data-testid="delete-account-button"
          colorScheme="red"
          onClick={onOpen}
        >
          Delete Account
        </Button>
      </Box>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent data-testid="delete-confirmation-modal">
          <ModalHeader>Delete Account</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Alert status="warning">
                <AlertIcon />
                This action cannot be undone. All your data will be permanently deleted.
              </Alert>
              <FormControl>
                <FormLabel>Enter your password to confirm</FormLabel>
                <Input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Your password"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={handleDeleteAccount}
              isLoading={isDeletingAccount}
            >
              Delete My Account
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  )
}
