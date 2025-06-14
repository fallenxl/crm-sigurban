import { Inject, Injectable, Scope } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Lead } from '../schemas/lead.schemas';
import mongoose, { Document, Model } from 'mongoose';
import { ErrorManager } from '../../../utils/error.manager'; // Import the ErrorManager utility
import { LeadChatbotDto, LeadDto, LeadStatusDTO, UpdateLeadDto } from '../dto/lead.dto';
import { UsersService } from '../../users/services/users.service';
import { LEAD_COLUMNS, LeadStatustype } from '../interfaces';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { v4 as uuid } from 'uuid'; // Import the uuid library for generating unique IDs
import { POPULATES_LEAD, Roles } from '../../../constants';
import { CampaignService } from 'src/modules/campaign/services/campaign.service';
import { NotificationService } from 'src/modules/notification/services/notification.service';
import { BankService } from 'src/modules/bank/services';
import { SocketGateway } from 'src/modules/socket/gateways/socket.gateway';
import { CheckPermissionsService } from './check-permissions.service';
import { LotsService } from 'src/modules/lots/services/lots.service';
import { SettingsService } from '../../settings/services/settings.service';
import PDFDocument from 'pdfkit-table';
import * as ExcelJS from 'exceljs';
@Injectable({ scope: Scope.REQUEST })
export class LeadService {
  constructor(
    @InjectModel(Lead.name) private readonly leadModel: Model<Lead>,
    @Inject(REQUEST) private readonly request: Request,
    private readonly userService: UsersService,
    private readonly campaignService: CampaignService,
    private readonly notificationService: NotificationService,
    private readonly bankService: BankService,
    private readonly socketGateway: SocketGateway,
    private readonly checkPermissions: CheckPermissionsService,
    private readonly lotService: LotsService,
    private readonly settingsService: SettingsService,
  ) {
  }

  /*
   *  Principal operations
   */

