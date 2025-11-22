import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { store } from './__data__/store';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Dashboard } from './pages/Dashboard';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { Box, Heading } from '@chakra-ui/react';
import { ThemeProvider } from './components/theme/ThemeProvider';
import theme from './theme';

// Initialize mock auth in development
import './utils/mockAuth';

// Placeholder pages
const CheckinPage = () => (
  <Box>
    <Heading mb={4}>Mood Check-in</Heading>
    <p>Check-in component will go here...</p>
  </Box>
);

const DiaryPage = () => (
  <Box>
    <Heading mb={4}>Diary</Heading>
    <p>Diary component will go here...</p>
  </Box>
);

const PetPage = () => (
  <Box>
    <Heading mb={4}>My Pet</Heading>
    <p>Pet component will go here...</p>
  </Box>
);

const AnalyticsPage = () => (
  <Box>
    <Heading mb={4}>Analytics</Heading>
    <p>Analytics component will go here...</p>
  </Box>
);

const SettingsPage = () => (
  <Box>
    <Heading mb={4}>Settings</Heading>
    <p>Settings component will go here...</p>
  </Box>
);

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

              {/* Protected routes with layout - Pet is now the main page */}
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
                      <CheckinPage />
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
  );
};

export default App;
