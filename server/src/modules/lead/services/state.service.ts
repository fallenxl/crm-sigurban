import { NotificationService } from 'src/modules/notification/services/notification.service';
import { LeadStatusDTO } from '../dto/lead.dto';
import { LeadStatus, LeadStatusEnum, LeadStatustype } from '../interfaces';
import { Lead } from '../schemas/lead.schemas';
import { ErrorManager } from 'src/utils/error.manager';
import { UsersService } from 'src/modules/users/services/users.service';
import { POPULATES_LEAD, Roles } from 'src/constants';
import { BankService } from 'src/modules/bank/services';
import { LotsService } from 'src/modules/lots/services/lots.service';
import { CheckPermissionsService } from './check-permissions.service';
import { LeadService } from './lead.service';
import { v4 as uuid } from 'uuid';
import { REQUEST } from '@nestjs/core';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { Request } from 'express';
import { SocketGateway } from 'src/modules/socket/gateways/socket.gateway';
import { isArray } from 'class-validator';
import { ProjectService } from 'src/modules/project/services/project.service';
import { LotStatus } from '../../../constants/lots';

@Injectable({ scope: Scope.REQUEST })
export class StateService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly leadService: LeadService,
    private readonly notificationService: NotificationService,
    private readonly userService: UsersService,
    private readonly bankService: BankService,
    private readonly lotService: LotsService,
    private readonly checkPermissions: CheckPermissionsService,
    private readonly socketGateway: SocketGateway,
    private readonly projectService: ProjectService,
  ) {}

  async getLeadStatus(id: string): Promise<LeadStatus> {
    try {
      const leadFound = await this.leadService.leadExists(id);
      return leadFound.status;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  // Update the status of a lead
  async updateLeadStatus(id: string, leadStatus: LeadStatusDTO): Promise<Lead> {
    try {
      const leadFound = await this.leadService.leadExists(id);

      this.checkPermissions.checkPermissionToUpdateLeadStatus(
        leadFound.status,
        leadFound,
      );

      if (leadStatus.status === leadFound.status.selected) {
        return;
      }

      leadFound.lastStatus = leadFound.status;


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
            await this.handleProspectStatus(leadFound, leadStatus);
  
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
        case LeadStatusEnum.POTENTIAL_CUSTOMER:
          await this.handlePotentialCustomerStatus(leadFound, leadStatus);
          break;
        case LeadStatusEnum.SENDED_TO_REVIEW_FIRST_STAGE:
          await this.handleSendToReviewInBankStatus(leadFound, leadStatus);
          break;
        case LeadStatusEnum.FIRST_STAGE_OF_FILE:
          await this.handleFirstStageOfFileStatus(leadFound, leadStatus);
          break;
        case LeadStatusEnum.SECOND_STAGE_OF_FILE:
          await this.handleSecondStageOfFileStatus(leadFound, leadStatus);
          break;
        case LeadStatusEnum.SENDED_REVIEW_IN_BANK:
          await this.handleSecondReviewInBankStatus(leadFound, leadStatus);
          break;
        case LeadStatusEnum.REVISION_OF_FILE:
          await this.handleRevisionOfFileStatus(leadFound, leadStatus);
          break;
        case LeadStatusEnum.SEND_TO_BANK:
          await this.handleSendToBankStatus(leadFound, leadStatus);
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


      leadFound.lastStatusUpdate = new Date();

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
      const userFound = await this.userService.userExists(this.request.idUser);
      // Create a new timeline for the lead
      leadFound.timeline.push({
        _id: uuid(),
        updatedBy: userFound.name,
        status: leadFound.status,
        title: `Prospecto actualizado a ${leadFound.status.type}`,
        message: `El prospecto ha sido contactado y se envia a oportunidad de venta futura ${
          leadStatus.comment && `obs: ${leadStatus.comment}`
        }`,
        date: new Date(),
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
      // Create a new timeline for the lead
      leadFound.timeline.push({
        _id: uuid(),
        updatedBy: userFound.name,
        status: leadFound.status,
        title: `Prospecto actualizado a ${leadFound.status.type}`,
        message: leadStatus.comment,
        date: new Date(),
      });

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
    }
  }

  async handleProspectStatus(leadFound: Lead, leadStatus: LeadStatusDTO) {
    if(leadStatus.status === LeadStatusEnum.TO_ASSIGN_PROJECT) {
      leadFound.status = LeadStatustype.TO_ASSIGN_PROJECT;
      await this.notificationService.sendNotificationToInvolved(
        {
          title: 'Prospecto a seleccionar proyecto',
          message: `El prospecto ${
            leadFound.name
          } se envia a seleccionar proyecto ${
            leadStatus.comment && `obs: ${leadStatus.comment}`
          }`,
          leadID: leadFound._id,
        },
        leadFound,
      );
      const userFound = await this.userService.userExists(this.request.idUser);
      // Create a new timeline for the lead
      leadFound.timeline.push({
        _id: uuid(),
        updatedBy: userFound.name,
        status: leadFound.status,
        title: `Prospecto actualizado a ${leadFound.status.type}`,
        message: `El prospecto se envia a seleccionar proyecto ${ leadStatus.comment && `obs: ${leadStatus.comment}`}`,
        date: new Date(),
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
          title: 'Prospecto no contesto',
          message: `El prospecto ${leadFound.name} no contesto ${
            leadStatus.comment && `obs: ${leadStatus.comment}`
          }`,
          leadID: leadFound._id,
        },
        leadFound,
      );
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
        const userFound = await this.userService.userExists(this.request.idUser);
        // Create a new timeline for the lead
        leadFound.timeline.push({
          _id: uuid(),
          updatedBy: userFound.name,
          status: leadFound.status,
          title: `Prospecto actualizado a ${leadFound.status.type}`,
          message: `El prospecto precalifica segun reporte de informacion crediticia; Se solicita precalificar con el banco: ${bankFound.name}, y el programa: ${leadStatus.financingProgram} ${leadStatus.comment && `obs: ${leadStatus.comment}`}`,
          date: new Date(),
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
        const userFound = await this.userService.userExists(this.request.idUser);
        // Create a new timeline for the lead
        leadFound.timeline.push({
          _id: uuid(),
          updatedBy: userFound.name,
          status: leadFound.status,
          title: `Prospecto actualizado a ${leadFound.status.type}`,
          message: `El prospecto no precalifica en buró
           ${leadStatus.comment && `obs: ${leadStatus.comment}`}`,
          date: new Date(),
        });
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
        const userFound = await this.userService.userExists(this.request.idUser);
      // Create a new timeline for the lead
      leadFound.timeline.push({
        _id: uuid(),
        updatedBy: userFound.name,
        status: leadFound.status,
        title: `Prospecto actualizado a ${leadFound.status.type}`,
        message: `El prospecto no precalifica en buró y se envia a oportunidad de venta futura 
         ${leadStatus.comment && `obs: ${leadStatus.comment}`}`,
        date: new Date(),
      });
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
        if(!leadFound.projectDetails?.lotID){
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
        const userFound = await this.userService.userExists(this.request.idUser);
        // Create a new timeline for the lead
        leadFound.timeline.push({
          _id: uuid(),
          updatedBy: userFound.name,
          status: leadFound.status,
          title: `Prospecto actualizado a ${leadFound.status.type}`,
          message: `El prospecto precalifica con el banco: ${bank.name} ${
            leadStatus.comment && `obs: ${leadStatus.comment}`
          }`,
          date: new Date(),
        });
        }else {
          console.log('entro aca')
          leadFound.status = LeadStatustype.TO_ASSIGN_HOUSE;

          await this.notificationService.sendNotificationToInvolved(
            {
              title: 'Prospecto precalificado con banco',
              message: `${bankManager.name} te notifica que el prospecto ${
                leadFound.name
              } SI califica con el banco ${
                bank.name
              }, iniciar proceso de seleccionar casa. ${
                leadStatus.comment && `obs: ${leadStatus.comment}`
              }`,
              leadID: leadFound._id,
            },
            leadFound,
          );
          const userFound = await this.userService.userExists(this.request.idUser);
          // Create a new timeline for the lead
          leadFound.timeline.push({
            _id: uuid(),
            updatedBy: userFound.name,
            status: leadFound.status,
            title: `Prospecto actualizado a ${leadFound.status.type}`,
            message: `El prospecto precalifica con el banco: ${bank.name} ${
              leadStatus.comment && `obs: ${leadStatus.comment}`
            }`,
            date: new Date(),
          });
        }
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
        const userFound = await this.userService.userExists(this.request.idUser);
        // Create a new timeline for the lead
        leadFound.timeline.push({
          _id: uuid(),
          updatedBy: userFound.name,
          status: leadFound.status,
          title: `Prospecto actualizado a ${leadFound.status.type}`,
          message: `El prospecto no precalifica en el banco: ${bank.name} 
           ${leadStatus.comment && `obs: ${leadStatus.comment}`}`,
          date: new Date(),
        });
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
        const userFound = await this.userService.userExists(this.request.idUser);
        const projectFound = await this.projectService.findOne(leadStatus.projectID);
        // Create a new timeline for the lead
        leadFound.timeline.push({
          _id: uuid(),
          updatedBy: userFound.name,
          status: leadFound.status,
          title: `Prospecto actualizado a ${leadFound.status.type}`,
          message: `El prospecto ha sido asignado al lot ${lotFound.lot} del proyecto ${projectFound.name} ${leadStatus.comment && `obs: ${leadStatus.comment}`}`,
          date: new Date(),
        });
      } else if (leadStatus.status === LeadStatusEnum.NOT_ASSIGN_PROJECT) {
        leadFound.status = LeadStatustype.TO_CALL;

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
        const userFound = await this.userService.userExists(this.request.idUser);
      // Create a new timeline for the lead
      leadFound.timeline.push({
        _id: uuid(),
        updatedBy: userFound.name,
        status: leadFound.status,
        title: `Prospecto actualizado a ${leadFound.status.type}`,
        message: `El prospecto no ha sido asignado a un proyecto ${leadStatus.comment && `obs: ${leadStatus.comment}`}`,
        date: new Date(),
      });
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

        leadFound.projectDetails.houseModel = leadStatus.houseModel;
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
        const userFound = await this.userService.userExists(this.request.idUser);
        // Create a new timeline for the lead
        leadFound.timeline.push({
          _id: uuid(),
          updatedBy: userFound.name,
          status: leadFound.status,
          title: `Prospecto actualizado a ${leadFound.status.type}`,
          message: `Al prospecto se le asigno modelo de casa ${leadStatus.houseModel.model} ${leadStatus.comment && `obs: ${leadStatus.comment}`}`,
          date: new Date(),
        });
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
        const userFound = await this.userService.userExists(this.request.idUser);
        // Create a new timeline for the lead
        leadFound.timeline.push({
          _id: uuid(),
          updatedBy: userFound.name,
          status: leadFound.status,
          title: `Prospecto actualizado a ${leadFound.status.type}`,
          message: `Al prospecto no se le ha asignado un modelo de casa y se envía a seleccionar proyecto ${leadStatus.comment && `obs: ${leadStatus.comment}`}`,
          date: new Date(),
        });
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
        leadFound.status = LeadStatustype.POTENTIAL_CUSTOMER;
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

        const userFound = await this.userService.userExists(this.request.idUser);

        // update lot status
        await this.lotService.updateLotStatus(leadFound.projectDetails.lotID, LotStatus.POTENTIAL);
        // Create a new timeline for the lead
        leadFound.timeline.push({
          _id: uuid(),
          updatedBy: userFound.name,
          status: leadFound.status,
          title: `Prospecto actualizado a ${leadFound.status.type}`,
          message: `El prospecto ha confirmado el pago ${leadStatus.comment && `obs: ${leadStatus.comment}`}`,
          date: new Date(),
        });
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
        const userFound = await this.userService.userExists(this.request.idUser);
        // Create a new timeline for the lead
        leadFound.timeline.push({
          _id: uuid(),
          updatedBy: userFound.name,
          status: leadFound.status,
          title: `Prospecto actualizado a ${leadFound.status.type}`,
          message: `El prospecto no ha confirmado el pago  y se libera el lote ${leadStatus.comment && `obs: ${leadStatus.comment}`}`,
          date: new Date(),
        });
      } else if (leadStatus.status === LeadStatusEnum.CHANGE_BANK) {
        if(leadFound.bankID === leadStatus.bankID) {
          throw new ErrorManager({
            type: 'BAD_REQUEST',
            message: 'Debe seleccionar un banco diferente al actual',
          });
        }

        leadFound.bankID = leadStatus.bankID;
        leadFound.financingProgram = leadStatus.financingProgram;
        leadFound.status = LeadStatustype.POTENTIAL_CUSTOMER

        await this.notificationService.sendNotificationToInvolved(
          {
            title: 'Prospecto cambio de banco',
            message: `El prospecto ${
              leadFound.name
            } ha cambiado de banco ${
              leadStatus.comment && `obs: ${leadStatus.comment}`
            }`,
            leadID: leadFound._id,
          },
          leadFound,
        );

        const userFound = await this.userService.userExists(this.request.idUser);
        const bankFound = await this.bankService.bankExists(leadStatus.bankID);
        // Create a new timeline for the lead
        leadFound.timeline.push({
          _id: uuid(),
          updatedBy: userFound.name,
          status: leadFound.status,
          title: `Prospecto actualizado a ${leadFound.status.type}`,
          message: `El prospecto ha cambiado de banco al banco ${bankFound.name} y programa ${leadStatus.financingProgram} ${leadStatus.comment && `obs: ${leadStatus.comment}`}`,
          date: new Date(),
        });

      } else if(leadStatus.status === LeadStatusEnum.CANCEL_PROSPECT){
        leadFound.status = LeadStatustype.CANCEL_PROSPECT;
        await this.notificationService.sendNotificationToInvolved(
          {
            title: 'Prospecto anulado',
            message: `El prospecto ${
              leadFound.name
            } ha sido anulado ${
              leadStatus.comment && `obs: ${leadStatus.comment}`
            }`,
            leadID: leadFound._id,
          },
          leadFound,
        );
        const userFound = await this.userService.userExists(this.request.idUser);
      // Create a new timeline for the lead
      leadFound.timeline.push({
        _id: uuid(),
        updatedBy: userFound.name,
        status: leadFound.status,
        title: `Prospecto actualizado a ${leadFound.status.type}`,
        message: `El prospecto ha sido anulado ${leadStatus.comment && `obs: ${leadStatus.comment}`}`,
        date: new Date(),
      });
      }
      
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async handlePotentialCustomerStatus(
    leadFound: Lead,
    leadStatus: LeadStatusDTO,
  ) {
    try {
      if (leadStatus.status === LeadStatusEnum.DOCUMENTATION) {
        leadFound.status = LeadStatustype.SENDED_TO_REVIEW_IN_BANK;
        leadFound.documents = isArray(leadFound.documents)
          ? [...leadFound.documents, ...leadStatus.documents]
          : leadStatus.documents;
        await this.notificationService.sendNotificationToInvolved(
          {
            title: 'Prospecto definido',
            message: `El prospecto ${
              leadFound.name
            } esta en proceso de validación de primera etapa ${
              leadStatus.comment && `obs: ${leadStatus.comment}`
            }`,
            leadID: leadFound._id,
          },
          leadFound,
        );
        const userFound = await this.userService.userExists(this.request.idUser);
        // Create a new timeline for the lead
        leadFound.timeline.push({
          _id: uuid(),
          updatedBy: userFound.name,
          status: leadFound.status,
          title: `Prospecto actualizado a ${leadFound.status.type}`,
          message: `El prospecto esta en proceso de validación de primera etapa ${leadStatus.comment && `obs: ${leadStatus.comment}`}`,
          date: new Date(),
        });
      }
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async handleSendToReviewInBankStatus(
    leadFound: Lead,
    leadStatus: LeadStatusDTO,
  ) {
    try {
      if (leadStatus.status === LeadStatusEnum.THERE_ARE_SUBSIDIARIES) {
        leadFound.status = LeadStatustype.POTENTIAL_CUSTOMER;
        await this.notificationService.sendNotificationToInvolved(
          {
            title: 'Prospecto validado',
            message: `El prospecto ${
              leadFound.name
            } tiene subsanaciones, haga seguimiento de la documentación 
            ${leadStatus.comment && `obs: ${leadStatus.comment}`}`,
            leadID: leadFound._id,
          },
          leadFound,
        );
        const userFound = await this.userService.userExists(this.request.idUser);
        // Create a new timeline for the lead
        leadFound.timeline.push({
          _id: uuid(),
          updatedBy: userFound.name,
          status: leadFound.status,
          title: `Prospecto actualizado a ${leadFound.status.type}`,
          message: `El prospecto tiene subsanaciones, haga seguimiento de la documentación ${leadStatus.comment && `obs: ${leadStatus.comment}`}`,
          date: new Date(),
        });
      } else if (
        leadStatus.status === LeadStatusEnum.THERE_ARE_NOT_SUBSIDIARIES
      ) {
        leadFound.status = LeadStatustype.FIRST_STAGE_OF_FILE;
        await this.notificationService.sendNotificationToInvolved(
          {
            title: 'Prospecto no validado',
            message: `El prospecto ${
              leadFound.name
            } no tiene subsanaciones, se envía a primera etapa de archivo ${
              leadStatus.comment && `obs: ${leadStatus.comment}`
            }`,
            leadID: leadFound._id,
          },
          leadFound,
        );
        const userFound = await this.userService.userExists(this.request.idUser);
        // Create a new timeline for the lead
        leadFound.timeline.push({
          _id: uuid(),
          updatedBy: userFound.name,
          status: leadFound.status,
          title: `Prospecto actualizado a ${leadFound.status.type}`,
          message: `El prospecto no tiene subsanaciones, se envía a primera etapa de archivo ${leadStatus.comment && `obs: ${leadStatus.comment}`}`,
          date: new Date(),
        });
      }
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async handleFirstStageOfFileStatus(
    leadFound: Lead,
    leadStatus: LeadStatusDTO,
  ) {
    try {
      if (leadStatus.status === LeadStatusEnum.SEND_APPRAISAL) {
        leadFound.status = LeadStatustype.SECOND_STAGE_OF_FILE;
        leadFound.documents = isArray(leadFound.documents)
          ? [...leadFound.documents, ...leadStatus.documents]
          : leadStatus.documents;
        await this.notificationService.sendNotificationToInvolved(
          {
            title: 'Prospecto enviado a avalúo',
            message: `El prospecto ${leadFound.name} ha sido enviado a avalúo ${
              leadStatus.comment && `obs: ${leadStatus.comment}`
            }`,
            leadID: leadFound._id,
          },
          leadFound,
        );
        const userFound = await this.userService.userExists(this.request.idUser);
        // Create a new timeline for the lead
        leadFound.timeline.push({
          _id: uuid(),
          updatedBy: userFound.name,
          status: leadFound.status,
          title: `Prospecto actualizado a ${leadFound.status.type}`,
          message: `El prospecto ha sido enviado a avalúo ${leadStatus.comment && `obs: ${leadStatus.comment}`}`,
          date: new Date(),
        });
      } else if (leadStatus.status === LeadStatusEnum.THERE_ARE_SUBSIDIARIES) {
        leadFound.status = LeadStatustype.SENDED_TO_REVIEW_IN_BANK;
        await this.notificationService.sendNotificationToInvolved(
          {
            title: 'Prospecto no enviado a avalúo',
            message: `El prospecto ${
              leadFound.name
            } tiene subsanaciones, por favor revisar documentación. ${
              leadStatus.comment && `obs: ${leadStatus.comment}`
            }`,
            leadID: leadFound._id,
          },
          leadFound,
        );
        const userFound = await this.userService.userExists(this.request.idUser);
        // Create a new timeline for the lead
        leadFound.timeline.push({
          _id: uuid(),
          updatedBy: userFound.name,
          status: leadFound.status,
          title: `Prospecto actualizado a ${leadFound.status.type}`,
          message: `El prospecto tiene subsanaciones, por favor revisar documentación ${leadStatus.comment && `obs: ${leadStatus.comment}`}`,
          date: new Date(),
        });
      }
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async handleSecondStageOfFileStatus(
    leadFound: Lead,
    leadStatus: LeadStatusDTO,
  ) {
    try {
      if (leadStatus.status === LeadStatusEnum.SEND_TO_APPRAISAL) {
        leadFound.status = LeadStatustype.SECOND_REVIEW_IN_BANK;
        leadFound.documents = isArray(leadFound.documents)
          ? [...leadFound.documents, ...leadStatus.documents]
          : leadStatus.documents;

        await this.notificationService.sendNotificationToInvolved(
          {
            title: 'Prospecto enviado a avalúo',
            message: `El prospecto ${leadFound.name} ha sido enviado a avalúo ${
              leadStatus.comment && `obs: ${leadStatus.comment}`
            }`,
            leadID: leadFound._id,
          },
          leadFound,
        );
        const userFound = await this.userService.userExists(this.request.idUser);
        // Create a new timeline for the lead
        leadFound.timeline.push({
          _id: uuid(),
          updatedBy: userFound.name,
          status: leadFound.status,
          title: `Prospecto actualizado a ${leadFound.status.type}`,
          message: `El prospecto ha sido enviado a avalúo ${leadStatus.comment && `obs: ${leadStatus.comment}`}`,
          date: new Date(),
        });
      } else if (leadStatus.status === LeadStatusEnum.THERE_ARE_SUBSIDIARIES) {
        leadFound.status = LeadStatustype.FIRST_STAGE_OF_FILE;

        await this.notificationService.sendNotificationToInvolved(
          {
            title: 'Prospecto no enviado a avalúo',
            message: `El prospecto ${
              leadFound.name
            } tiene subsanaciones, por favor revisar documentación. ${
              leadStatus.comment && `obs: ${leadStatus.comment}`
            }`,
            leadID: leadFound._id,
          },
          leadFound,
        );
        const userFound = await this.userService.userExists(this.request.idUser);
        // Create a new timeline for the lead
        leadFound.timeline.push({
          _id: uuid(),
          updatedBy: userFound.name,
          status: leadFound.status,
          title: `Prospecto actualizado a ${leadFound.status.type}`,
          message: `El prospecto tiene subsanaciones, por favor revisar documentación ${leadStatus.comment && `obs: ${leadStatus.comment}`}`,
          date: new Date(),
        });
      }
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async handleSecondReviewInBankStatus(
    leadFound: Lead,
    leadStatus: LeadStatusDTO,
  ) {
    try {
      if (leadStatus.status === LeadStatusEnum.THERE_ARE_SUBSIDIARIES) {
        leadFound.status = LeadStatustype.SECOND_STAGE_OF_FILE;

        await this.notificationService.sendNotificationToInvolved(
          {
            title: 'Prospecto no validado',
            message: `El prospecto ${
              leadFound.name
            } tiene subsanaciones, por favor revisar documentación. ${
              leadStatus.comment && `obs: ${leadStatus.comment}`
            }`,
            leadID: leadFound._id,
          },
          leadFound,
        );
        const userFound = await this.userService.userExists(this.request.idUser);
        // Create a new timeline for the lead
        leadFound.timeline.push({
          _id: uuid(),
          updatedBy: userFound.name,
          status: leadFound.status,
          title: `Prospecto actualizado a ${leadFound.status.type}`,
          message: `El prospecto tiene subsanaciones, por favor revisar documentación ${leadStatus.comment && `obs: ${leadStatus.comment}`}`,
          date: new Date(),
        });
      } else if (
        leadStatus.status === LeadStatusEnum.THERE_ARE_NOT_SUBSIDIARIES
      ) {
        leadFound.status = LeadStatustype.REVISION_OF_FILE;

        await this.notificationService.sendNotificationToInvolved(
          {
            title: 'Prospecto validado',
            message: `El prospecto ${
              leadFound.name
            } no tiene subsanaciones, por favor revisar documentación. ${
              leadStatus.comment && `obs: ${leadStatus.comment}`
            }`,
            leadID: leadFound._id,
          },
          leadFound,
        );
        const userFound = await this.userService.userExists(this.request.idUser);
        // Create a new timeline for the lead
        leadFound.timeline.push({
          _id: uuid(),
          updatedBy: userFound.name,
          status: leadFound.status,
          title: `Prospecto actualizado a ${leadFound.status.type}`,
          message: `El prospecto no tiene subsanaciones, y se envía a revision ${leadStatus.comment && `obs: ${leadStatus.comment}`}`,
          date: new Date(),
        });
      }
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async handleRevisionOfFileStatus(leadFound: Lead, leadStatus: LeadStatusDTO) {
    try {
      if (leadStatus.status === LeadStatusEnum.THERE_ARE_SUBSIDIARIES) {
        leadFound.status = LeadStatustype.SECOND_REVIEW_IN_BANK;

        await this.notificationService.sendNotificationToInvolved(
          {
            title: 'Prospecto no validado',
            message: `El prospecto ${
              leadFound.name
            } tiene subsanaciones, por favor revisar documentación. ${
              leadStatus.comment && `obs: ${leadStatus.comment}`
            }`,
            leadID: leadFound._id,
          },
          leadFound,
        );
        const userFound = await this.userService.userExists(this.request.idUser);
        // Create a new timeline for the lead
        leadFound.timeline.push({
          _id: uuid(),
          updatedBy: userFound.name,
          status: leadFound.status,
          title: `Prospecto actualizado a ${leadFound.status.type}`,
          message: `El prospecto tiene subsanaciones, por favor revisar documentación ${leadStatus.comment && `obs: ${leadStatus.comment}`}`,
          date: new Date(),
        });
      } else if (
        leadStatus.status === LeadStatusEnum.THERE_ARE_NOT_SUBSIDIARIES
      ) {
        leadFound.status = LeadStatustype.SEND_TO_BANK;

        await this.notificationService.sendNotificationToInvolved(
          {
            title: 'Prospecto validado',
            message: `El prospecto ${
              leadFound.name
            } no tiene subsanaciones, por favor revisar documentación. ${
              leadStatus.comment && `obs: ${leadStatus.comment}`
            }`,
            leadID: leadFound._id,
          },
          leadFound,
        );
        const userFound = await this.userService.userExists(this.request.idUser);
        // Create a new timeline for the lead
        leadFound.timeline.push({
          _id: uuid(),
          updatedBy: userFound.name,
          status: leadFound.status,
          title: `Prospecto actualizado a ${leadFound.status.type}`,
          message: `El prospecto no tiene subsanaciones, y se envía a revision al banco ${leadStatus.comment && `obs: ${leadStatus.comment}`}`,
          date: new Date(),
        });
      }
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async handleSendToBankStatus(leadFound: Lead, leadStatus: LeadStatusDTO) {
    try {
      if (leadStatus.status === LeadStatusEnum.THERE_ARE_SUBSIDIARIES) {
        if (
          leadStatus.sameFinancialInstitutionContinues.toLowerCase() === 'si'
        ) {
          if (leadStatus.whoIsResponsible.toLowerCase() === 'asesor') {
            leadFound.status = LeadStatustype.POTENTIAL_CUSTOMER;

            await this.notificationService.sendNotificationToInvolved(
              {
                title: 'Prospecto definido',
                message: `El prospecto ${
                  leadFound.name
                } se ha enviado a subsanaciones generales ${
                  leadStatus.comment && `obs: ${leadStatus.comment}`
                }`,
                leadID: leadFound._id,
              },
              leadFound,
            );
            const userFound = await this.userService.userExists(this.request.idUser);
            // Create a new timeline for the lead
            leadFound.timeline.push({
              _id: uuid(),
              updatedBy: userFound.name,
              status: leadFound.status,
              title: `Prospecto actualizado a ${leadFound.status.type}`,
              message: `El prospecto se ha enviado a subsanaciones generales ${leadStatus.comment && `obs: ${leadStatus.comment}`}`,
              date: new Date(),
            });
            
          } else if (leadStatus.whoIsResponsible.toLowerCase() === 'gestor') {
            leadFound.status = LeadStatustype.SENDED_TO_REVIEW_IN_BANK;

            await this.notificationService.sendNotificationToInvolved(
              {
                title: 'Prospecto definido',
                message: `El prospecto ${
                  leadFound.name
                } se ha enviado a subsanar de forma interna. ${
                  leadStatus.comment && `obs: ${leadStatus.comment}`
                }`,
                leadID: leadFound._id,
              },
              leadFound,
            );
            const userFound = await this.userService.userExists(this.request.idUser);
            // Create a new timeline for the lead
            leadFound.timeline.push({
              _id: uuid(),
              updatedBy: userFound.name,
              status: leadFound.status,
              title: `Prospecto actualizado a ${leadFound.status.type}`,
              message: `El prospecto se ha enviado a subsanar de forma interna ${leadStatus.comment && `obs: ${leadStatus.comment}`}`,
              date: new Date(),
            });
          }

         
        } else if (
          leadStatus.sameFinancialInstitutionContinues.toLowerCase() === 'no'
        ) {
          leadFound.status = {
            ...LeadStatustype.PROSPECT_DEFINED,
            condition: 'REJECTED',
            role: [Roles.BANK_MANAGER],
            enum: [LeadStatusEnum.DEFAULT,LeadStatusEnum.CHANGE_BANK, LeadStatusEnum.CANCEL_PROSPECT],
          };
          await this.notificationService.sendNotificationToInvolved(
            {
              title: 'Prospecto definido',
              message: `El prospecto ${
                leadFound.name
              } se anula la gestión del prospecto, y no continuara con la misma institución financiera,
              selecciona un nuevo banco para este prospecto ${
                leadStatus.comment && `obs: ${leadStatus.comment}`
              }`,
              leadID: leadFound._id,
            },
            leadFound,
          );
          const userFound = await this.userService.userExists(this.request.idUser);
          // Create a new timeline for the lead
          leadFound.timeline.push({
            _id: uuid(),
            updatedBy: userFound.name,
            status: leadFound.status,
            title: `Prospecto actualizado a ${leadFound.status.type}`,
            message: `El prospecto se anula la gestión del prospecto, y no continuara con la misma institución financiera ${leadStatus.comment && `obs: ${leadStatus.comment}`}`,
            date: new Date(),
          });
        }
      } else if (
        leadStatus.status === LeadStatusEnum.THERE_ARE_NOT_SUBSIDIARIES
      ) {
        if (leadStatus.approved.toLowerCase() === 'si') {
          leadFound.status = LeadStatustype.APPROVED;
          await this.notificationService.sendNotificationToInvolved(
            {
              title: 'Prospecto definido',
              message: `El prospecto ${
                leadFound.name
              } ha sido validado por el banco y se aprueba la gestión. ${
                leadStatus.comment && `obs: ${leadStatus.comment}`
              }`,
              leadID: leadFound._id,
            },
            leadFound,
          );
          const userFound = await this.userService.userExists(this.request.idUser);
          // Create a new timeline for the lead
          leadFound.timeline.push({
            _id: uuid(),
            updatedBy: userFound.name,
            status: leadFound.status,
            title: `Prospecto actualizado a ${leadFound.status.type}`,
            message: `El prospecto ha sido validado por el banco y se aprueba la gestión ${leadStatus.comment && `obs: ${leadStatus.comment}`}`,
            date: new Date(),
          });
        } else if (leadStatus.approved.toLowerCase() === 'no') {
          if (leadStatus.whoIsResponsible.toLowerCase() === 'asesor') {
            leadFound.status = LeadStatustype.POTENTIAL_CUSTOMER;
            await this.notificationService.sendNotificationToInvolved(
              {
                title: 'Prospecto definido',
                message: `El prospecto ${
                  leadFound.name
                } se ha enviado a subsanaciones generales ${
                  leadStatus.comment && `obs: ${leadStatus.comment}`
                }`,
                leadID: leadFound._id,
              },
              leadFound,
            );
            const userFound = await this.userService.userExists(this.request.idUser);
            // Create a new timeline for the lead
            leadFound.timeline.push({
              _id: uuid(),
              updatedBy: userFound.name,
              status: leadFound.status,
              title: `Prospecto actualizado a ${leadFound.status.type}`,
              message: `El prospecto se ha enviado a subsanaciones generales ${leadStatus.comment && `obs: ${leadStatus.comment}`}`,
              date: new Date(),
            });
          } else if (leadStatus.whoIsResponsible.toLowerCase() === 'gestor') {
            leadFound.status = LeadStatustype.SECOND_REVIEW_IN_BANK;
            await this.notificationService.sendNotificationToInvolved(
              {
                title: 'Prospecto definido',
                message: `El prospecto ${
                  leadFound.name
                } se ha enviado a subsanar de forma interna. ${
                  leadStatus.comment && `obs: ${leadStatus.comment}`
                }`,
                leadID: leadFound._id,
              },
              leadFound,
            );
            const userFound = await this.userService.userExists(this.request.idUser);
            // Create a new timeline for the lead
            leadFound.timeline.push({
              _id: uuid(),
              updatedBy: userFound.name,
              status: leadFound.status,
              title: `Prospecto actualizado a ${leadFound.status.type}`,
              message: `El prospecto se ha enviado a subsanar de forma interna ${leadStatus.comment && `obs: ${leadStatus.comment}`}`,
              date: new Date(),
            });
          }
        } else if (
          leadStatus.sameFinancialInstitutionContinues.toLowerCase() === 'no'
        ) {
          leadFound.status = {
            ...LeadStatustype.PROSPECT_DEFINED,
            condition: 'REJECTED',
            role: [Roles.BANK_MANAGER],
            enum: [LeadStatusEnum.DEFAULT,LeadStatusEnum.CHANGE_BANK, LeadStatusEnum.CANCEL_PROSPECT],
          };
          await this.notificationService.sendNotificationToInvolved(
            {
              title: 'Prospecto definido',
              message: `El prospecto ${
                leadFound.name
              } se anula la gestión del prospecto, y no continuara con la misma institución financiera,
              selecciona un nuevo banco para este prospecto ${
                leadStatus.comment && `obs: ${leadStatus.comment}`
              }`,
              leadID: leadFound._id,
            },
            leadFound,
          );
          const userFound = await this.userService.userExists(this.request.idUser);
          // Create a new timeline for the lead
          leadFound.timeline.push({
            _id: uuid(),
            updatedBy: userFound.name,
            status: leadFound.status,
            title: `Prospecto actualizado a ${leadFound.status.type}`,
            message: `El prospecto se anula la gestión del prospecto, y no continuara con la misma institución financiera ${leadStatus.comment && `obs: ${leadStatus.comment}`}`,
            date: new Date(),
          });
        }
      }
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
