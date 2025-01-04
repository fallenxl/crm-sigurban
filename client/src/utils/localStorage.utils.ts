import { LocalStorageKeys} from '../constants'
import { AuthResponse } from '../interfaces'

export const getLocalStorage = <T>(key: string)=> {
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) as T : undefined
}

export const setLocalStorage = <T>(key: string, data: T) => {
  localStorage.setItem(key, JSON.stringify(data))
}

export const removeLocalStorage = (key: string) => {
  localStorage.removeItem(key)
}

export const clearLocalStorage = () => {
  localStorage.clear()
}

export const getLocalStorageToken = (): string | undefined => {
  const response = getLocalStorage<AuthResponse>(LocalStorageKeys.DATA)
  return response?.access_token
}

export const getLocalStorageRole = (): string | undefined => {
  const response = getLocalStorage<AuthResponse>(LocalStorageKeys.DATA)
  return response?.user.role
}