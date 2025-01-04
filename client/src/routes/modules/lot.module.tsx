import { HomeModernIcon } from "@heroicons/react/24/outline";
import { RoleRoute } from "../../interfaces";
import {LotById} from "../../pages/projects/LotById.tsx";
import {LotInventory} from "../../pages/projects/LotInventory.tsx";


export const lotModule = (): RoleRoute => {
    const routes = {
        path: "/lotes",
        label: "Lotes",
        icon: <HomeModernIcon />,
        component: <div>Proyectos</div>,
        gap: false,
        submenu: true,
        sub: [

            {
                path: "/lotes/inventario",
                label: "Inventario de Lotes",
                component: <LotInventory />,
            },
            {
                path: ":id",
                component: <LotById />,
            },
        ],
    };

    return routes;
};
