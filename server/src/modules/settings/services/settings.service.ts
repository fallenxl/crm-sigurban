import { Injectable } from '@nestjs/common';
import { CreateSettingDto } from '../dto/create-setting.dto';
import { UpdateSettingDto } from '../dto/update-setting.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Goal, Settings } from '../schemas/settings.schema';
import { Model } from 'mongoose';
import { ErrorManager } from 'src/utils/error.manager';
import { UsersService } from 'src/modules/users/services/users.service';
import { LeadService } from 'src/modules/lead/services/lead.service';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Settings.name) private readonly settingsModel: Model<Settings>,
 
  ) {
  }

  async getSettings() {
    return await this.settingsModel.findOne();
  }

  async updateSettings(updateSettingDto: UpdateSettingDto) {
    console.log(updateSettingDto);
    return await this.settingsModel.updateOne({}, updateSettingDto);
  }

  async getBureauPrequalificationDays() {
    const settings = await this.getSettings();
    return settings.bureauPrequalificationDays;
  }

  async getBankPrequalificationDays() {
    const settings = await this.getSettings();
    return settings.bankPrequalificationDays;
  }


  async getGeneralGoals() {
   try {
    const settings = await this.getSettings();
    return settings.generalGoals;
   } catch (error) {
      throw new ErrorManager.createSignatureError(error.message);
   }
  }

  async getIndividualGoalsByAdvisor() {
    try {
      const settings = await this.getSettings();
      return settings.individualGoalsAdvisor;
    } catch (error) {
      throw new ErrorManager.createSignatureError(error.message);
    }
  }

  async createGoalForAdvisor(goal: CreateSettingDto) {
    try {
      // generate mongoose id
      const newGoal = {
        _id: new this.settingsModel().id,
        ...goal
      };

      return await this.settingsModel.updateOne({}, { $push: { individualGoalsAdvisor: newGoal } });
    } catch (error) {
      throw new ErrorManager.createSignatureError(error.message);

    }

  }

  async updateGoalForAdvisor(goal: UpdateSettingDto) {
    try {
      return await this.settingsModel.updateOne({}, { $set: { individualGoalsAdvisor: goal } });
    } catch (error) {
      throw new ErrorManager.createSignatureError(error.message);
    }
  }

  async deleteGoalForAdvisor(goalId: string) {
    try {
      return await this.settingsModel.updateOne({}, { $pull: { individualGoalsAdvisor: { _id: goalId } } });
    } catch (error) {
      throw new ErrorManager.createSignatureError(error.message);
    }
  }

  async createGeneralGoal(goal: CreateSettingDto) {
    try {
      const newGoal = {
        _id: new this.settingsModel().id,
        ...goal
      }
      return await this.settingsModel.updateOne({}, { $push: { generalGoals: newGoal } });
    } catch (error) {
      throw new ErrorManager.createSignatureError(error.message);
    }
  }

  async updateGeneralGoal(goal: UpdateSettingDto) {
    try {
      return await this.settingsModel.updateOne({}, { $set: { generalGoals: goal } });
    } catch (error) {
      throw new ErrorManager.createSignatureError(error.message);
    }
  }

  async deleteGeneralGoal(goalId: string) {
    try {
      return await this.settingsModel.updateOne({}, { $pull: { generalGoals: { _id: goalId } } });
    } catch (error) {
      throw new ErrorManager.createSignatureError(error.message);
    }
  }

  async getCurrentGoals() {
    try {
      const generalGoals = (await this.getGeneralGoals()).find(goal => goal.startDate <= new Date() && goal.endDate >= new Date());
      const individualGoals = (await this.getIndividualGoalsByAdvisor()).find(goal => goal.startDate <= new Date() && goal.endDate >= new Date())
    
      return { generalGoals: generalGoals, individualGoals: individualGoals };
    } catch (error) {
      throw new ErrorManager.createSignatureError(error.message);
    }
  }



}
