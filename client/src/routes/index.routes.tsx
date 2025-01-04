import { Navigate, Route } from "react-router-dom";
import {
  adminRoutes,
  advisorRoutes,
  bankManagerRoutes,
  communityRoutes,
  managerRoutes,
  receptionistRoutes,
} from "./roles";
import { PrivateRoutes, Roles } from "../constants";
import { IIndexRoutes, RoleRoute } from "../interfaces";
import { getLocalStorageRole } from "../utils";
import React from "react";
import { RoleGuard } from "../guards/role.guard";
import { useSelector } from "react-redux";
import { AppStore } from "../redux/store";
import {Me} from "../pages/me/Me.tsx";
import {supervisorRoutes} from "./roles/supervisor.routes.tsx";
import {managementRoutes} from "./roles/managemente.routes.tsx";

// Rutas de acuerdo al rol del usuario
export const indexRoutes: IIndexRoutes = {
  ADMIN: [...adminRoutes],
  ADVISOR: [...advisorRoutes],
  MANAGER: [...managerRoutes],
  BANK_MANAGER: [...bankManagerRoutes],
  COMMUNITY_MANAGER: [...communityRoutes] as RoleRoute[],
  RECEPTIONIST: [...receptionistRoutes],
  SUPERVISOR: [...supervisorRoutes],
  MANAGEMENT: [...managementRoutes],
};

// Renderizar rutas de acuerdo al rol del usuario
export const renderRoutesByRole = () => {
  const user = useSelector((state: AppStore) => state.auth.user);
  const role = (getLocalStorageRole() as Roles) || user.role;

  return (
    <>
      {role && (
        <Route element={<RoleGuard role={role} />}>
          <Route path={'/me'} element={<Me/>}/>
          {indexRoutes[role as Roles].map((route) => (
            <React.Fragment key={route.path || route.label}>
              {route.path && (
                <Route path={route.path} element={route.component} />
              )}
              {route.sub && (
                <Route
                  path={route.path}
                  errorElement={<Navigate to={PrivateRoutes.DASHBOARD} />}
                >
                  {route.sub?.map((subRoute) => (
                    <React.Fragment key={subRoute.path || subRoute.label}>
                      {subRoute.path && (
                        <Route
                          path={subRoute.path}
                          element={subRoute.component}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </Route>
              )}
            </React.Fragment>
          ))}
        </Route>
      )}
    </>
  );
};
