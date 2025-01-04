import { banksModule, dashboardModule, leadsModule, settingsModule } from "../modules";
export const bankManagerRoutes = [
  dashboardModule(),
  leadsModule(),
  banksModule(),
  settingsModule(),
];
