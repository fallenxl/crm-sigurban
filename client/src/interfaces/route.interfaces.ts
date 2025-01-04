// Rutas de acuerdo al rol del usuario
export interface IIndexRoutes {
    ADMIN: RoleRoute[]
    ADVISOR: RoleRoute[],
    MANAGER: RoleRoute[],
    BANK_MANAGER: RoleRoute[],
    COMMUNITY_MANAGER: RoleRoute[],
    RECEPTIONIST: RoleRoute[],
    SUPERVISOR: RoleRoute[],
    MANAGEMENT: RoleRoute[],
  }
export interface RoleRoute {
    path?: string;
    label?: string;
    component?: any;
    submenu?: boolean
    gap?: boolean;
    icon?: JSX.Element ;
    sub?: RoleRoute[];
}