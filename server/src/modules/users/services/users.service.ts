import { Global, Inject, Injectable, Scope, forwardRef } from '@nestjs/common';
import { UserDTO, UserUpdateDTO } from '../dto/user.dto';
import { ErrorManager } from '../../../utils/error.manager'; // Import the ErrorManager utility
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema';
import { Model } from 'mongoose';
import { v4 as uuid } from 'uuid';
import { Roles } from '../../../constants';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Lead } from 'src/modules/lead/schemas/lead.schemas';
import { LeadStatustype } from 'src/modules/lead/interfaces';
import { NotificationService } from '../../notification/services/notification.service';
import * as bcrypt from 'bcrypt';
import { Goal } from 'src/modules/settings/schemas/settings.schema';
@Global()
@Injectable({ scope: Scope.REQUEST })
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Lead.name) private readonly leadModel: Model<Lead>,
    @Inject(REQUEST) private readonly request: Request,
    private readonly notificationService: NotificationService,
    
  ) {}

  // Create a new user
  async createUser(user: UserDTO): Promise<User> {
    try {
      const userFound = await this.userModel.findOne({ email: user.email });
      if (userFound) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'El correo ya esta registrado',
        });
      }
      const createdUser = new this.userModel(user);
      return createdUser.save();
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }


  // Get all users
  async getAllUser(): Promise<User[]> {
    try {
      return await this.userModel.find();
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  // Get a user by ID
  async getUserById(id: string): Promise<User> {
    try {
      const user = await this.userModel.findById(id);
      return user;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  getUsersAsAdvisor(): Promise<User[]> {
    return this.userModel.find({ role: [Roles.ADVISOR, Roles.BANK_MANAGER, Roles.MANAGER], status: true });

  }

  // Get a user by email
  async getUserByEmail(email: string): Promise<User> {
    try {
      const user = await this.userModel.findOne({ email });
      if (!user) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: 'User not found',
        });
      }
      return user;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  // Update a user by ID
  async updateUserById(id: string, user: UserUpdateDTO): Promise<User> {
    try {
      await this.userExists(id);
      return await this.userModel.findByIdAndUpdate(id, user, {
        new: true,
      });
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async updateUserPassword(id: string, password: string): Promise<User> {
    try {
      const userFound = await this.userExists(id);
      const hashedPassword = bcrypt.hashSync(password, 10);
      userFound.password = hashedPassword;
      return await this.userModel.findByIdAndUpdate(id, userFound, {
        new: true,
      });
      
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }
  // Delete a user by ID
  async deleteUserById(id: string) {
    try {
      const userFound = await this.userExists(id);
      if (this.request.idUser === userFound._id) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No puedes eliminarte a ti mismo`',
        });
      }

      if (userFound.role === Roles.ADVISOR) {
        await this.leadModel.updateMany(
          { advisorID: userFound._id },
          { advisorID: null, status: LeadStatustype.TO_CALL },
        );
      } else if (userFound.role === Roles.MANAGER) {
        await this.leadModel.updateMany(
          { managerID: userFound._id },
          { managerID: null, status: LeadStatustype.TO_CALL },
        );
      } else if (userFound.role === Roles.BANK_MANAGER) {
        await this.leadModel.updateMany(
          { bankManagerID: userFound._id },
          {
            bankManagerID: null,
            status: LeadStatustype.TO_BUREAU_PREQUALIFIED,
          },
        );
      }
      await this.notificationService.deleteAllNotificationByUserId(userFound._id);
      return await this.userModel.findByIdAndDelete(id);
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  // Other operations

  // Get users by role
  async getUsersByRole(role: string): Promise<User[]> {
    try {
      return await this.userModel.find({ role, status: true });
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  // get the last advisor to assign a lead
  async getLastAdvisor(): Promise<User> {
    try {
      const advisors = await this.userModel
        .find({ role: 'ADVISOR', status: true })
        .sort({
          lastLead: 1,
        });
      return advisors[0];
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  // set the last advisor to assign a lead
  async setLastAdvisor(id: string): Promise<User> {
    try {
      const userFound = await this.userExists(id);
      userFound.lastLead = new Date();
      return await this.userModel.findByIdAndUpdate(id, userFound, {
        new: true,
      });
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  // toggle the status of a user
  async toggleStatus(id: string): Promise<User> {
    try {
      const userFound = await this.userExists(id);
      userFound.status = !userFound.status;
      return await this.userModel.findByIdAndUpdate(id, userFound, {
        new: true,
      });
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  // toggle auto assign
  async toggleAutoAssign(id: string) {
    try {
      const userFound = await this.userExists(id);
      userFound.settings.autoAssign = !userFound.settings.autoAssign;
      const updatedUser = await this.userModel.findByIdAndUpdate(
        id,
        userFound,
        {
          new: true,
        },
      );
      return {
        msg: 'Ha cambiado el estado de auto asignación',
        autoAssign: updatedUser.settings.autoAssign,
      };
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async toggleNotificationsSound(id: string) {
    try {
      const userFound = await this.userExists(id);
      userFound.settings.notificationsSound = !userFound.settings.notificationsSound;
      const updatedUser = await this.userModel.findByIdAndUpdate(
        id,
        userFound,
        {
          new: true,
        },
      );
      return {
        msg: 'Ha cambiado el estado de sonido de notificaciones',
        notificationsSound: updatedUser.settings.notificationsSound,
      };
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }
  async getUserSettings(id: string) {
    try {
      const userFound = await this.userExists(id);
      return userFound.settings;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async updateUserSettings(id: string, settings: any) {
    try {
      const userFound = await this.userExists(id);
      console.log(settings);

      userFound.settings = settings;
      return await this.userModel.findByIdAndUpdate(id, userFound, {
        new: true,
      });
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }


  async getUserAutoAssign(id: string) {
    try {
      const userFound = await this.getUserById(id);
      if (!userFound) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: 'User not found',
        });
      }
      return userFound.settings.autoAssign;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async userExists(id: string): Promise<User> {
    try {
      const userFound = await this.userModel.findById(id);
      if (!userFound) {
        throw new ErrorManager({
          type: 'NOT_FOUND',
          message: 'User not found',
        });
      }
      return userFound;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async userIsByRole(userFound: User, role: Roles): Promise<void> {
    try {
      if (userFound.role !== role) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'User is not by role',
        });
      }
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async getGoatInCompleted(userId: string, goal: Goal): Promise<boolean> {
    try {
      const userFound = await this.userExists(userId);
      const goalsCompleted = userFound.goalsCompleted??[] as Goal[];
      return goalsCompleted.find((g) => g._id === goal._id) ? true : false;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async setGoalForAdvisor(userId: string, goal:Goal, action: 'add' | 'remove') {
    try {
      const userFound = await this.userExists(userId);
      let goalsCompleted = userFound.goalsCompleted??[] as Goal[];
      const exist = await this.getGoatInCompleted(userId, goal);
      if (action === 'add') {;
        if(!exist){
          goalsCompleted.push(goal);
        }
      } else {
        
        if(exist){
          goalsCompleted = goalsCompleted.filter((g) => g._id !== goal._id);
        }
      }
     
      return  await this.userModel.findByIdAndUpdate(userId, { goalsCompleted }, {
        new: true,
      });
        } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  async setUserAvatar(userId: string, avatar: string) {
    try {
      const userFound = await this.userExists(userId);
      userFound.avatar = avatar;
      
      return await this.userModel.findByIdAndUpdate(userId, userFound, {
        new: true,
      });
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

}
