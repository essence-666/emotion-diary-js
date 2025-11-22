import React, { PropsWithChildren } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore, PreloadedState, EnhancedStore } from '@reduxjs/toolkit'
import { ChakraProvider } from '@chakra-ui/react'
import { MemoryRouter } from 'react-router-dom'

import type { RootState } from '../../__data__/store'
import authReducer from '../../__data__/slices/authSlice'
import checkinReducer from '../../__data__/slices/checkinSlice'
import diaryReducer from '../../__data__/slices/diarySlice'
import petReducer from '../../__data__/slices/petSlice'
import uiReducer from '../../__data__/slices/uiSlice'
import { api } from '../../__data__/api'

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: PreloadedState<RootState>;
  store?: EnhancedStore;
  initialEntries?: string[];
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = configureStore({
      reducer: {
        [api.reducerPath]: api.reducer,
        auth: authReducer,
        checkin: checkinReducer,
        diary: diaryReducer,
        pet: petReducer,
        ui: uiReducer,
      },
      preloadedState,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(api.middleware),
    }),
    initialEntries = ['/'],
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({ children }: PropsWithChildren<{}>): JSX.Element {
    return (
      <Provider store={store}>
        <ChakraProvider>
          <MemoryRouter initialEntries={initialEntries}>
            {children}
          </MemoryRouter>
        </ChakraProvider>
      </Provider>
    )
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) }
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { renderWithProviders as render }
