import { IGoal } from "../interfaces/settings.interface";

export class UpdateSettingDto {
  bureauPrequalificationDays: number;
  bankPrequalificationDays: number;
  generalGoals: IGoal[];

  individualGoalsByAdvisor: Map<string, IGoal[]>;
}
