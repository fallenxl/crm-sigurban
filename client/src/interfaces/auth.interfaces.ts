import { User } from '.'

export interface AuthCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  user: User
}

export interface AuthAccount{
  email: string
  name: string,
  avatar: string,
}

export interface StatusChange {
  statusChange: boolean
}

export interface SocketChange {
  socket: any
}