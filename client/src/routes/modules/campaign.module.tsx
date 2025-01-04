import { MegaphoneIcon } from "@heroicons/react/24/outline";
import { CreateCampaign } from "../../pages/campaigns/CreateCampaign";
import { CampaignsList } from "../../pages/campaigns/CampaignsList";
import { CampaignById } from "../../pages/campaigns/CampaignById";
import { RoleRoute } from "../../interfaces";

export const  campaignsModule = (): RoleRoute => {
    const routes = {
        label: "Campañas",
        icon: <MegaphoneIcon />,
        gap: false,
        submenu: true,
        path: "/campañas",
        sub: [
          {
            path: "/campañas/crear",
            label: "Crear Campaña",
            component: <CreateCampaign />,
          },
          {
            path: "/campañas/lista",
            label: "Campañas",
            component: <CampaignsList />,
          },
          {
            path: ":id",
            component: <CampaignById />,
          },
        ],
      }
    return routes;
};