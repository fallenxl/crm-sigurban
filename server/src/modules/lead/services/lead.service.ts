import { Inject, Injectable, Scope } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Lead } from '../schemas/lead.schemas';
import { Document, Model } from 'mongoose';
import { ErrorManager } from '../../../utils/error.manager'; // Import the ErrorManager utility
import { LeadDto, LeadStatusDTO, UpdateLeadDto } from '../dto/lead.dto';
import { UsersService } from '../../users/services/users.service';
import { LeadStatus, LeadStatusEnum, LeadStatustype } from '../interfaces';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { v4 as uuid } from 'uuid'; // Import the uuid library for generating unique IDs
import { POPULATES_LEAD, Roles } from '../../../constants';
import { CampaignService } from 'src/modules/campaign/services/campaign.service';
import { NotificationService } from 'src/modules/notification/services/notification.service';
import { BankService } from 'src/modules/bank/services';
import { LotsService } from 'src/modules/lots/services/lots.service';
import { SocketGateway } from 'src/modules/socket/gateways/socket.gateway';

@Injectable({ scope: Scope.REQUEST })
export class LeadService {
  constructor(
    @InjectModel(Lead.name) private readonly leadModel: Model<Lead>,
    @Inject(REQUEST) private readonly request: Request,
    private readonly userService: UsersService,
    private readonly campaignService: CampaignService,
    private readonly notificationService: NotificationService,
    private readonly bankService: BankService,
    private readonly lotService: LotsService,
    private readonly socketGateway: SocketGateway,
  ) {}

  /*
   *  Principal operations
   */

