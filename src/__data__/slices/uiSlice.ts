import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { UIState, Notification, Modal } from '../../types'
import type { RootState } from '../store'

const initialState: UIState = {
  notifications: [],
  modals: {},
  globalLoading: false,
}

let notificationIdCounter = 0

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    addNotification: (
      state,
      action: PayloadAction<Omit<Notification, 'id'> & { id?: string }>
    ) => {
      const notification: Notification = {
        id: action.payload.id || `notification-${notificationIdCounter++}`,
        message: action.payload.message,
        type: action.payload.type,
        duration: action.payload.duration ?? 3000,
        dismissible: action.payload.dismissible ?? true,
      }
      state.notifications.push(notification)
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload)
    },
    clearNotifications: (state) => {
      state.notifications = []
    },
    openModal: (state, action: PayloadAction<{ id: string; props?: Record<string, any> }>) => {
      state.modals[action.payload.id] = {
        id: action.payload.id,
        isOpen: true,
        props: action.payload.props,
      }
    },
    closeModal: (state, action: PayloadAction<string>) => {
      if (state.modals[action.payload]) {
        state.modals[action.payload].isOpen = false
      }
    },
    updateModalProps: (state, action: PayloadAction<{ id: string; props: Record<string, any> }>) => {
      if (state.modals[action.payload.id]) {
        state.modals[action.payload.id].props = {
          ...state.modals[action.payload.id].props,
          ...action.payload.props,
        }
      }
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload
    },
  },
})

export const {
  addNotification,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
  updateModalProps,
  setGlobalLoading,
} = uiSlice.actions

// Selectors
export const selectNotifications = (state: RootState) => state.ui.notifications
export const selectModals = (state: RootState) => state.ui.modals
export const selectGlobalLoading = (state: RootState) => state.ui.globalLoading

// Computed selectors
export const selectModalById = (state: RootState, modalId: string) =>
  state.ui.modals[modalId]
export const selectIsModalOpen = (state: RootState, modalId: string) =>
  state.ui.modals[modalId]?.isOpen || false

export default uiSlice.reducer
