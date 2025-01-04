import { campaignsModule, dashboardModule, leadsModule, settingsModule } from "../modules";
export const communityRoutes = [
  dashboardModule(),
  leadsModule(),
  campaignsModule(),
  settingsModule(),
];