  // Create a new lead
  async create(lead: LeadDto): Promise<Lead> {
    try {
      const leadFound = await this.getLeadByDni(lead.dni);
      if (leadFound) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'Ya existe un prospecto con ese DNI',
        });
      }

      const campaignFound = await this.campaignService.getCampaignById(
        lead.campaignID,
      );

      if (!campaignFound) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'La campaña no existe',
        });
      }

      lead.status = LeadStatustype.TO_ASSIGN;

      // If the lead has an advisorID, we check if the user exists and if it is an advisor
      if (lead.advisorID) {
        const userFound = await this.userService.userExists(lead.advisorID);
        await this.userService.userIsByRole(userFound, Roles.ADVISOR);
        await this.userService.setLastAdvisor(userFound._id);
        lead.status = LeadStatustype.TO_CALL;
      }

      const userFound = await this.userService.userExists(this.request.idUser);
      lead.avatar =
        lead.avatar ||
        `https://api.dicebear.com/5.x/initials/svg?seed=${
          lead.name.split(' ')[0]
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
      const createdLead = await new this.leadModel(lead).save();

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
            message: `Se ha registrado un nuevo lead con el nombre ${createdLead.name}, asignalo a un asesor lo antes posible`,
            leadID: createdLead._id,
          },
          [Roles.RECEPTIONIST, Roles.ADMIN],
        );
      }

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
      const { roleUser } = this.request;

      const leadFound = await this.leadExists(id);

      this.checkPermission(roleUser, leadFound, this.request.idUser);

      return await leadFound.populate(POPULATES_LEAD);
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

  async getLeadsWithouAdvisor(): Promise<Lead[]> {
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


  async getLeadStatus(id: string): Promise<LeadStatus> {
    try {
      const leadFound = await this.leadExists(id);
      return leadFound.status;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  // Update only information of a lead
  async updateLeadById(id: string, lead: UpdateLeadDto): Promise<Lead> {
    try {
      const { idUser, roleUser } = this.request;
      const leadFound = await this.leadExists(id);

      this.checkPermission(roleUser, leadFound, idUser);
      if (lead.dni && lead.dni !== leadFound.dni) {
        const dniExists = await this.getLeadByDni(lead.dni);
        if (dniExists) {
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message: 'El DNI ya existe',
          });
        }
      }
      
      const userFound = await this.userService.userExists(this.request.idUser);
      lead.timeline = [...leadFound.timeline, {
        _id: uuid(),
        updatedBy: userFound.name,
        status: leadFound.status,
        title: `Prospecto actualizado`,
        message: 'La información del prospecto ha sido actualizada',
        date: new Date(),
      }]
      
      const leadUpdated = await this.leadModel.findByIdAndUpdate(id, lead);

      this.socketGateway.leadUpdated();

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
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  // Update the status of a lead
  async updateLeadStatus(id: string, leadStatus: LeadStatusDTO): Promise<Lead> {
    try {
      const leadFound = await this.leadExists(id);

      this.checkPermissionToUpdateLeadStatus(leadFound.status);

      if (leadStatus.status === leadFound.status.selected) {
        return;
      }

      switch (leadFound.status.type) {
        case LeadStatusEnum.PENDING_CALL:
          await this.handlePendingCallStatus(leadFound, leadStatus);
          break;
        case LeadStatusEnum.FUTURE_SALES_OPPORTUNITY:
          await this.handlePotentialToCallStatus(leadFound, leadStatus);
          break;
        case LeadStatusEnum.TO_ASSIGN:
          await this.handleToAssignStatus(leadFound, leadStatus);
          break;
        case LeadStatusEnum.PROSPECT:
          if (leadStatus.status === LeadStatusEnum.TO_CALL) {
            await this.handlePotentialToCallStatus(leadFound, leadStatus);
          }
          break;
        case LeadStatusEnum.TO_ASSIGN:
          if (leadStatus.status === LeadStatusEnum.TO_CALL) {
            await this.handlePotentialToCallStatus(leadFound, leadStatus);
          }
          break;
        case LeadStatusEnum.TO_CALL:
          await this.handleToCallStatus(leadFound, leadStatus);
          break;
        case LeadStatusEnum.TO_BUREAU_PREQUALIFIED:
          await this.handleBureauPrequalifiedStatus(leadFound, leadStatus);
          break;
        case LeadStatusEnum.TO_BANK_PREQUALIFIED:
          await this.handleBankPrequalifiedStatus(leadFound, leadStatus);
          break;
        case LeadStatusEnum.TO_ASSIGN_PROJECT:
          await this.handleToAssignProjectStatus(leadFound, leadStatus);
          break;
        case LeadStatusEnum.TO_ASSIGN_HOUSE:
          await this.handleToAssignHouseStatus(leadFound, leadStatus);
          break;
        case LeadStatusEnum.PROSPECT_DEFINED:
          await this.handleProspectDefinedStatus(leadFound, leadStatus);
          break;
        default:
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message: 'Estado de lead no válido',
          });
      }

      await this.notificationService.sendNotificationToAdmin({
        title: 'Prospecto actualizado',
        message: `El prospecto ${leadFound.name} ha sido actualizado`,
        leadID: leadFound._id,
      });

      const userFound = await this.userService.userExists(this.request.idUser);
      // Create a new timeline for the lead
      leadFound.timeline.push({
        _id: uuid(),
        updatedBy: userFound.name,
        status: leadFound.status,
        title: `Prospecto actualizado a ${leadFound.status.type}`,
        message: leadStatus.comment,
        date: new Date(),
      });

      this.socketGateway.leadUpdated();


      return (await leadFound.save()).populate(POPULATES_LEAD);
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  // Update the advisor of a lead
  async updateLeadAdvisor(id: string, advisorID: string): Promise<Lead> {
    try {
      const leadFound = await this.leadExists(id);
      const userFound = await this.userService.userExists(advisorID);
      await this.userService.userIsByRole(userFound, Roles.ADVISOR);

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
          updatedBy: this.request.idUser,
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
          updatedBy: this.request.idUser,
          status: leadFound.status,
          title: `Prospecto actualizado`,
          message: 'Prospecto se le ha quitado un asesor',
          date: new Date(),
        });
      }

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

      return (await leadFound.save()).populate(POPULATES_LEAD);
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async handlePendingCallStatus(leadFound: Lead, leadStatus: LeadStatusDTO) {
    if (leadStatus.status === LeadStatusEnum.CONTACTED) {
      leadFound.status = LeadStatustype.FUTURE_SALES_OPPORTUNITY;
   
      leadFound.dateToCall = null;

      await this.notificationService.sendNotification({
        title: 'Prospecto contactado',
        message: `El prospecto ${
          leadFound.name
        } ha sido contactado, y se agrego a oportunidad de venta futura y ha sido liberado. ${
          leadStatus.comment && `obs: ${leadStatus.comment}`
        }`,
        userID: leadFound.advisorID,
        leadID: leadFound._id,
      });
      leadFound.advisorID = null;

      await this.notificationService.sendNotificationToAdmin({
        title: 'Prospecto contactado',
        message: `El prospecto ${
          leadFound.name
        } ha sido contactado, y se agrego a oportunidad de venta futura, y ha sido liberado. ${
          leadStatus.comment && `obs: ${leadStatus.comment}`
        }`,
        leadID: leadFound._id,
      });
    }
  }

  async handleToAssignStatus(leadFound: Lead, leadStatus: LeadStatusDTO) {
    if (leadStatus.status === LeadStatusEnum.TO_CALL) {
      if (!leadStatus.advisorID) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'Debes asignar un asesor al prospecto',
        });
      }

      const userFound = await this.userService.userExists(leadStatus.advisorID);
      await this.userService.userIsByRole(userFound, Roles.ADVISOR);

      leadFound.advisorID = leadStatus.advisorID;
      leadFound.status = LeadStatustype.TO_CALL;

      await this.notificationService.sendNotification({
        title: 'Nuevo prospecto asignado',
        message: `Se te ha asignado un nuevo prospecto con el nombre ${leadFound.name}`,
        userID: leadFound.advisorID,
        leadID: leadFound._id,
      });

      await this.notificationService.sendNotificationToAdmin({
        title: 'Prospecto actualizado',
        message: `El prospecto ${leadFound.name} ha sido actualizado`,
        leadID: leadFound._id,
      });
    }
  }

  async handlePotentialToCallStatus(
    leadFound: Lead,
    leadStatus: LeadStatusDTO,
  ) {
    if (leadStatus.status === LeadStatusEnum.TO_CALL) {
      if (!leadStatus.advisorID && !leadFound.advisorID) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'Debes asignar un asesor al prospecto',
        });
      }
      if (leadStatus.advisorID) {
        const userFound = await this.userService.userExists(
          leadStatus.advisorID,
        );
        await this.userService.userIsByRole(userFound, Roles.ADVISOR);

        leadFound.advisorID = leadStatus.advisorID;
      }

      leadFound.status = LeadStatustype.TO_CALL;

      await this.notificationService.sendNotification({
        title: 'Nuevo prospecto asignado',
        message: `Se te ha asignado un nuevo prospecto con el nombre ${
          leadFound.name
        },
         contactalo lo antes posible ${
           leadStatus.comment && `obs: ${leadStatus.comment}`
         }`,
        userID: leadFound.advisorID || leadStatus.advisorID,
        leadID: leadFound._id,
      });

      await this.notificationService.sendNotificationToAdmin({
        title: 'Prospecto actualizado',
        message: `El prospecto ${leadFound.name} ha sido actualizado`,
        leadID: leadFound._id,
      });
    }
  }

  // Handle the status of a lead from TO_CALL to PREQUALIFIED
  async handleToCallStatus(leadFound: Lead, leadStatus: LeadStatusDTO) {
    if (leadStatus.status === LeadStatusEnum.CONTACTED) {
      if (!leadStatus.managerID) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'Debes asignar un gerente al prospecto',
        });
      }

      await this.userService.userExists(leadStatus.managerID);

      leadFound.managerID = leadStatus.managerID;
      leadFound.status = LeadStatustype.TO_BUREAU_PREQUALIFIED;

      await this.notificationService.sendNotification({
        title: 'Prospecto contactado',
        message: `El prospecto ${leadFound.name} ha sido contactado ${
          leadStatus.comment && `obs: ${leadStatus.comment}`
        }`,
        userID: leadFound.advisorID,
        leadID: leadFound._id,
      });

      await this.notificationService.sendNotification({
        title: 'Prospecto contactado',
        message: `El prospecto ${leadFound.name} ha sido contactado ${
          leadStatus.comment && `obs: ${leadStatus.comment}`
        }, precalificalo lo antes posible`,
        userID: leadFound.managerID,
        leadID: leadFound._id,
      });

      await this.notificationService.sendNotificationToAdmin({
        title: 'Prospecto contactado',
        message: `El prospecto ${leadFound.name} ha sido contactado ${
          leadStatus.comment && `obs: ${leadStatus.comment}`
        }`,
        leadID: leadFound._id,
      });
    } else if (leadStatus.status === LeadStatusEnum.NOT_CONTACTED) {
      if (!leadStatus.dateToCall) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'Debes asignar una fecha para llamar al prospecto',
        });
      }

      leadFound.dateToCall = leadStatus.dateToCall;

      leadFound.status = LeadStatustype.PENDING_CALL;
      await this.notificationService.sendNotificationToInvolved(
        {
          title: 'Prospecto no contactado',
          message: `El prospecto ${leadFound.name} no ha sido contactado ${
            leadStatus.comment && `obs: ${leadStatus.comment}`
          }`,
          leadID: leadFound._id,
        },
        leadFound,
      );
    } else if (leadStatus.status === LeadStatusEnum.DO_NOT_ANSWER) {
      if (!leadStatus.dateToCall) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'Debes asignar una fecha para llamar al prospecto',
        });
      }
      leadFound.dateToCall = leadStatus.dateToCall;
      leadFound.status = LeadStatustype.PENDING_CALL;

      await this.notificationService.sendNotificationToInvolved(
        {
          title: 'Prospecto no contestO',
          message: `El prospecto ${leadFound.name} no contesto ${
            leadStatus.comment && `obs: ${leadStatus.comment}`
          }`,
          leadID: leadFound._id,
        },
        leadFound,
      );
    }
  }

  // handle the status of a lead from BUREAU_PREQUALIFIED
  async handleBureauPrequalifiedStatus(
    leadFound: Lead,
    leadStatus: LeadStatusDTO,
  ) {
    try {
      if (leadStatus.status === LeadStatusEnum.BUREAU_PREQUALIFIED) {
        if (!leadStatus.bankManagerID && !leadFound.bankManagerID) {
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message: 'Debes asignar un gerente de banco al prospecto',
          });
        }
        await this.userService.userExists(leadStatus.bankManagerID);

        if (!leadStatus.bankID) {
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message: 'Debes asignar un banco al prospecto',
          });
        }

        if (!leadStatus.financingProgram) {
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message: 'Debes asignar un programa financiero al prospecto',
          });
        }

        const bankFound = await this.bankService.bankExists(leadStatus.bankID);

        leadFound.bankManagerID = leadStatus.bankManagerID;
        leadFound.bankID = leadStatus.bankID;
        leadFound.financingProgram = leadStatus.financingProgram;
        leadFound.status = LeadStatustype.TO_BANK_PREQUALIFIED;

        await this.notificationService.sendNotification({
          title: 'Prospecto precalificado',
          message: `El prospecto ${
            leadFound.name
          } ha sido precalificado y se envio a precalificacion banco ${
            leadStatus.comment && `obs: ${leadStatus.comment}`
          }`,
          userID: leadFound.advisorID,
          leadID: leadFound._id,
        });

        await this.notificationService.sendNotification({
          title: 'Prospecto precalificado',
          message: `El prospecto ${leadFound.name} ha sido precalificado ${
            leadStatus.comment && `obs: ${leadStatus.comment}`
          }, precalificalo lo antes posible\n Banco: ${
            bankFound.name
          } \n Programa: ${leadStatus.financingProgram}`,
          userID: leadFound.bankManagerID,
          leadID: leadFound._id,
        });

        await this.notificationService.sendNotificationToAdmin({
          title: 'Prospecto precalificado',
          message: `El prospecto ${
            leadFound.name
          } ha sido precalificado buro y se envio a precalificacion banco ${
            leadStatus.comment && `obs: ${leadStatus.comment}`
          }`,
          leadID: leadFound._id,
        });
      } else if (leadStatus.status === LeadStatusEnum.NOT_BUREAU_PREQUALIFIED) {
        if (!leadStatus.dateToCall) {
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message: 'Debes asignar una fecha para llamar al prospecto',
          });
        }

        leadFound.dateToCall = leadStatus.dateToCall;
        leadFound.status = LeadStatustype.PENDING_CALL;

        await this.notificationService.sendNotificationToInvolved(
          {
            title: 'Prospecto no precalificado',
            message: `El prospecto ${leadFound.name} no ha sido precalificado ${
              leadStatus.comment && `obs: ${leadStatus.comment}`
            }`,
            leadID: leadFound._id,
          },
          leadFound,
        );
      } else if (
        leadStatus.status === LeadStatusEnum.FUTURE_SALES_OPPORTUNITY
      ) {
        if (!leadStatus.dateToCall) {
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message: 'Debes asignar una fecha para llamar al prospecto',
          });
        }
        leadFound.status = LeadStatustype.PENDING_CALL;
        leadFound.dateToCall = leadStatus.dateToCall;
        await this.notificationService.sendNotificationToInvolved(
          {
            title: 'Prospecto convertido en oportunidad de venta futura',
            message: `El prospecto ${
              leadFound.name
            } ha sido convertido en oportunidad de venta ${
              leadStatus.comment && `obs: ${leadStatus.comment}`
            }`,
            leadID: leadFound._id,
          },
          leadFound,
        );
      }
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async handleBankPrequalifiedStatus(
    leadFound: Lead,
    leadStatus: LeadStatusDTO,
  ) {
    try {
      const bankManager = await this.userService.userExists(
        leadFound.bankManagerID,
      );
      const bank = await this.bankService.bankExists(leadFound.bankID);
      if (leadStatus.status === LeadStatusEnum.BANK_PREQUALIFIED) {
        leadFound.status = LeadStatustype.TO_ASSIGN_PROJECT;

        await this.notificationService.sendNotificationToInvolved(
          {
            title: 'Prospecto precalificado con banco',
            message: `${bankManager.name} te notifica que el prospecto ${
              leadFound.name
            } SI califica con el banco ${
              bank.name
            }, iniciar proceso de seleccionar proyecto. ${
              leadStatus.comment && `obs: ${leadStatus.comment}`
            }`,
            leadID: leadFound._id,
          },
          leadFound,
        );
      } else if (leadStatus.status === LeadStatusEnum.NOT_BANK_PREQUALIFIED) {
        leadFound.status = LeadStatustype.TO_BUREAU_PREQUALIFIED;
        leadFound.rejectedBanks = [
          ...leadFound.rejectedBanks,
          leadFound.bankID,
        ];
        leadFound.bankID = null;
        leadFound.financingProgram = null;

        await this.notificationService.sendNotificationToInvolved(
          {
            title: 'Prospecto no precalificado',
            message: `${bankManager.name} te notifica que el prospecto ${
              leadFound.name
            } NO califica con el banco ${bank.name} ${
              leadStatus.comment && `obs: ${leadStatus.comment}`
            }`,
            leadID: leadFound._id,
          },
          leadFound,
        );
      }
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async handleToAssignProjectStatus(
    leadFound: Lead,
    leadStatus: LeadStatusDTO,
  ) {
    try {
      if (leadStatus.status === LeadStatusEnum.ASSIGN_PROJECT) {
        if (!leadStatus.projectID) {
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message: 'Debes asignar un proyecto al prospecto',
          });
        }

        if (!leadStatus.lotID) {
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message: 'Debes asignar un lote al prospecto',
          });
        }

        const lotFound = await this.lotService.findOne(leadStatus.lotID);

        if (!lotFound) {
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message: 'El lote no existe',
          });
        }

        if (lotFound.status !== 'Disponible') {
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message: 'El lote no esta disponible',
          });
        }

        leadFound.projectDetails = {
          projectID: leadStatus.projectID,
          lotID: leadStatus.lotID,
        };

        await this.lotService.reserveLot(leadStatus.lotID, leadFound._id);
        leadFound.status = LeadStatustype.TO_ASSIGN_HOUSE;

        await this.notificationService.sendNotificationToInvolved(
          {
            title: 'Prospecto asignado a proyecto',
            message: `El prospecto ${
              leadFound.name
            } ha sido asignado al proyecto ${
              leadStatus.comment && `obs: ${leadStatus.comment}`
            }`,
            leadID: leadFound._id,
          },
          leadFound,
        );
      } else if (leadStatus.status === LeadStatusEnum.NOT_ASSIGN_PROJECT) {
        leadFound.status = LeadStatustype.PROSPECT;

        await this.notificationService.sendNotificationToInvolved(
          {
            title: 'Prospecto no asignado a proyecto',
            message: `El prospecto ${
              leadFound.name
            } no ha sido asignado a un proyecto ${
              leadStatus.comment && `obs: ${leadStatus.comment}`
            }`,
            leadID: leadFound._id,
          },
          leadFound,
        );
      }
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async handleToAssignHouseStatus(leadFound: Lead, leadStatus: LeadStatusDTO) {
    try {
      if (leadStatus.status === LeadStatusEnum.ASSIGN_HOUSE) {
        if (!leadStatus.houseModel) {
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message: 'Debes asignar una casa al prospecto',
          });
        }

        leadFound.projectDetails = {
          ...leadFound.projectDetails,
          houseModel: leadStatus.houseModel,
        };
        leadFound.status = LeadStatustype.PROSPECT_DEFINED;

        await this.notificationService.sendNotificationToInvolved(
          {
            title: 'Prospecto asignado a casa',
            message: `El prospecto ${
              leadFound.name
            } ha sido asignado a la casa ${
              leadStatus.comment && `obs: ${leadStatus.comment}`
            }`,
            leadID: leadFound._id,
          },
          leadFound,
        );
      } else if (leadStatus.status === LeadStatusEnum.TO_ASSIGN_PROJECT) {
        await this.lotService.releaseLot(leadFound.projectDetails.lotID);

        leadFound.status = LeadStatustype.TO_ASSIGN_PROJECT;
        leadFound.projectDetails = {
          projectID: null,
          lotID: null,
          houseModel: null,
        };

        await this.notificationService.sendNotificationToInvolved(
          {
            title: 'Prospecto no asignado a casa',
            message: `El prospecto ${
              leadFound.name
            } no ha sido asignado a una casa ${
              leadStatus.comment && `obs: ${leadStatus.comment}`
            }`,
            leadID: leadFound._id,
          },
          leadFound,
        );
      }
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async handleProspectDefinedStatus(
    leadFound: Lead,
    leadStatus: LeadStatusDTO,
  ) {
    try {
      if (leadStatus.status === LeadStatusEnum.PAYMENT_CONFIRMED) {
        leadFound.status = LeadStatustype.PAYMENT_CONFIRMED;
        await this.notificationService.sendNotificationToInvolved(
          {
            title: 'Prospecto definido',
            message: `El prospecto ${
              leadFound.name
            } ha confirmado el pago de constancias ${
              leadStatus.comment && `obs: ${leadStatus.comment}`
            }`,
            leadID: leadFound._id,
          },
          leadFound,
        );
      } else if (leadStatus.status === LeadStatusEnum.NOT_PAYMENT_CONFIRMED) {
        leadFound.status = LeadStatustype.TO_ASSIGN_PROJECT;

        await this.lotService.releaseLot(leadFound.projectDetails.lotID);

        leadFound.projectDetails = {
          projectID: null,
          lotID: null,
          houseModel: null,
        };

        await this.notificationService.sendNotificationToInvolved(
          {
            title: 'Prospecto no definido',
            message: `El prospecto ${
              leadFound.name
            } no ha confirmado el pago de constancias, se libera el lote ${
              leadStatus.comment && `obs: ${leadStatus.comment}`
            }`,
            leadID: leadFound._id,
          },
          leadFound,
        );
      }
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
  async deleteLeadById(id: string){

    try {
      const leadFound = await this.leadModel.findById(id);
      if (!leadFound) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: 'Prospecto no encontrado',
        });
      }

      await this.notificationService.sendNotificationToInvolved(
        {
          title: 'Prospecto eliminado',
          message: `El prospecto ${leadFound.name} ha sido eliminado`,
        },
        leadFound,
      );

      await this.notificationService.deleteAllNotificationByLeadId(id);
      return await this.leadModel.findByIdAndDelete(id) 

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
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  /*
   * Check permissions
   */

  // Check if the user has permission to update the status of a lead
  checkPermissionToUpdateLeadStatus(status: LeadStatus): boolean {
    try {
      const { roleUser } = this.request;

      if (roleUser === 'ADMIN') {
        return true;
      }

      if (!status.role) {
        return true;
      }

      if (status.role === roleUser) {
        return true;
      }

      throw new ErrorManager({
        type: 'BAD_REQUEST',
        message: 'No tienes permisos para actualizar el estado del prospecto',
      });
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  // Check if the user has permission to update a lead
  checkPermission(roleUser: string, leadFound: Lead, idUser: string) {
    switch (roleUser) {
      case 'ADVISOR':
        if (leadFound.advisorID.toString() !== idUser) {
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message: 'No tienes permisos para actualizar el prospecto',
          });
        }
        break;
      case 'MANAGER':
        if (leadFound.managerID.toString() !== idUser) {
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message: 'No tienes permisos para actualizar el lead',
          });
        }
        break;
      case 'BANK_MANAGER':
        if (leadFound.bankManagerID.toString() !== idUser) {
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message: 'No tienes permisos para actualizar el lead',
          });
        }
        break;
      case 'ADMIN':
        break;
      default:
        break;
    }
  }
}
