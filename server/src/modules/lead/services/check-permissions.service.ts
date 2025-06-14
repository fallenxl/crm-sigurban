import { ErrorManager } from "src/utils/error.manager";
import { Lead } from "../schemas/lead.schemas";
import { LeadStatus } from "../interfaces";
import { Inject, Injectable, Scope } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { Roles } from "src/constants";

@Injectable({ scope: Scope.REQUEST })
export class CheckPermissionsService {
    constructor(@Inject(REQUEST) private readonly request: Request) {}
  /*
   * Check permissions
   */

  // Check if the user has permission to update the status of a lead
  checkPermissionToUpdateLeadStatus(status: LeadStatus, lead : Lead): boolean {
    try {
      const { roleUser } = this.request;

      if (roleUser === 'ADMIN') {
        return true;
      }

      if (!status.role) {
        return true;
      }

      if (status.role.includes(roleUser as Roles)) {
        return true;
      }

      if(status.role.includes('ADVISOR' as Roles) && this.request.idUser === lead.advisorID )

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
    if (roleUser === 'ADMIN') {
      return true;
    }

    if (
      leadFound.advisorID.toString() === idUser ||
      leadFound.managerID.toString() === idUser ||
      leadFound.bankManagerID.toString() === idUser
    ) {
      return true;
    }

    return false;
  }
}