  // Create a new lead
  async create(lead: LeadDto): Promise<Lead> {
    try {
      let leadFound;
      let messageError = '';
      if (lead.dni) {
        leadFound = await this.getLeadByDni(lead.dni);
        messageError = 'Ya existe un prospecto con ese DNI';
        if (leadFound) {
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message: messageError,
          });
        }
      } else if (lead.passport) {
        leadFound = await this.getLeadByPassport(lead.passport);
        messageError = 'Ya existe un prospecto con ese pasaporte';
        if (leadFound) {
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message: messageError,
          });
        }
      } else if (lead.residenceNumber) {
        leadFound = await this.getLeadByResidenceNumber(lead.residenceNumber);
        messageError = 'Ya existe un prospecto con ese número de residencia';
        if (leadFound) {
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message: messageError,
          });
        }
      }


      lead.status = LeadStatustype.TO_ASSIGN;

      // If the lead has an advisorID, we check if the user exists and if it is an advisor
      if (lead.advisorID) {
        const userFound = await this.userService.userExists(lead.advisorID);
        await this.userService.setLastAdvisor(userFound._id);
        lead.status = LeadStatustype.TO_CALL;
      }

      const userFound = await this.userService.userExists(this.request.idUser);
      lead.avatar =
        lead.avatar ||
        `https://api.dicebear.com/5.x/initials/svg?seed=${lead.name.split(' ')[0]
        }`;
      lead.timeline = [
        {
          status: lead.status,
          title: 'Lead creado',
          message: 'El lead ha sido creado',
          date: new Date(),
          _id: uuid(),
          updatedBy: userFound.name,
        },
      ];
      // If the lead has a campaignID, we check if the campaign exists
      lead.campaignID = lead.campaignID || null;

      const createdLead = await this.leadModel.create(lead);
      if (createdLead.advisorID) {
        await this.notificationService.sendNotification({
          title: 'Nuevo prospecto asignado',
          message: `Se te ha asignado un nuevo prospecto con el nombre ${createdLead.name}`,
          userID: createdLead.advisorID,
          leadID: createdLead._id,
        });
        await this.notificationService.sendNotificationToAdmin({
          title: 'Prospecto actualizado',
          message: `El prospecto ${createdLead.name} ha sido actualizado`,
          leadID: createdLead._id,
        });
      } else {
        await this.notificationService.sendNotificationByRole(
          {
            title: 'Nuevo prospecto registrado',
            message: `Se ha registrado un nuevo lead con el nombre ${createdLead.name}, asignarlo a un asesor lo antes posible`,
            leadID: createdLead._id,
          },
          [Roles.RECEPTIONIST, Roles.ADMIN],
        );
      }
      this.socketGateway.leadUpdated([createdLead.advisorID?.toString()]);

      return createdLead.populate(POPULATES_LEAD);
    } catch (error) {
      if (error.status === 201) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'El prospecto ya existe',
        });
      }
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async createLeadByChatbot(lead: LeadChatbotDto): Promise<Lead> {
    try {
      const leadFound = await this.getLeadByDni(lead.dni);
      if (leadFound) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'Ya existe un prospecto con ese DNI',
        });
      }

      lead.advisorID = (await this.userService.getLastAdvisor())._id;

      lead.status = LeadStatustype.TO_CALL;
      lead.source = 'Facebook Naranja';
      lead.timeline = [
        {
          status: lead.status,
          title: 'Lead creado',
          message: 'El lead ha sido creado',
          date: new Date(),
          _id: uuid(),
          updatedBy: "Chatbot",
        },
      ];


      const createdLead = await this.leadModel.create(lead);
      if (createdLead.advisorID) {
        await this.notificationService.sendNotification({
          title: 'Nuevo prospecto asignado',
          message: `Se te ha asignado un nuevo prospecto con el nombre ${createdLead.name}`,
          userID: createdLead.advisorID,
          leadID: createdLead._id,
        });
      } else {
        await this.notificationService.sendNotificationByRole(
          {
            title: 'Nuevo prospecto registrado',
            message: `Se ha registrado un nuevo lead con el nombre ${createdLead.name}, asignarlo a un asesor lo antes posible`,
            leadID: createdLead._id,
          },
          [Roles.RECEPTIONIST, Roles.ADMIN],
        );
      }
      this.socketGateway.leadUpdated([createdLead.advisorID?.toString()]);

      return createdLead.populate(POPULATES_LEAD);
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  // Get all leads
  async getAllLeads(): Promise<Lead[]> {
    try {
      return await this.leadModel
        .find()
        .populate(POPULATES_LEAD)
        .sort({ createdAt: -1 });
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  // Get a lead by ID
  async getLeadById(id: string): Promise<Lead> {
    try {

      const leadFound = await this.leadExists(id);

      return await leadFound.populate(POPULATES_LEAD);
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async getLeadByResidenceNumber(residenceNumber: string): Promise<Lead> {
    try {
      return this.leadModel.findOne({ residenceNumber });
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async getLeadByPassport(passport: string): Promise<Lead> {
    try {
      return this.leadModel.findOne({ passport });
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  // Get a lead by DNI
  async getLeadByDni(dni: string): Promise<Lead> {
    try {
      return this.leadModel.findOne({ dni });
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  // Get all leads by status
  async getLeadsByProspectStatus(): Promise<Lead[]> {
    try {
      return this.leadModel
        .find({ status: LeadStatustype.PROSPECT })
        .populate(POPULATES_LEAD)
        .sort({ createdAt: -1 });
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async getLeadsByUserID(userID: string): Promise<Lead[]> {
    try {
      return this.leadModel
        .find({
          $or: [
            { advisorID: userID },
            { managerID: userID },
            { bankManagerID: userID },
          ],
        })
        .populate(POPULATES_LEAD)
        .sort({ createdAt: -1 });
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  // Get all leads by advisorID
  async getLeadsByAdvisorID(advisorID: string): Promise<Lead[]> {
    try {
      return this.leadModel
        .find({ advisorID })
        .populate(POPULATES_LEAD)
        .sort({ createdAt: -1 });
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  // Get all leads by managerID
  async getLeadsByManagerID(managerID: string): Promise<Lead[]> {
    try {
      return this.leadModel
        .find({ managerID })
        .populate(POPULATES_LEAD)
        .sort({ createdAt: -1 });
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  // Get all leads by bankManagerID
  async getLeadsByBankManagerID(bankManagerID: string): Promise<Lead[]> {
    try {
      return this.leadModel
        .find({ bankManagerID })
        .populate(POPULATES_LEAD)
        .sort({ createdAt: -1 });
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async getLeadsWithoutAdvisor(): Promise<Lead[]> {
    try {
      return this.leadModel.find({ advisorID: null }).populate(POPULATES_LEAD);
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async getLeadsByCampaignID(campaignID: string): Promise<Lead[]> {
    try {
      return this.leadModel.find({ campaignID }).populate(POPULATES_LEAD);
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  // Update only information of a lead
  async updateLeadById(id: string, lead: UpdateLeadDto): Promise<Lead> {
    try {
      console.log(lead);
      const { idUser, roleUser } = this.request;
      const leadFound = await this.leadExists(id);

      // if(!this.checkPermissions.checkPermission(roleUser, leadFound, idUser)){
      //   throw new ErrorManager({
      //     type: 'BAD_REQUEST',
      //     message: 'No tienes permisos para actualizar el prospecto',
      //   });
      // }

      if (lead.dni && lead.dni !== leadFound.dni) {
        const dniExists = await this.getLeadByDni(lead.dni);
        if (dniExists) {
          console.log(dniExists);
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message: 'El DNI ya existe',
          });
        }
      }

      if (lead.passport && lead.passport !== leadFound.passport) {
        const passportExists = await this.getLeadByPassport(lead.passport);
        if (passportExists) {
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message: 'El pasaporte ya existe',
          });
        }
      }

      if (lead.residenceNumber && lead.residenceNumber !== leadFound.residenceNumber) {
        const residenceNumberExists = await this.getLeadByResidenceNumber(lead.residenceNumber);
        if (residenceNumberExists) {
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message: 'El número de residencia ya existe',
          });
        }
      }

      const userFound = await this.userService.userExists(this.request.idUser);

      lead.timeline = [
        ...leadFound.timeline,
        {
          _id: uuid(),
          updatedBy: userFound.name,
          status: leadFound.status,
          title: `Prospecto actualizado`,
          message: `El prospecto ha sido actualizado, se modificaron los campos: ${lead.updatedColumns
            .map((item: string) => {
              return LEAD_COLUMNS[item];
            })
            .join(', ')}.`,
          date: new Date(),
        },
      ];

      const leadUpdated = await this.leadModel.findOneAndUpdate(
        { _id: id },
        lead,
      );

      this.socketGateway.leadUpdated([
        leadUpdated.advisorID?.toString(),
        leadUpdated.managerID?.toString(),
      ]);

      return leadUpdated.populate(POPULATES_LEAD);
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  // update lead after three days without contact
  async updateLeadsAfterThreeDaysWithoutContact(): Promise<void> {
    try {
      const leads = await this.leadModel.find({
        status: LeadStatustype.TO_CALL,
      });

      const today = new Date();
      const threeDays = 3 * 24 * 60 * 60 * 1000;

      leads.forEach(async (lead) => {
        const lastUpdate = lead.timeline[lead.timeline.length - 1].date;
        const diff = today.getTime() - lastUpdate.getTime();

        if (diff > threeDays) {
          lead.status = LeadStatustype.TO_ASSIGN;
          lead.advisorID = null;
          lead.timeline.push({
            _id: uuid(),
            updatedBy: 'Sistema',
            status: lead.status,
            title: 'Prospecto actualizado',
            message: 'El prospecto no ha sido contactado en 3 dias',
            date: new Date(),
          });

          await this.notificationService.sendNotificationToAdmin({
            title: 'Prospecto actualizado',
            message: `El prospecto ${lead.name} ha sido actualizado, no ha sido contactado en 3 dias`,
            leadID: lead._id,
          });
          await this.notificationService.sendNotification({
            title: 'Prospecto actualizado',
            message: `El prospecto ${lead.name} ha sido actualizado, no ha sido contactado en 3 dias`,
            userID: lead.advisorID,
            leadID: lead._id,
          });
          await lead.save();
        }
      });

      Promise.all(leads);
      this.socketGateway.leadUpdated();
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async revertLeadStatus(id: string): Promise<Lead> {
    try {
      const leadFound = await this.leadExists(id);
      if (!leadFound.lastStatus) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se puede revertir el estado del prospecto',
        });
      }
      if (leadFound.status.type === LeadStatustype.TO_BANK_PREQUALIFIED.type) {
        leadFound.bankID = null;
        leadFound.financingProgram = '';
      }

      if (leadFound.status.type === LeadStatustype.TO_ASSIGN.type) {
        leadFound.advisorID = null;
      }

      if (leadFound.status.type === LeadStatustype.TO_ASSIGN_HOUSE.type) {
        await this.lotService.releaseLot(leadFound.projectDetails.lotID);
        leadFound.projectDetails = {
          lotID: null,
          projectID: null,
          houseModel: null,
        };


      }

      if (leadFound.status.type === LeadStatustype.PROSPECT_DEFINED.type && !leadFound.status.condition) {
        leadFound.projectDetails.houseModel = null;

      }

      leadFound.status = leadFound.lastStatus;

      const userFound = await this.userService.userExists(this.request.idUser);

      leadFound.timeline.push({
        _id: uuid(),
        updatedBy: userFound.name,
        status: leadFound.status,
        title: `Prospecto actualizado`,
        message: 'Se ha revertido el estado del prospecto',
        date: new Date(),
      });

      this.socketGateway.leadUpdated();
      return await leadFound.save();


    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  // Update the advisor of a lead
  async updateLeadAdvisor(id: string, advisorID: string): Promise<Lead> {
    try {
      const leadFound = await this.leadExists(id);
      const userFound = await this.userService.userExists(this.request.idUser);
      leadFound.advisorID = advisorID || undefined;

      if (leadFound.advisorID) {
        await this.notificationService.sendNotification({
          title: 'Nuevo prospecto asignado',
          message: `Se te ha asignado un nuevo prospecto con el nombre ${leadFound.name}`,
          userID: advisorID,
          leadID: leadFound._id,
        });

        await this.notificationService.sendNotificationToAdmin({
          title: 'Prospecto actualizado',
          message: `El prospecto ${leadFound.name} ha sido actualizado`,
          leadID: leadFound._id,
        });

        // Create a new timeline for the lead
        leadFound.timeline.push({
          _id: uuid(),
          updatedBy: userFound.name,
          status: leadFound.status,
          title: `Prospecto actualizado`,
          message: 'Prospecto asignado a un nuevo asesor',
          date: new Date(),
        });
      } else {
        await this.notificationService.sendNotificationToAdmin({
          title: 'Prospecto actualizado',
          message: `El prospecto ${leadFound.name} ha sido actualizado`,
          leadID: leadFound._id,
        });

        // Create a new timeline for the lead
        leadFound.timeline.push({
          _id: uuid(),
          updatedBy: userFound.name,
          status: leadFound.status,
          title: `Prospecto actualizado`,
          message: 'Prospecto se le ha quitado un asesor',
          date: new Date(),
        });
      }

      this.socketGateway.leadUpdated([
        leadFound.advisorID?.toString(),
        leadFound.managerID?.toString(),
        leadFound.bankManagerID?.toString(),
      ]);
      return (await leadFound.save()).populate(POPULATES_LEAD);
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  // update the campaign of a lead
  async updateLeadCampaign(id: string, campaignID: string): Promise<Lead> {
    try {
      const leadFound = await this.leadExists(id);
      const campaignFound =
        await this.campaignService.getCampaignById(campaignID);
      if (!campaignFound) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'La campaña no existe',
        });
      }

      leadFound.campaignID = campaignFound._id;

      await this.notificationService.sendNotificationToAdmin({
        title: 'Prospecto actualizado',
        message: `El prospecto ${leadFound.name} ha sido actualizado`,
      });

      const userFound = await this.userService.userExists(this.request.idUser);
      // Create a new timeline for the lead
      leadFound.timeline.push({
        _id: uuid(),
        updatedBy: userFound.name,
        status: leadFound.status,
        title: `Prospecto actualizado`,
        message: 'Prospecto asignado a una nueva campaña',
        date: new Date(),
      });

      this.socketGateway.leadUpdated();
      return (await leadFound.save()).populate(POPULATES_LEAD);
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async createComment(id: string, comment: { comment: string }): Promise<Lead> {
    try {
      const leadFound = await this.leadExists(id);
      const userFound = await this.userService.userExists(this.request.idUser);

      leadFound.comments.push({
        comment: comment.comment,
        date: new Date(),
        userID: userFound._id,
      });

      this.socketGateway.leadUpdated();
      await this.notificationService.sendNotificationToInvolved({
        title: 'Nuevo comentario',
        message: `Se ha agregado un nuevo comentario al prospecto ${leadFound.name}`,
        leadID: leadFound._id,
      }, leadFound);

      return await leadFound.save();
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async deleteBankRejected(id: string, bankID: string) {
    try {
      const leadFound = await this.leadExists(id);
      const bankFound = await this.bankService.bankExists(bankID);

      leadFound.rejectedBanks = leadFound.rejectedBanks.filter(
        (bank) => bank.toString() !== bankFound._id.toString(),
      );
      this.socketGateway.leadUpdated();
      return await leadFound.save();
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  // Delete a lead by ID
  async deleteLeadById(id: string) {
    try {
      console.log(id);
      const leadFound = await this.leadModel.findOne({ _id: id });
      if (!leadFound) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: 'Prospecto no encontrado',
        });
      }
      console.log(leadFound);

      if (leadFound.projectDetails?.lotID) {
        await this.lotService.releaseLot(leadFound.projectDetails.lotID);
      }
      await this.notificationService.sendNotificationToInvolved(
        {
          title: 'Prospecto eliminado',
          message: `El prospecto ${leadFound.name} ha sido eliminado`,
        },
        leadFound,
      );

      await this.notificationService.deleteAllNotificationByLeadId(id);
      this.socketGateway.leadUpdated();

      // If the lead has a lotID, we release the lot
      if (leadFound.projectDetails?.lotID)
        await this.lotService.releaseLot(leadFound.projectDetails.lotID);

      return await this.leadModel.findOneAndDelete({ _id: id });
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async deleteComment(id: string, commentID: string): Promise<Lead> {
    try {
      const leadFound = await this.leadExists(id);
      const commentFound = leadFound.comments.find(comment => comment._id.toString() === commentID);
      if (!commentFound) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: 'Comentario no encontrado',
        });
      }

      leadFound.comments = leadFound.comments.filter(comment => comment._id.toString() !== commentID);

      this.socketGateway.leadUpdated();
      await this.notificationService.sendNotificationToInvolved({
        title: 'Comentario eliminado',
        message: `Se ha eliminado un comentario del prospecto ${leadFound.name}`,
        leadID: leadFound._id,
      }, leadFound);

      return await leadFound.save();
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async deleteDocument(id: string, document: string) {
    try {
      const leadFound = await this.leadExists(id);
      leadFound.documents = leadFound.documents.filter(doc => doc !== document);
      this.socketGateway.leadUpdated();
      return await leadFound.save();

    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async updateLeadProjectDetails(id: string, projectDetails: any): Promise<Lead> {
    try {
      const leadFound = await this.leadExists(id);
      const userFound = await this.userService.userExists(this.request.idUser);


      leadFound.projectDetails = {
        lotID: projectDetails.data.lotID,
        projectID: projectDetails.data.projectID,
      };

      leadFound.timeline.push({
        _id: uuid(),
        updatedBy: userFound.name,
        status: leadFound.status,
        title: `Prospecto actualizado`,
        message: 'Se ha actualizado la información del proyecto',
        date: new Date(),
      });

      this.socketGateway.leadUpdated();
      console.log(leadFound);
      return await leadFound.save();
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  // Check if a lead exists by ID if not throw an error
  async leadExists(
    id: string,
  ): Promise<Document<unknown, any, Lead> & Lead & Required<{ _id: string }>> {
    try {
      const leadFound = await this.leadModel.findById(id);
      if (!leadFound) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: 'Prospecto no encontrado',
        });
      }
      return leadFound;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  // send a notification to the advisor if the lead is not contacted in two days
  async sendNotificationToAdvisorIfLeadIsNotContactedInTwoDays(): Promise<void> {
    try {
      const leads = await this.leadModel.find({
        status: LeadStatustype.TO_CALL,
      });

      const today = new Date();
      const twoDays = 1 * 24 * 60 * 60 * 1000;

      leads.forEach(async (lead) => {
        const lastUpdate = lead.timeline[lead.timeline.length - 1].date;
        const diff = today.getTime() - lastUpdate.getTime();

        if (diff > twoDays) {
          await this.notificationService.sendNotification({
            title: 'Prospecto no contactado',
            message: `El prospecto ${lead.name} no ha sido contactado, en un plazo de 1 dia será asignado a otro asesor`,
            userID: lead.advisorID,
            leadID: lead._id,
          });

          await this.notificationService.sendNotificationToAdmin({
            title: 'Prospecto no contactado',
            message: `El prospecto ${lead.name} no ha sido contactado, en un plazo de 1 dia será asignado a otro asesor`,
            leadID: lead._id,
          });
        }
      });
      Promise.all(leads);
      this.socketGateway.leadUpdated();
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async sendNotificationToAdvisorToCallLead(): Promise<void> {
    try {
      const leads = await this.leadModel.find({
        status: LeadStatustype.PENDING_CALL,
      });

      const today = new Date();
      leads.forEach(async (lead) => {
        const dateToCall = lead.dateToCall;
        const diff = 1;

        if (diff > 0) {
          await this.notificationService.sendNotification({
            title: 'Prospecto no contactado',
            message: `El prospecto ${lead.name} no ha sido contactado, recuerda llamarlo`,
            userID: lead.advisorID,
            leadID: lead._id,
          });

          await this.notificationService.sendNotificationToAdmin({
            title: 'Prospecto no contactado',
            message: `El prospecto ${lead.name} no ha sido contactado, el asesor no lo ha contactado`,
            leadID: lead._id,
          });
        }
      });
      this.socketGateway.leadUpdated();
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }


  async getLeadsWithoutLot() {
    try {
      const leads = await this.leadModel.find({ 'projectDetails.lotID': null }).select('name');
      return leads;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async sendNotificationBasedSettings(): Promise<void> {
    try {
      // Encuentra leads cuyo estado sea precalificado por banco o buró
      const leads = await this.leadModel.find({});
      const maxDaysBank = await this.settingsService.getBankPrequalificationDays(); // Días máximos para precalificación bancaria
      const maxDaysBureau = await this.settingsService.getBureauPrequalificationDays(); // Días máximos para precalificación del buró

      const today = new Date();

      // Procesamiento de cada lead y manejo de notificaciones
      const notificationPromises = leads.map(async (lead) => {
        const lastStatusUpdate = lead.lastStatusUpdate;
        if (lastStatusUpdate) {
          const diff = today.getTime() - lastStatusUpdate.getTime();
          const daysDiff = diff / (1000 * 60 * 60 * 24); // Conversión de milisegundos a días

          if (lead.status.type === LeadStatustype.TO_BANK_PREQUALIFIED.type) {
            if (daysDiff >= maxDaysBank - 1 && daysDiff < maxDaysBank && maxDaysBank > 0) {
              // Enviar notificación un día antes de que venza el período de precalificación bancaria
              await this.notificationService.sendNotification({
                title: 'Prospecto no precalificado',
                message: `El prospecto ${lead.name} no ha sido precalificado por el banco, en un día será asignado a otro banco`,
                userID: lead.bankManagerID,
                leadID: lead._id,
              });

              await this.notificationService.sendNotificationToAdmin({
                title: 'Prospecto no precalificado',
                message: `El prospecto ${lead.name} no ha sido precalificado por el banco, en un día será asignado a otro banco`,
                leadID: lead._id,
              });
            }
            if (daysDiff >= maxDaysBank && maxDaysBank > 0) {
              // Actualizar el estado si el período de precalificación bancaria ha vencido
              lead.status = LeadStatustype.TO_BUREAU_PREQUALIFIED;
              lead.lastStatusUpdate = new Date();
              lead.bankID = null;
              lead.financingProgram = '';
              lead.timeline.push({
                _id: uuid(),
                updatedBy: 'Sistema',
                status: lead.status,
                title: 'Prospecto actualizado',
                message: 'El prospecto no ha sido precalificado por el banco en el tiempo establecido',
                date: new Date(),
              });

              await this.leadModel.updateOne({ _id: lead._id }, lead);
            }
          }

          if (lead.status.type === LeadStatustype.TO_BUREAU_PREQUALIFIED.type) {
            if (daysDiff >= maxDaysBureau - 1 && daysDiff < maxDaysBureau && maxDaysBureau > 0) {
              // Enviar notificación un día antes de que venza el período de precalificación del buró
              await this.notificationService.sendNotification({
                title: 'Prospecto no precalificado',
                message: `El prospecto ${lead.name} no ha sido precalificado por el buró, en un día será asignado a otro asesor`,
                userID: lead.advisorID,
                leadID: lead._id,
              });

              await this.notificationService.sendNotificationToAdmin({
                title: 'Prospecto no precalificado',
                message: `El prospecto ${lead.name} no ha sido precalificado por el buró, en un día será asignado a otro asesor`,
                leadID: lead._id,
              });
            }

            if (daysDiff >= maxDaysBureau && maxDaysBureau > 0) {
              // Actualizar el estado si el período de precalificación del buró ha vencido
              const lastAdvisor = await this.userService.getLastAdvisor();
              lead.status = LeadStatustype.TO_CALL;
              lead.advisorID = lastAdvisor._id;
              lead.lastStatusUpdate = new Date();
              lead.bankID = null;
              lead.financingProgram = '';
              lead.timeline.push({
                _id: uuid(),
                updatedBy: 'Sistema',
                status: lead.status,
                title: 'Prospecto actualizado',
                message: 'El prospecto no ha sido precalificado por el buró en el tiempo establecido',
                date: new Date(),
              });
              await this.leadModel.updateOne({ _id: lead._id }, lead);
            }
          }
        }
      });

      // Esperar a que todas las promesas se resuelvan
      await Promise.all(notificationPromises);

    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }
  async getCurrentGoalsAndStatusByUserID(userId: string) {
    try {
      const user = await this.userService.getUserById(userId);
      const currentGoals = await this.settingsService.getCurrentGoals();
      let payload = {
        generalGoals: null,
        generalGoalsStatus: 0,
        individualGoals: null,
        individualGoalsStatus: 0
      };
      const leadsCreatedAndAssignedByUser = await this.getLeadsByUserID(userId);
      const allLeads = await this.getAllLeads();

      let filterLeadInsideGeneralGoals;
      if (currentGoals.generalGoals) {
        filterLeadInsideGeneralGoals = allLeads.filter(lead => lead.createdAt >= currentGoals.generalGoals.startDate && lead.createdAt <= currentGoals.generalGoals.endDate);
        payload = {
          ...payload,
          generalGoals: currentGoals.generalGoals,
          generalGoalsStatus: filterLeadInsideGeneralGoals.length
        }
      } else {
        payload = {
          ...payload,
          generalGoals: null,
          generalGoalsStatus: 0
        }
      }




      let filterLeadInsideIndividualGoals;
      if (currentGoals.individualGoals) {
        filterLeadInsideIndividualGoals = leadsCreatedAndAssignedByUser.filter(lead => lead.createdAt >= currentGoals.individualGoals.startDate && lead.createdAt <= currentGoals.individualGoals.endDate);
        payload = {
          ...payload,
          individualGoals: currentGoals.individualGoals,
          individualGoalsStatus: filterLeadInsideIndividualGoals.length
        }
        const type = payload.individualGoalsStatus >= currentGoals.individualGoals.target ? "add" : "remove";

      } else {
        payload = {
          ...payload,
          individualGoals: null,
          individualGoalsStatus: 0
        }




      }




      return payload;

    } catch (error) {
      throw new ErrorManager.createSignatureError(error.message);

    }
  }

  // Dashboard services

  async getDashboardData(intervalStatus: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<any> {
    try {
      const userRole = this.request.roleUser;
      const userId = this.request.idUser; // Asumo que tienes acceso al ID del usuario en el request
      // Filtro base para todos los leads (general o por asesor)
      // convert userId to objectID
      const matchFilter = userRole === 'ADVISOR' ? { advisorID: new mongoose.Types.ObjectId(userId) } : {};
      // const matchFilter = userRole === 'ADVISOR' ? { advisorID: userId.toString() } : {};

      // Total de leads
      const totalLeads = await this.leadModel.countDocuments(matchFilter);

      // Leads por status en un rango de fechas (si se especifica)
      let leadsStatusByDate;
      if (intervalStatus.startDate && intervalStatus.endDate) {
        leadsStatusByDate = await this.leadModel.aggregate([
          { $match: { ...matchFilter, timeline: { $elemMatch: { date: { $gte: new Date(intervalStatus.startDate), $lte: new Date(intervalStatus.endDate) } } } } },
          { $group: { _id: '$status.type', count: { $sum: 1 } } },
        ]);
      }

      // Leads por status (general)
      const leadsByStatus = await this.leadModel.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]);

      // Leads por edad
      const leadsByAge = await this.leadModel.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$birthdate', count: { $sum: 1 } } },
      ]);

      // Leads por país
      const leadsByCountry = await this.leadModel.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$country', count: { $sum: 1 } } },
      ]);

      // Leads por ciudad
      const leadsByCity = await this.leadModel.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$department', count: { $sum: 1 } } },
      ]);

      const leadsByMunicipality = await this.leadModel.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$municipality', count: { $sum: 1 } } },
      ]);

      // Leads por asesor (solo si no es ADVISOR)
      const leadsByAdvisor = userRole !== 'ADVISOR' ? await this.leadModel.aggregate([
        { $group: { _id: '$advisorID', count: { $sum: 1 } } },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'advisor' } },
        { $unwind: '$advisor' },
        { $project: { advisor: '$advisor.name', count: 1 } },
      ]) : [];

      // Leads por canal
      const leadsByChannel = await this.leadModel.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$source', count: { $sum: 1 } } },
      ]);

      // Leads pendientes de llamada
      const leadsPendingCall = await this.leadModel.countDocuments({ ...matchFilter, status: LeadStatustype.PENDING_CALL });

      // Leads por bancos
      const leadsByBanks = await this.leadModel.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$bankID', count: { $sum: 1 } } },
      ]);
      const populateBanks = await this.leadModel.populate(leadsByBanks, { path: '_id', select: 'name', model: 'Bank' });


      const currentGoals = await this.getCurrentGoalsAndStatusByUserID(userId);
      const payload = {
        totalLeads,
        leadsByBanks: populateBanks,
        leadsByStatus: leadsByStatus.map((item: any) => ({ status: item._id.type, count: item.count })),
        leadsByAge,
        leadsByCountry,
        leadsByCity,
        leadsByChannel,
        leadsPendingCall,
        leadsByAdvisor,
        leadsStatusByDate,
        currentGoals,
        leadsByMunicipality
      };





      return payload;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async exportData(format: string): Promise<Buffer> {
    try {
      const data = await this.getDashboardData({});
      switch (format) {
        case 'pdf':
          const pdf = await this.generatePdf(data);
          return pdf;
        case 'excel':
          const excel = await this.generateExcel(data);
          return excel;
        case 'csv':
          const csv = await this.generateCSV(data);
          return csv;
        default:
          throw ErrorManager.createSignatureError('Formato no válido');
      }

    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  // data example 
  /**
  {
    "totalLeads": 11,
    "leadsByBanks": [
        {
            "_id": null,
            "count": 9
        },
        {
            "_id": {
                "_id": "656236572ca62e6c26437f71",
                "name": "Banco Atlantida"
            },
            "count": 2
        }
    ],
    "leadsByStatus": [
        {
            "status": "A Contactar",
            "count": 6
        },
        {
            "status": "Por Asignar",
            "count": 3
        },
        {
            "status": "Enviado a revisión 1era Etapa",
            "count": 1
        },
        {
            "status": "Por Asignar Modelo de Casa",
            "count": 1
        }
    ],
    "leadsByAge": [
        {
            "_id": "",
            "count": 5
        },
        {
            "_id": "2000-02-25",
            "count": 1
        },
        {
            "_id": "2024-08-16",
            "count": 1
        },
        {
            "_id": "2024-07-18",
            "count": 1
        },
        {
            "_id": "1999-02-23",
            "count": 1
        },
        {
            "_id": "2024-06-11",
            "count": 1
        },
        {
            "_id": "2024-07-26",
            "count": 1
        }
    ],
    "leadsByCountry": [
        {
            "_id": "El Salvador",
            "count": 1
        },
        {
            "_id": "",
            "count": 1
        },
        {
            "_id": "Otro",
            "count": 1
        },
        {
            "_id": "Guatemala",
            "count": 4
        },
        {
            "_id": "Honduras",
            "count": 4
        }
    ],
    "leadsByCity": [
        {
            "_id": "Otro",
            "count": 1
        },
        {
            "_id": "",
            "count": 3
        },
        {
            "_id": "Quetzaltenango",
            "count": 1
        },
        {
            "_id": "La Paz",
            "count": 1
        },
        {
            "_id": "Atlántida",
            "count": 1
        },
        {
            "_id": "Comayagua",
            "count": 2
        },
        {
            "_id": "Surf city",
            "count": 1
        },
        {
            "_id": "Valle",
            "count": 1
        }
    ],
    "leadsByChannel": [
        {
            "_id": "Facebook",
            "count": 10
        },
        {
            "_id": "",
            "count": 1
        }
    ],
    "leadsPendingCall": 0,
    "leadsByAdvisor": [
        {
            "_id": "65b28c533d04a775216da580",
            "count": 5,
            "advisor": "Miguel Baires J"
        },
        {
            "_id": "65b28c7f3d04a775216da5a2",
            "count": 4,
            "advisor": "Pablo Ramirez"
        }
    ],
    "currentGoals": {
        "generalGoals": {
            "_id": "66baed30fa9879d887d5196e",
            "name": "Referidos",
            "description": "",
            "target": 30,
            "newLeads": [],
            "startDate": "2024-08-01T00:00:00.000Z",
            "endDate": "2024-08-31T00:00:00.000Z"
        },
        "generalGoalsStatus": 3,
        "individualGoals": null,
        "individualGoalsStatus": 0
    }
}
   */
async generateExcel(data: any): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const workbook = new ExcelJS.Workbook();

      // Function to add a header row
      function addHeader(worksheet: ExcelJS.Worksheet, title: string) {
        worksheet.addRow([title]);
        worksheet.getCell(`A${worksheet.lastRow.number}`).font = { bold: true };
        worksheet.addRow([]);
      }

      // Function to add a table with headers
      function addTable(
        worksheet: ExcelJS.Worksheet,
        title: string,
        headers: string[],
        rows: any[][],
      ) {
        addHeader(worksheet, title);

        // Add table headers
        const headerRow = worksheet.addRow(headers);
        headerRow.font = { bold: true };
        headerRow.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'C6EFCE' }, // Light green color for header
          };
          cell.alignment = { horizontal: 'center' };
        });

        // Adjust column widths
        worksheet.columns = headers.map(() => ({ width: 25 }));

        // Add rows to the table
        rows.forEach((row) => worksheet.addRow(row));

      }
      // Add Leads by Banks Table
      if (data.leadsByBanks && data.leadsByBanks.length > 0) {
        const banksSheet = workbook.addWorksheet('Leads por Banco');
        addTable(banksSheet, 'Leads por Banco', ['Banco', 'Cantidad'], 
          data.leadsByBanks.map((lead: any) => [
            lead._id ? lead._id.name : 'No Especificado',
            lead.count,
          ])
        );
      }

      // Add Leads by Status Table
      if (data.leadsByStatus && data.leadsByStatus.length > 0) {
        const statusSheet = workbook.addWorksheet('Leads por Status');
        addTable(statusSheet, 'Leads por Status', ['Status', 'Cantidad'], 
          data.leadsByStatus.map((lead: any) => [
            lead.status,
            lead.count,
          ])
        );
      }

      // Add Leads by Age Table
      if (data.leadsByAge && data.leadsByAge.length > 0) {
        const ageGroupedByAge = data.leadsByAge.reduce((acc: any, lead: any) => {
          const date = lead._id ? lead._id : 'No Especificado';
          const age = new Date().getFullYear() - new Date(date).getFullYear();
          const ageGroup = this.getAgeGroup(age);
          if (!acc[ageGroup]) acc[ageGroup] = 0;
          acc[ageGroup] += lead.count;
          return acc;
        }, {});

        const ageSheet = workbook.addWorksheet('Leads por Edad');
        addTable(ageSheet, 'Leads por Edad', ['Fecha de Nacimiento', 'Cantidad'],
          Object.entries(ageGroupedByAge).map(([age, count]: any) => [age, count])
        );
      }

      // Add Leads by Country Table
      if (data.leadsByCountry && data.leadsByCountry.length > 0) {
        const countrySheet = workbook.addWorksheet('Leads por País');
        addTable(countrySheet, 'Leads por País', ['País', 'Cantidad'],
          data.leadsByCountry.map((lead: any) => [
            lead._id ? lead._id : 'No Especificado',
            lead.count,
          ])
        );
      }

      // Add Leads by City Table
      if (data.leadsByCity && data.leadsByCity.length > 0) {
        const citySheet = workbook.addWorksheet('Leads por Ciudad');
        addTable(citySheet, 'Leads por Ciudad', ['Ciudad', 'Cantidad'],
          data.leadsByCity.map((lead: any) => [
            lead._id ? lead._id : 'No Especificado',
            lead.count,
          ])
        );
      }

      // Add Leads by Channel Table
      if (data.leadsByChannel && data.leadsByChannel.length > 0) {
        const channelSheet = workbook.addWorksheet('Leads por Canal');
        addTable(channelSheet, 'Leads por Canal', ['Canal', 'Cantidad'],
          data.leadsByChannel.map((lead: any) => [
            lead._id ? lead._id : 'No Especificado',
            lead.count,
          ])
        );
      }

      // Add Leads by Advisor Table
      if (data.leadsByAdvisor && data.leadsByAdvisor.length > 0) {
        const advisorSheet = workbook.addWorksheet('Leads por Asesor');
        addTable(advisorSheet, 'Leads por Asesor', ['Asesor', 'Cantidad'],
          data.leadsByAdvisor.map((lead: any) => [
            lead.advisor,
            lead.count,
          ])
        );
      }

      // Write to buffer
      const buffer = await workbook.xlsx.writeBuffer();
      const bufferData = Buffer.from(buffer);
      resolve(bufferData);
    } catch (error) {
      reject(error);
    }
  });
}

async generatePdf(data: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
    });

    const buffers: any[] = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });
   

    function addFooter(doc: any) {
      doc.fontSize(10)
        .text('Página ' + (doc.page.pageNumber), 50, 750, { align: 'center' });

      doc.text("", 50, 115)
    }


    // Function to add header
    function addHeader(doc: any) {
      doc.image('src/assets/logo.png', 50, 45, { width: 50 })
        .fillColor('#444444')
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('Reporte de Prospectos', 130, 57).moveDown()
        .fontSize(10)
        .font('Helvetica')
        .text('Reporte generado por el sistema CRM de Sig-Urban', 130, 85)
        // format the date dd/mm/yyyy
        .text('Fecha de generación: ' + new Date().toLocaleDateString("es-ES", { year: 'numeric', month: '2-digit', day: '2-digit' }), 130, 100)
        .text("", 50, 115)
    }

    // Function to add footer with page number
    function checkIfBreakPage(doc: any) {
      if (doc.y > doc.page.height - 250) { // Adjust if necessary
       addNewPage(doc);
      }
    }

    // Function to add a new page and header
    function addNewPage(doc: any) {
      doc.addPage();
      addHeader(doc);
    }

    let currentPage = 1;

    // Function to check space and add content
    function checkSpaceAndAddContent(doc: any, content: Function) {
      if (doc.y > doc.page.height - 250) { // Adjust if necessary
        addNewPage(doc);
        currentPage++;
      }
      content();
    }

    // Add header for the first page
    addHeader(doc);

    // Add content
    checkSpaceAndAddContent(doc, () => {
      if (data.totalLeads) {
        doc.fontSize(12)
        .font('Helvetica-Bold')
        .text('Informe General', 50, 140)
        .font('Helvetica')
      }
    });
    // Leads by Banks Table
    if (data.leadsByBanks && data.leadsByBanks.length > 0) {
      checkSpaceAndAddContent(doc, () => {
        const leadsByBanksTable = {
          headers: ['Banco', 'Cantidad'],
          rows: data.leadsByBanks.map((lead: any) => {
            // checkIfBreakPage(doc);
            return [
              lead._id ? lead._id.name : 'No Especificado',
              lead.count,
            ];
          }),
        };

        doc.fontSize(12).moveDown(3);
        doc.font('Helvetica-Bold').text('Leads por Banco');
        doc.font('Helvetica').fontSize(10).text('Se muestra la cantidad de leads por cada banco');
        doc.moveDown().table(leadsByBanksTable, { columnsSize: [300, 200] });
      });
    }

    // Leads by Status Table
    if (data.leadsByStatus && data.leadsByStatus.length > 0) {
      checkSpaceAndAddContent(doc, () => {
        const leadsByStatusTable = {
          headers: ['Status', 'Cantidad'],
          rows: data.leadsByStatus.map((lead: any) =>{
            // checkIfBreakPage(doc);
            return [
              lead.status,
              lead.count,
            ];
          }),
        };

        doc.fontSize(12).moveDown(3);
        doc.font('Helvetica-Bold').text('Leads por Status');
        doc.font('Helvetica').fontSize(10).text('Se muestra la cantidad de leads por cada estado');
        doc.moveDown().table(leadsByStatusTable, { columnsSize: [300, 200], prepareHeader: () => doc.font('Helvetica-Bold') });
      });
    }


    // Leads by Age Table
    if (data.leadsByAge && data.leadsByAge.length > 0) {
      checkSpaceAndAddContent(doc, () => {
        const leadsAgroupedByAge = data.leadsByAge.reduce((acc: any, lead: any) => {
          const date = lead._id ? lead._id : 'No Especificado';
          const age = new Date().getFullYear() - new Date(date).getFullYear();
          const ageGroup = this.getAgeGroup(age);
          if (!acc[ageGroup]) acc[ageGroup] = 0;
          acc[ageGroup] += lead.count;
          return acc;
        }, {});

        const leadsByAgeTable = {
          headers: ['Fecha de Nacimiento', 'Cantidad'],
          rows: Object.entries(leadsAgroupedByAge).map(([age, count]: any) => {
            // checkIfBreakPage(doc);
            return [
              age,
              count,
            ];
          }),
        };

        doc.fontSize(12).moveDown(3);
        doc.font('Helvetica-Bold').text('Leads por Edad');
        doc.font('Helvetica').fontSize(10).text('Se muestra la cantidad de leads por rango de edad');
        doc.moveDown().table(leadsByAgeTable, { columnsSize: [300, 200], prepareHeader: () => doc.font('Helvetica-Bold') });
      });
    }

    // Leads by Country Table
    if (data.leadsByCountry && data.leadsByCountry.length > 0) {
      checkSpaceAndAddContent(doc, () => {
        const leadsByCountryTable = {
          headers: ['País', 'Cantidad'],
          rows: data.leadsByCountry.map((lead: any) => {
            // checkIfBreakPage(doc);
            return [
              lead._id ? lead._id : 'No Especificado',
              lead.count,
            ];
          }),
        };

        doc.fontSize(12).moveDown(3);
        doc.font('Helvetica-Bold').text('Leads por País');
        doc.font('Helvetica').fontSize(10).text('Se muestra la cantidad de leads por país');
        doc.moveDown().table(leadsByCountryTable, { columnsSize: [300, 200], prepareHeader: () => doc.font('Helvetica-Bold') });
      });
    }

    // Leads by City Table
    if (data.leadsByCity && data.leadsByCity.length > 0) {
      checkSpaceAndAddContent(doc, () => {
        const leadsByCityTable = {
          headers: ['Ciudad', 'Cantidad'],
          rows: data.leadsByCity.map((lead: any) => {
            // checkIfBreakPage(doc);
            return [
              lead._id ? lead._id : 'No Especificado',
              lead.count,
            ];
          }),
        };

        doc.fontSize(12).moveDown(3);
        doc.font('Helvetica-Bold').text('Leads por Ciudad');
        doc.font('Helvetica').fontSize(10).text('Se muestra la cantidad de leads por ciudad');
        doc.moveDown().table(leadsByCityTable, { columnsSize: [300, 200], prepareHeader: () => doc.font('Helvetica-Bold') });
      });
    }

    // Leads by Channel Table
    if (data.leadsByChannel && data.leadsByChannel.length > 0) {
      checkSpaceAndAddContent(doc, () => {
        const leadsByChannelTable = {
          headers: ['Canal', 'Cantidad'],
          rows: data.leadsByChannel.map((lead: any) => {
            // checkIfBreakPage(doc);
            return [
              lead._id ? lead._id : 'No Especificado',
              lead.count,
            ];
          }),
        };

        doc.fontSize(12).moveDown(3);
        doc.font('Helvetica-Bold').text('Leads por Canal');
        doc.font('Helvetica').fontSize(10).text('Se muestra la cantidad de leads por canal');
        doc.moveDown().table(leadsByChannelTable, { columnsSize: [300, 200], prepareHeader: () => doc.font('Helvetica-Bold') });
      });
    }
    // check if is new page
  

    // Leads by Advisor Table
    if (data.leadsByAdvisor && data.leadsByAdvisor.length > 0) {
      checkSpaceAndAddContent(doc, () => {
        const leadsByAdvisorTable = {
          headers: ['Asesor', 'Cantidad'],
          rows: data.leadsByAdvisor.map((lead: any) => {
            // checkIfBreakPage(doc);
            return [
              lead.advisor,
              lead.count,
            ];
          }),
        };

        doc.fontSize(12).moveDown(3);
        doc.font('Helvetica-Bold').text('Leads por Asesor');
        doc.font('Helvetica').fontSize(10).text('Se muestra la cantidad de leads por asesor');
        doc.moveDown().table(leadsByAdvisorTable, { columnsSize: [300, 200], prepareHeader: () => doc.font('Helvetica-Bold') });
      });
    }
    
    // Finish the document
    doc.end();
  });
}
  getAgeGroup(ageNumber: number): string {

    if (!ageNumber && ageNumber !== 0) return 'No Especificado';
    if (ageNumber < 18) return '<18';
    if (ageNumber >= 18 && ageNumber <= 25) return '18-25';
    if (ageNumber >= 26 && ageNumber <= 35) return '26-35';
    if (ageNumber >= 36 && ageNumber <= 45) return '36-45';
    if (ageNumber >= 46 && ageNumber <= 55) return '46-55';
    if (ageNumber >= 56 && ageNumber <= 65) return '56-65';
    return '>65';
  }
  
  async generateCSV(data: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        let csvContent = '';
  
        // Function to add a table to the CSV content
        function addTable(title: string, headers: string[], rows: any[][], total: number) {
          // Add title
          csvContent += `${title}\n`;
  
          // Add headers
          csvContent += headers.join(',') + '\n';
  
          // Add rows
          rows.forEach(row => {
            csvContent += row.join(',') + '\n';
          });
  
          // Add total row
          csvContent += `Total:,${total}\n\n`;
        }
  
        // Leads by Banks Table
        if (data.leadsByBanks && data.leadsByBanks.length > 0) {
          const totalLeadsByBanks = data.leadsByBanks.reduce((acc: number, lead: any) => acc + lead.count, 0);
          addTable(
            'Leads por Banco',
            ['Banco', 'Cantidad'],
            data.leadsByBanks.map((lead: any) => [lead._id ? lead._id.name : 'No Especificado', lead.count]),
            totalLeadsByBanks
          );
        }
  
        // Leads by Status Table
        if (data.leadsByStatus && data.leadsByStatus.length > 0) {
          const totalLeadsByStatus = data.leadsByStatus.reduce((acc: number, lead: any) => acc + lead.count, 0);
          addTable(
            'Leads por Status',
            ['Status', 'Cantidad'],
            data.leadsByStatus.map((lead: any) => [lead.status, lead.count]),
            totalLeadsByStatus
          );
        }
  
        // Leads by Age Table
        if (data.leadsByAge && data.leadsByAge.length > 0) {
          const leadsGroupedByAge = data.leadsByAge.reduce((acc: any, lead: any) => {
            const date = lead._id ? lead._id : 'No Especificado';
            const age = new Date().getFullYear() - new Date(date).getFullYear();
            const ageGroup = this.getAgeGroup(age);
            if (!acc[ageGroup]) acc[ageGroup] = 0;
            acc[ageGroup] += lead.count;
            return acc;
          }, {});
  
          const totalLeadsByAge = Object.values(leadsGroupedByAge).reduce((acc: number, count: any) => acc + count, 0);
          addTable(
            'Leads por Edad',
            ['Grupo de Edad', 'Cantidad'],
            Object.entries(leadsGroupedByAge).map(([age, count]: any) => [age, count]),
            totalLeadsByAge as number
          );
        }
  
        // Leads by Country Table
        if (data.leadsByCountry && data.leadsByCountry.length > 0) {
          const totalLeadsByCountry = data.leadsByCountry.reduce((acc: number, lead: any) => acc + lead.count, 0);
          addTable(
            'Leads por País',
            ['País', 'Cantidad'],
            data.leadsByCountry.map((lead: any) => [lead._id ? lead._id : 'No Especificado', lead.count]),
            totalLeadsByCountry
          );
        }
  
        // Leads by City Table
        if (data.leadsByCity && data.leadsByCity.length > 0) {
          const totalLeadsByCity = data.leadsByCity.reduce((acc: number, lead: any) => acc + lead.count, 0);
          addTable(
            'Leads por Ciudad',
            ['Ciudad', 'Cantidad'],
            data.leadsByCity.map((lead: any) => [lead._id ? lead._id : 'No Especificado', lead.count]),
            totalLeadsByCity
          );
        }
  
        // Convert CSV content to Buffer and resolve
        const buffer = Buffer.from(csvContent, 'utf-8');
        resolve(buffer);
      } catch (error) {
        reject(error);
      }
    });
  }
  
}