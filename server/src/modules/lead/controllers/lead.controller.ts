import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { AuthGuard, RolesGuard } from 'src/modules/auth/guards';
import { LeadService } from '../services/lead.service';
import {
  LeadAdvisorToAssignedDTO,
  LeadCampaignToAssignedDTO,
  LeadChatbotDto,
  LeadDto,
  LeadStatusDTO,
  UpdateLeadDto,
} from '../dto/lead.dto';
import { AdminAccess, Roles } from 'src/modules/auth/decorators';
import { Roles as ROLES } from 'src/constants';
import { StateService } from '../services/state.service';
import { NotificationService } from 'src/modules/notification/services/notification.service';
import * as cron from 'node-cron';
@ApiTags('Lead')
@ApiHeader({ name: 'authorization', description: 'Bearer token' })
@Controller('leads')
@UseGuards(AuthGuard, RolesGuard)
export class LeadController {
  constructor(
    private readonly leadService: LeadService,
    private readonly stateService: StateService,
    private readonly notificationService: NotificationService,
  ) {
    // 00:00 every day
    cron.schedule(
      '0 0 * * *',
      async () => {
        try {
          await Promise.all([
            this.leadService.sendNotificationBasedSettings()
          ]);
        } catch (error) {
          console.log('Error in cron job', error);
        }
      },
      { timezone: 'America/Managua' },
    );
  }

  @Post()
  async create(@Body() leadDto: any) {
    return await this.leadService.create(leadDto);
  }

  @Post('/chatbot')
  async createChatbotLead(@Body() leadDto: LeadChatbotDto) {
    return await this.leadService.createLeadByChatbot(leadDto);
  }

  @Post('/comments/create/:leadId')
  async createComment(@Body() body: any, @Param('leadId') leadId: string) {
    return await this.leadService.createComment(leadId, body);
  }

  @Get()
  async getAll() {
    return await this.leadService.getAllLeads();
  }
  @Get('/without-lot')
  async getLeadsWithoutLot() {
    return await this.leadService.getLeadsWithoutLot();
  }

  @Get('/:leadId')
  async getLeadById(@Param('leadId') id: string) {
    return await this.leadService.getLeadById(id);
  }

  

  @Get('/status/:leadId')
  async getLeadStatusById(@Param('leadId') id: string) {
    return await this.stateService.getLeadStatus(id);
  }

  @Get('/user/:userId')
  async getLeadsByUserID(@Param('userId') userID: string) {
    return await this.leadService.getLeadsByUserID(userID);
  }

  @Get('/advisor/:advisorId')
  async getLeadsByAdvisorID(@Param('advisorId') advisorID: string) {
    return await this.leadService.getLeadsByAdvisorID(advisorID);
  }

  @Get('/manager/:managerId')
  async getLeadsByManagerID(@Param('managerId') managerID: string) {
    return await this.leadService.getLeadsByManagerID(managerID);
  }

  @Get('/bank-manager/:bankManagerId')
  async getLeadsByBankManagerID(@Param('bankManagerId') bankManagerID: string) {
    return await this.leadService.getLeadsByBankManagerID(bankManagerID);
  }

  @Get('/receptionist/without-advisor')
  async getLeadsWithoutAdvisor() {
    return await this.leadService.getLeadsWithoutAdvisor();
  }

  @Get('/campaign/:campaignId')
  async getLeadsByCampaignID(@Param('campaignId') campaignID: string) {
    return await this.leadService.getLeadsByCampaignID(campaignID);
  }


  @Delete('/comments/delete/:leadId/:commentId')
  async deleteComment(@Param('leadId') leadId: string, @Param('commentId') commentId: string) {
    return await this.leadService.deleteComment(leadId, commentId);
  }

  @Put('/project-details/:leadId')
  async updateProjectDetails(@Param('leadId') id: string, @Body() body: any) {
    return await this.leadService.updateLeadProjectDetails(id, body);
  }
  @Put('/:leadId')
  async updateLead(@Param('leadId') id: string, @Body() lead: UpdateLeadDto) {
    return await this.leadService.updateLeadById(id, lead);
  }
  @Patch('status/revert/:leadId')
  async revertLeadStatus(@Param('leadId') id: string) {
    return await this.leadService.revertLeadStatus(id);
  }



  @Put('/status/:leadId')
  async updateLeadStatus(
    @Param('leadId') id: string,
    @Body() leadStatus: LeadStatusDTO,
  ) {
    return await this.stateService.updateLeadStatus(id, leadStatus);
  }

  @Put('/assign/advisor/:leadId')
  async assignLead(
    @Param('leadId') id: string,
    @Body() advisor: LeadAdvisorToAssignedDTO,
  ) {
    return await this.leadService.updateLeadAdvisor(id, advisor.advisorID);
  }

  @Put('/assign/campaign/:leadId')
  async assignLeadToCampaign(
    @Param('leadId') id: string,
    @Body() campaign: LeadCampaignToAssignedDTO,
  ) {
    return await this.leadService.updateLeadCampaign(id, campaign.campaignID);
  }

  @Patch('/documents/:leadId')
  async updateDocuments(@Param('leadId') id: string, @Body() body: any) {
    return await this.leadService.deleteDocument(id, body.data.document);
  }

  @Delete('/rejected-banks/:leadId/:bankId')
  async deleteRejectedBank(
    @Param('leadId') leadId: string,
    @Param('bankId') bankId: string,
  ) {
    return await this.leadService.deleteBankRejected(leadId, bankId);
  }

  @Delete('/:leadId')
  async deleteLead(@Param('leadId') id: string) {
    return await this.leadService.deleteLeadById(id);
  }
}
