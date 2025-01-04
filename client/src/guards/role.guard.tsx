import { Navigate, Outlet } from 'react-router-dom'
import { getLocalStorageRole } from '../utils'
import { PrivateRoutes, Roles } from '../constants'

interface Props {
  role: Roles
}

export const RoleGuard = ({ role }: Props) => {
  const currentRole = getLocalStorageRole()
  return currentRole === role ? (
    <Outlet />
  ) : (
    <Navigate replace to={PrivateRoutes.DASHBOARD} />
  )
}
