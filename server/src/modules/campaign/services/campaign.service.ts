import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Campaign } from '../schemas';
import { Model } from 'mongoose';
import { CampaignDto, UpdateCampaignDto } from '../dto/campaign.dto';
import { ErrorManager } from 'src/utils/error.manager'; // Import the ErrorManager utility

@Injectable()
export class CampaignService {
  constructor(
    @InjectModel(Campaign.name) private readonly campaignModel: Model<Campaign>,
  ) {}

  // Create a new campaign
  async create(campaign: CampaignDto): Promise<Campaign> {
    try {
      const newCampaign = new this.campaignModel(campaign);
      return await newCampaign.save();
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  // Get all campaigns
  async getAllCampaigns(): Promise<Campaign[]> {
    try {
      return await this.campaignModel.find();
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async getAllActiveCampaigns(): Promise<Campaign[]> {
    try {
      return await this.campaignModel.find({ status: true });
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  // Get a campaign by ID
  async getCampaignById(id: string): Promise<Campaign> {
    try {
      return await this.campaignModel.findById(id);
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  // Update a campaign by ID
  async updateCampaign(
    id: string,
    campaign: UpdateCampaignDto,
  ): Promise<Campaign> {
    try {
      const updatedCampaign = await this.campaignModel.findByIdAndUpdate(
        id,
        campaign,
        { new: true },
      );
      return updatedCampaign;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  // Delete a campaign by ID
  async deleteCampaign(id: string) {
    try {
      const campaignFound = await this.campaignModel.findById(id);
      if(!campaignFound){
        throw new ErrorManager({
          type:'NOT_FOUND',
          message: "La campaña no existe"
        });
      }
      

      return await this.campaignModel.findByIdAndDelete(id);
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
