import { UserIcon } from "@heroicons/react/24/outline";
import { CreateUser } from "../../pages/users/CreateUser";
import { RoleRoute } from "../../interfaces";
import { UserByID } from "../../pages/users/UserByID";
import { UsersList } from "../../pages/users/usersList";
// import { RolesPage } from "../../pages/users/roles/Roles";

export const usersModule = (): RoleRoute => {
  const routes = {
    label: "Usuarios",
    icon: <UserIcon />,
    gap: false,
    path: "usuarios",
    submenu: true,
    sub: [
      {
        path: "/usuarios/crear",
        label: "Crear Usuario",
        component: <CreateUser />,
      },
      {
        path: "/usuarios/lista",
        label: "Usuarios",
        component: <UsersList />,
      },
      {
        path: ":id",
        component:<UserByID />
      }
    ],
  };
  return routes;
};
