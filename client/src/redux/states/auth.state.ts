import { createSlice } from '@reduxjs/toolkit'
import { AuthResponse } from '../../interfaces'
import { clearLocalStorage, setLocalStorage } from '../../utils'
import { LocalStorageKeys } from '../../constants'

const AuthEmptyState: AuthResponse = {

  access_token: '',
  user: {
    id: '',
    name: '',
    email: '',
    avatar: '',
    settings: {
      autoAssign: false,
        notificationsSound: true,
    },
    status: false,
  },
}

const AuthSlice = createSlice({
  name: 'auth',
  initialState: AuthEmptyState,
  reducers: {
    setAuth: (_state, action) => {
      setLocalStorage(LocalStorageKeys.DATA, action.payload)
      return action.payload
    },
    updateAuth: (state, action) => {
      const result = { ...state, ...action.payload }
      setLocalStorage(LocalStorageKeys.DATA, result)
      return result
    },
    clearAuth: () => {
      clearLocalStorage()
      return AuthEmptyState
    },
  }
})

export const { setAuth, updateAuth, clearAuth } = AuthSlice.actions
export default AuthSlice.reducer

