import { Roles } from "../constants"

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  status?: boolean
  role?: Roles,
  settings:{
    autoAssign: boolean,
    notificationsSound: boolean,
  }
}
export interface UserDTO {
  name: string
  email: string
  password: string
  role: Roles
  phone: string
  city: string
  status?: boolean
  department: string
  position: string
  genre: string
  address: string
}