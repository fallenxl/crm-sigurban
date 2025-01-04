import { HomeModernIcon } from "@heroicons/react/24/outline";
import { ProjectsList } from "../../pages/projects/ProjectsList";
import { RoleRoute } from "../../interfaces";
import { CreateProject } from "../../pages/projects/CreateProject";
import { ProjectById } from "../../pages/projects/ProjectById";
import {ProjectPlans} from "../../pages/projects/ProjectPlans.tsx";

export const projectsModule = (): RoleRoute => {
  const routes = {
    path: "/proyectos",
    label: "Proyectos",
    icon: <HomeModernIcon />,
    component: <div>Proyectos</div>,
    gap: false,
    submenu: true,
    sub: [
      {
        path: "/proyectos/crear",
        label: "Crear Proyecto",
        component: <CreateProject />,
      },
      {
        path: "/proyectos/lista",
        label: "Proyectos",
        component: <ProjectsList />,
      },
      {
        path: "/proyectos/planos",
        label: "Planos de Proyectos",
        component: <ProjectPlans />,
      },
      {
        path: ":id",
        component: <ProjectById />,
      },
    ],
  };

  return routes;
};
