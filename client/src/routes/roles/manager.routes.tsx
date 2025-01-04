import {banksModule, campaignsModule, dashboardModule, leadsModule, projectsModule, settingsModule} from "../modules";
import {lotModule} from "../modules/lot.module.tsx";
export const managerRoutes = [
  dashboardModule(),
  leadsModule(),

    projectsModule(),
  lotModule(),
    campaignsModule(),
    banksModule(),
  settingsModule(),
];
