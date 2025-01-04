import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { Settings } from "../../pages/settings/Settings";

export const settingsModule = () => {
  const routes = {
    path: "/configuracion",
    label: "Configuración",
    gap: false,
    icon: <Cog6ToothIcon />,
    component: <Settings />,
  };
  return routes;
};
