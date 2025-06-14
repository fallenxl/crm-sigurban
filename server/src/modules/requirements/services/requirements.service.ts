import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Requirements } from '../schema/requirements.schema';
import { Model } from 'mongoose';
import { ErrorManager } from 'src/utils/error.manager';

@Injectable()
export class RequirementsService {
  constructor(
    @InjectModel(Requirements.name)
    private readonly requirementsModel: Model<Requirements>,
  ) {}

  async createRequirement(requirement: any): Promise<Requirements> {
    try {
      const requirementFound = await this.getRequirementByName(
        requirement.name,
      );
      if (requirementFound) {
        throw new ErrorManager({
          type: 'CONFLICT',
          message: 'Requirement already exists',
        });
      }
      const newRequirement = new this.requirementsModel(requirement);

      return newRequirement.save();
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async getAllRequirements(): Promise<Requirements[]> {
    try {
      return await this.requirementsModel.find();
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async searchRequirements(query: any): Promise<Requirements[]> {
    try {
      if (query.id) {
        return [await this.getRequirementById(query.id)];
      }
      if (query.name) {
        return [await this.getRequirementByName(query.name)];
      }
      return [];
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async getRequirementById(id: string): Promise<Requirements> {
    try {
      return await this.requirementsModel.findById(id);
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async getRequirementByName(name: string): Promise<Requirements> {
    try {
      return await this.requirementsModel.findOne({ name });
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async updateRequirement(
    name: string,
    requirement: any,
  ): Promise<Requirements> {
    try {
      const requirementFound = await this.getRequirementByName(name);
      if (!requirementFound) {
        return this.createRequirement(requirement);
      }

      return await this.requirementsModel.findOneAndUpdate(
        { name },
        requirement,
        { new: true },
      );
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async removeRequirement(id: string): Promise<Requirements> {
    try {
      return await this.requirementsModel.findByIdAndRemove(id);
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
