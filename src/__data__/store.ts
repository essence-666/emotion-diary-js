import { configureStore } from '@reduxjs/toolkit'
import { type TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'

import { api } from './api'
import authReducer from './slices/authSlice'
import checkinReducer from './slices/checkinSlice'
import diaryReducer from './slices/diarySlice'
import petReducer from './slices/petSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
    checkin: checkinReducer,
    diary: diaryReducer,
    pet: petReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = () => useDispatch<AppDispatch>()

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
