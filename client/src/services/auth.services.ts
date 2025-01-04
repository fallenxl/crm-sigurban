import { Endpoints, LocalStorageKeys } from '../constants'
import {  AuthCredentials, AuthResponse } from '../interfaces'
import axios from 'axios'
import { getLocalStorage, getLocalStorageToken, setLocalStorage } from '../utils'
import { useSelector } from 'react-redux'

// Envia una solicitud para iniciar sesión
export const login = async ({
  email,
  password
}: AuthCredentials): Promise<AuthResponse | undefined> => {
  try {
    const response = await axios.post(Endpoints.LOGIN, {
      email,
      password
    })
    const { data, status } = response
    if (status === 201) {
      return formatAuthResponse(data)
    }
    return undefined
  } catch (error) {
    return undefined
  }
}

// Envia una solicitud para actualizar el token de acceso
export const refreshToken = async (): Promise<AuthResponse | undefined> => {
  try {
    const response = await axios.get(Endpoints.REFRESH_TOKEN, {
      headers: {
        Authorization: `Bearer ${getLocalStorageToken()}`
      }
    })


    const { data, status } = response
    if (status === 201) {
      return formatAuthResponse(data)
    }
    return undefined
  } catch (error) {
    console.log(error)
  }
}

// Valida si el usuario tiene un token de acceso y si es así, lo envía al servidor para que lo valide
export const validateUser = async (): Promise<AuthResponse | undefined> => {
  try {

    const response = await axios.get(Endpoints.REFRESH_TOKEN)

    if (!response) return undefined
    const { status, data } = response

    if (status !== 200) return undefined

    return formatAuthResponse(data)
  } catch (error) {
    console.log(error)
  }
}


export const logout = () => {
  try {
    const userData = getLocalStorage<AuthResponse | undefined>(LocalStorageKeys.DATA)
    const socket = useSelector((state: any) => state.socket.socket)
    if (userData) {
      const { user } = userData
      setLocalStorage(LocalStorageKeys.USER_ACCOUNT, {email:user.email , name:user.name})
      socket.disconnect()
    }

  } catch (error) {
    console.log(error)
  }
}
// Formatea la respuesta del servidor para que coincida con la interfaz AuthResponse
const formatAuthResponse = (data: any): AuthResponse => {
  return {
    access_token: data.accessToken,
    user: {
      id: data.user._id,
      email: data.user.email,
      name: data.user.name,
      role: data.user.role,
      avatar: data.user.avatar,
      settings: {
        notificationsSound: data.user.settings.notificationsSound??true,
        autoAssign: data.user.settings.autoAssign
      },
    }

  }
}
