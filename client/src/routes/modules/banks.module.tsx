import { BuildingLibraryIcon } from "@heroicons/react/24/outline";
import { CreateBank } from "../../pages/banks/CreateBank";
import { ListBanks } from "../../pages/banks/ListBanks";
import { BankById } from "../../pages/banks/BankById";
import { RoleRoute } from "../../interfaces";

export const banksModule = (): RoleRoute => {
  const routes = {
    label: "Bancos",
    icon: <BuildingLibraryIcon />,
    gap: false,
    path: "/bancos",
    submenu: true,
    sub: [
      {
        path: "/bancos/crear",
        label: "Crear Banco",
        component: <CreateBank />,
      },
      {
        path: "/bancos/lista",
        label: "Bancos",
        component: <ListBanks />,
      },
      {
        path: ":id",
        component: <BankById />,
      },
    ],
  };
  return routes;
};
