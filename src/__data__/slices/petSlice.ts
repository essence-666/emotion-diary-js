import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PetState, Pet, PetAnimationState } from '../../types'
import type { RootState } from '../store'

const initialState: PetState = {
  pet: null,
  happinessLevel: 50,
  dialogue: '',
  dialogueVisible: false,
  loading: false,
  error: null,
}

const petSlice = createSlice({
  name: 'pet',
  initialState,
  reducers: {
    setPet: (state, action: PayloadAction<Pet>) => {
      state.pet = action.payload
      state.happinessLevel = action.payload.happiness_level
      state.error = null
    },
    updateHappiness: (state, action: PayloadAction<number>) => {
      state.happinessLevel = Math.max(0, Math.min(100, action.payload))
      if (state.pet) {
        state.pet.happiness_level = state.happinessLevel
      }
    },
    increaseHappiness: (state, action: PayloadAction<number>) => {
      const newLevel = Math.min(100, state.happinessLevel + action.payload)
      state.happinessLevel = newLevel
      if (state.pet) {
        state.pet.happiness_level = newLevel
      }
    },
    decreaseHappiness: (state, action: PayloadAction<number>) => {
      const newLevel = Math.max(0, state.happinessLevel - action.payload)
      state.happinessLevel = newLevel
      if (state.pet) {
        state.pet.happiness_level = newLevel
      }
    },
    setDialogue: (state, action: PayloadAction<string>) => {
      state.dialogue = action.payload
      state.dialogueVisible = true
    },
    hideDialogue: (state) => {
      state.dialogueVisible = false
    },
    updatePetName: (state, action: PayloadAction<string>) => {
      if (state.pet) {
        state.pet.name = action.payload
      }
    },
    updatePetSkin: (state, action: PayloadAction<string>) => {
      if (state.pet) {
        state.pet.cosmetic_skin = action.payload
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.loading = false
    },
    clearPet: (state) => {
      state.pet = null
      state.happinessLevel = 50
      state.dialogue = ''
      state.dialogueVisible = false
      state.error = null
    },
  },
})

export const {
  setPet,
  updateHappiness,
  increaseHappiness,
  decreaseHappiness,
  setDialogue,
  hideDialogue,
  updatePetName,
  updatePetSkin,
  setLoading,
  setError,
  clearPet,
} = petSlice.actions

// Selectors
export const selectPet = (state: RootState) => state.pet.pet
export const selectHappinessLevel = (state: RootState) => state.pet.happinessLevel
export const selectDialogue = (state: RootState) => state.pet.dialogue
export const selectDialogueVisible = (state: RootState) => state.pet.dialogueVisible
export const selectPetLoading = (state: RootState) => state.pet.loading
export const selectPetError = (state: RootState) => state.pet.error

// Computed selectors
export const selectPetAnimationState = (state: RootState): PetAnimationState => {
  const happiness = state.pet.happinessLevel
  if (happiness <= 30) return 'sad'
  if (happiness <= 60) return 'neutral'
  return 'happy'
}

export const selectPetNeedsAttention = (state: RootState) => state.pet.happinessLevel < 30

export default petSlice.reducer
