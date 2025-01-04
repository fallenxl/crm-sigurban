import { PresentationChartBarIcon } from "@heroicons/react/24/outline";
import { Dashboard } from "../../pages";

export const dashboardModule = () => {
  const routes = {
    path: "/dashboard",
    label: "Dashboard",
    icon: <PresentationChartBarIcon />,
    component: <Dashboard />,
    gap: false,
  };

  return routes;
};
