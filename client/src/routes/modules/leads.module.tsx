import { CreateLead } from "../../pages/leads/CreateLead";
import { LeadById } from "../../pages/leads/LeadById";
import { LeadList } from "../../pages/leads/LeadList";
import { RoleRoute } from "../../interfaces";
import { UserGroupIcon } from "@heroicons/react/24/outline";

export const leadsModule = (): RoleRoute => {
  const routes = {
    label: "Prospectos",
    icon: <UserGroupIcon />,
    gap: false,
    submenu: true,
    path: "prospectos",
    sub: [
      {
        path: "/prospectos/crear",
        component: <CreateLead />,
        label: "Crear Prospecto",
      },
      {
        path: "/prospectos/lista",
        label: "Prospectos",
        component: (
          <LeadList

          />
        ),
      },
      // {
      //   path: "/prospectos/lista-prospectos-definidos",
      //   label: "Prospectos Definidos",
      //   component: <LeadList status="Prospecto Definido" />,
      // },
      // {
      //   path: "/prospectos/lista-precalificar-buro",
      //   label: "Prospectos Precalificar Buró",
      //   component: <LeadList status="Precalificar Buró" />,
      // },
      // {
      //   path: "/prospectos/lista-precalifcar-banco",
      //   label: "Prospectos Precalificar Banco",
      //   component: <LeadList status="Precalificar Banco" />,
      // },
      // {
      //   path: "/prospectos/lista-oportunidad-ventas-futuras",
      //   label: "Prospectos Oportunidad Ventas Futuras",
      //   component: <LeadList status="Oportunidad de venta futura" />,
      // },
      // {
      //   path: "/prospectos/lista-aprobados",
      //   label: "Prospectos Aprobados",
      //   component: <LeadList status="Por Asignar Proyecto" />,
      // },
      // {
      //   path: "/prospectos/lista-por-llamar",
      //   label: "Prospectos Por Llamar",
      //   component: <LeadList status="Por Llamar" />,
      // },
      {
        path: ":id",
        component: <LeadById />,
      },
    ],
  };

  return routes;
};
