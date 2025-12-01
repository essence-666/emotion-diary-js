import React from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import { Provider } from 'react-redux'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { store } from './__data__/store'
import { AppLayout } from './components/layout/AppLayout'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { Dashboard } from './pages/Dashboard'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ThemeProvider } from './components/theme/ThemeProvider'
import theme from './theme'

// Mock auth utilities available in development console (window.mockAuth)
// Use window.mockAuth.enable() to enable mock authentication
import './utils/mockAuth'
import DiaryPage from './pages/DiaryPage'
import CheckInPage from './pages/CheckInPage'
import SettingsPage from './pages/SettingsPage'
import PetPage from './pages/PetPage'
import AnalyticsPage from './pages/AnalyticsPage'

const App = () => {
  return (
    <Provider store={store}>
      <ChakraProvider theme={theme}>
        <ThemeProvider>
          <BrowserRouter basename="/emotion-diary">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Navigate to="/pet" replace />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pet"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <PetPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checkin"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <CheckInPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/diary"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <DiaryPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Dashboard />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute requirePremium>
                    <AppLayout>
                      <AnalyticsPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <SettingsPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/pet" replace />} />
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </ChakraProvider>
    </Provider>
  )
}

export default App
