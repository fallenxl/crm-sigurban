/* eslint-disable prettier/prettier */

// Importación de módulos y clases necesarios
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { Roles } from '../../../constants';
import { ADMIN_KEY, PUBLIC_KEY, ROLES_KEY } from '../../../constants';

@Injectable() // Marca la clase como inyectable
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Comprobar si la ruta es pública
    const isPublic = this.reflector.get<boolean>(
      PUBLIC_KEY,
      context.getHandler(),
    );

    if (isPublic) {
      return true; // Si es pública, permite el acceso
    }


    
    // Obtener roles y claves de administrador de los metadatos de la ruta
    const roles = this.reflector.get<Array<keyof typeof Roles>>(
      ROLES_KEY,
      context.getHandler(),
    );
    const admin = this.reflector.get<string>(ADMIN_KEY, context.getHandler());

    // Obtener la solicitud HTTP del contexto
    const req = context.switchToHttp().getRequest<Request>();

    // Obtener el rol del usuario de la solicitud
    const { roleUser } = req;

    if (roles === undefined) {
      if (!admin) {
        return true; // Si no se requieren roles y no hay administrador, permite el acceso
      } else if (admin && roleUser === admin) {
        return true; // Si el usuario tiene el rol de administrador, permite el acceso
      } else {
        throw new UnauthorizedException('Permissions denied'); // Si no se cumplen las condiciones, lanza una excepción
      }
    }

    if (roleUser === Roles.ADMIN) {
      return true; // Si el usuario tiene el rol de administrador, permite el acceso
    }

    // Comprobar si el usuario tiene uno de los roles especificados
    const isAuth = roles.some((role) => role === roleUser);

    if (!isAuth) {
      throw new UnauthorizedException('Permissions denied'); // Si no se cumple la autorización, lanza una excepción
    }

    return true; // Si se cumple la autorización, permite el acceso
  }
}
