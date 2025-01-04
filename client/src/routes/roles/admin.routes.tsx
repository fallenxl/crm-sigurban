import {
  banksModule,
  campaignsModule,
  dashboardModule,
  leadsModule,
  projectsModule,
  settingsModule,
  usersModule,
} from "../modules";
import {lotModule} from "../modules/lot.module.tsx";

export const adminRoutes = [
  dashboardModule(),
  leadsModule(),
  campaignsModule(),
  banksModule(),
  projectsModule(),
  lotModule(),
  usersModule(),
  settingsModule(),
];
