import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import * as cron from 'node-cron';
import { AuthGuard, RolesGuard } from 'src/modules/auth/guards';
import { LeadService } from '../services/lead.service';
import {
  LeadAdvisorToAssignedDTO,
  LeadCampaignToAssignedDTO,
  LeadDto,
  LeadStatusDTO,
  UpdateLeadDto,
} from '../dto/lead.dto';
import { AdminAccess, Roles } from 'src/modules/auth/decorators';
import { Roles as ROLES } from 'src/constants';

@ApiTags('Lead')
@ApiHeader({ name: 'authorization', description: 'Bearer token' })
@Controller('leads')
@UseGuards(AuthGuard, RolesGuard)
export class LeadController {
  constructor(private readonly leadService: LeadService) {
    cron.schedule('0 0 0 * * *', async () => {
      Promise.all([
        this.leadService.sendNotificationToAdvisorIfLeadIsNotContactedInTwoDays(),
        this.leadService.updateLeadsAfterThreeDaysWithoutContact(),
        this.leadService.sendNotificationToAdvisorToCallLead(),
      ]);
        
    });
  }

  @Post()
  @AdminAccess()
  @Roles(
    ROLES.COMMUNITY_MANAGER,
    ROLES.ADVISOR,
    ROLES.RECEPTIONIST,
    ROLES.BANK_MANAGER,
    ROLES.MANAGER,
  )
  async create(@Body() leadDto: LeadDto) {
    return await this.leadService.create(leadDto);
  }

  @Get()
  @AdminAccess()
  @Roles(ROLES.COMMUNITY_MANAGER, ROLES.RECEPTIONIST)
  async getAll() {
    return await this.leadService.getAllLeads();
  }

  @Get('/:leadId')
  async getLeadById(@Param('leadId') id: string) {
    return await this.leadService.getLeadById(id);
  }

  @Get('/status/:leadId')
  @AdminAccess()
  @Roles(
    ROLES.COMMUNITY_MANAGER,
    ROLES.ADVISOR,
    ROLES.MANAGER,
    ROLES.BANK_MANAGER,
    ROLES.RECEPTIONIST,
  )
  async getLeadStatusById(@Param('leadId') id: string) {
    return await this.leadService.getLeadStatus(id);
  }

  @Get('/advisor/:advisorId')
  @AdminAccess()
  @Roles(ROLES.COMMUNITY_MANAGER, ROLES.ADVISOR)
  async getLeadsByAdvisorID(@Param('advisorId') advisorID: string) {
    return await this.leadService.getLeadsByAdvisorID(advisorID);
  }

  @Get('/manager/:managerId')
  @AdminAccess()
  @Roles(ROLES.COMMUNITY_MANAGER, ROLES.MANAGER)
  async getLeadsByManagerID(@Param('managerId') managerID: string) {
    return await this.leadService.getLeadsByManagerID(managerID);
  }

  @Get('/bank-manager/:bankManagerId')
  @AdminAccess()
  @Roles(ROLES.COMMUNITY_MANAGER, ROLES.BANK_MANAGER)
  async getLeadsByBankManagerID(@Param('bankManagerId') bankManagerID: string) {
    return await this.leadService.getLeadsByBankManagerID(bankManagerID);
  }

  @Get('/receptionist/without-advisor')
  @AdminAccess()
  @Roles(ROLES.COMMUNITY_MANAGER, ROLES.RECEPTIONIST)
  async getLeadsWithoutAdvisor() {
    return await this.leadService.getLeadsWithouAdvisor();
  }

  @Get('/campaign/:campaignId')
  @AdminAccess()
  @Roles(
    ROLES.COMMUNITY_MANAGER,
    ROLES.ADVISOR,
    ROLES.MANAGER,
    ROLES.BANK_MANAGER,
  )
  async getLeadsByCampaignID(@Param('campaignId') campaignID: string) {
    return await this.leadService.getLeadsByCampaignID(campaignID);
  }

  @Put('/:leadId')
  async updateLead(@Param('leadId') id: string, @Body() lead: UpdateLeadDto) {
    return await this.leadService.updateLeadById(id, lead);
  }

  @Put('/status/:leadId')
  @AdminAccess()
  @Roles(
    ROLES.COMMUNITY_MANAGER,
    ROLES.ADVISOR,
    ROLES.MANAGER,
    ROLES.BANK_MANAGER,
    ROLES.RECEPTIONIST,
  )
  async updateLeadStatus(
    @Param('leadId') id: string,
    @Body() leadStatus: LeadStatusDTO,
  ) {
    return await this.leadService.updateLeadStatus(id, leadStatus);
  }

  @Put('/assign/advisor/:leadId')
  @AdminAccess()
  @Roles(ROLES.COMMUNITY_MANAGER, ROLES.ADVISOR, ROLES.RECEPTIONIST)
  async assignLead(
    @Param('leadId') id: string,
    @Body() advisor: LeadAdvisorToAssignedDTO,
  ) {
    return await this.leadService.updateLeadAdvisor(id, advisor.advisorID);
  }

  @Put('/assign/campaign/:leadId')
  @AdminAccess()
  @Roles(ROLES.COMMUNITY_MANAGER, ROLES.ADVISOR)
  async assignLeadToCampaign(
    @Param('leadId') id: string,
    @Body() campaign: LeadCampaignToAssignedDTO,
  ) {
    return await this.leadService.updateLeadCampaign(id, campaign.campaignID);
  }

  @Delete('/rejected-banks/:leadId/:bankId')
  @AdminAccess()
  @Roles(ROLES.BANK_MANAGER)
  async deleteRejectedBank(
    @Param('leadId') leadId: string,
    @Param('bankId') bankId: string,
  ) {
    return await this.leadService.deleteBankRejected(leadId, bankId);
  }

  @Delete('/:leadId')
  @AdminAccess()
  @Roles(ROLES.COMMUNITY_MANAGER, ROLES.MANAGER)
  async deleteLead(@Param('leadId') id: string) {
    return await this.leadService.deleteLeadById(id);
  }
}
