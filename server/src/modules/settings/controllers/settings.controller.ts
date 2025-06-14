import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SettingsService } from '../services/settings.service';
import { CreateSettingDto } from '../dto/create-setting.dto';
import { UpdateSettingDto } from '../dto/update-setting.dto';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getSettings() {
    return this.settingsService.getSettings();
  }

  @Patch()
  updateSettings(@Body() updateSettingDto: UpdateSettingDto) {
    return this.settingsService.updateSettings(updateSettingDto);
  }

  @Post('individual-goals')
  createGoalForAdvisor(@Body() goal: CreateSettingDto) {
    return this.settingsService.createGoalForAdvisor(goal);
  }

  @Patch('individual-goals')
  updateGoalForAdvisor(@Body() goal: UpdateSettingDto) {
    return this.settingsService.updateGoalForAdvisor(goal);
  }

  @Delete('individual-goals/:id')
  deleteGoalForAdvisor(@Param('id') id: string) {
    return this.settingsService.deleteGoalForAdvisor(id);
  }

  @Post('general-goals')
  createGeneralGoal(@Body() goal: CreateSettingDto) {
    return this.settingsService.createGeneralGoal(goal);
  }

  @Patch('general-goals')
  updateGeneralGoal(@Body() goal: UpdateSettingDto) {
    return this.settingsService.updateGeneralGoal(goal);
  }

  @Delete('general-goals/:id')
  deleteGeneralGoal(@Param('id') id: string) {
    return this.settingsService.deleteGeneralGoal(id);
  }


}
