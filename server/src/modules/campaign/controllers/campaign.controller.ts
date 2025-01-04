import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CampaignService } from '../services/campaign.service';
import { CampaignDto, UpdateCampaignDto } from '../dto/campaign.dto';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { AuthGuard, RolesGuard } from 'src/modules/auth/guards';
import { AdminAccess, Roles } from 'src/modules/auth/decorators';

@ApiTags('Campaign (Admin and Community Manager)')
@ApiHeader({ name: 'authorization', description: 'Bearer token' })
@UseGuards(AuthGuard, RolesGuard)
@Controller('campaign')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @AdminAccess()
  @Roles('COMMUNITY_MANAGER')
  @Post()
  async createCampaign(@Body() campaign: CampaignDto) {
    return await this.campaignService.create(campaign);
  }

  @Get()
  async getAllCampaigns() {
    return await this.campaignService.getAllCampaigns();
  }

  @Get('status/active')
  async getAllCampaignsByStatus() {
    return await this.campaignService.getAllActiveCampaigns();
  }


  @AdminAccess()
  @Roles('COMMUNITY_MANAGER')
  @Get(':id')
  async getCampaignById(@Param('id') id: string) {
    return await this.campaignService.getCampaignById(id);
  }

  @AdminAccess()
  @Roles('COMMUNITY_MANAGER')
  @Put(':id')
  async updateCampaign(@Param('id') id: string, @Body() campaign: UpdateCampaignDto) {
    return await this.campaignService.updateCampaign(id, campaign);
  }

  @AdminAccess()
  @Roles('COMMUNITY_MANAGER')
  @Delete(':id')
  async deleteCampaign(@Param('id') id: string) {
    return await this.campaignService.deleteCampaign(id);
  }
}
