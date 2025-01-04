import { Inject, Injectable, Scope, forwardRef } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Notification } from "../schema/notification.schema";
import { INotification } from "../interface/notification.interface";
import { ErrorManager } from "src/utils/error.manager";
import { UsersService } from "src/modules/users/services/users.service";
import { Request } from "express";
import { Lead } from "src/modules/lead/schemas/lead.schemas";
@Injectable({ scope: Scope.REQUEST })
export class NotificationService {
    constructor(@InjectModel(Notification.name) private readonly notificationModel: Model<Notification>,
    @Inject(forwardRef(() => UsersService))
        private readonly usersService: UsersService,
        @Inject('REQUEST') private readonly request: Request
    ) { }

    async sendNotification(notification: INotification): Promise<Notification> {
        return await this.notificationModel.create(notification)
    }

    async sendNotificationToAll(notification: INotification): Promise<Notification[]> {
        try {
            const users = await this.usersService.getAllUser()
            const notifications = []
            for (const user of users) {
                notifications.push(await this.notificationModel.create({ ...notification, userID: user._id }))
            }
            return Promise.all(notifications)
        } catch (error) {
            throw ErrorManager.createSignatureError(error.message)
        }
    }

    async sendNotificationToAdmin(notification: INotification): Promise<Notification[]> {
        try {
            const users = await this.usersService.getAllUser()
            const notifications = []
            for (const user of users) {
                if (user.role === 'ADMIN') {
                    notifications.push(await this.notificationModel.create({ ...notification, userID: user._id }))
                }
            }
            return Promise.all(notifications)
        } catch (error) {
            throw ErrorManager.createSignatureError(error.message)
        }
    }

    async sendNotificationToInvolved(notification: INotification, leadFound: Lead): Promise<void> {
        try {
            if(leadFound.advisorID){
                await this.sendNotification({ ...notification, userID: leadFound.advisorID })
            }
            if(leadFound.managerID){
                await this.sendNotification({ ...notification, userID: leadFound.managerID })
            }
            if(leadFound.bankManagerID){
                await this.sendNotification({ ...notification, userID: leadFound.bankManagerID })
            }
            await this.sendNotificationToAdmin(notification)

            
        } catch (error) {
            throw ErrorManager.createSignatureError(error.message)
        }
    }

    async sendNotificationByRole(notification: INotification, role: string[]): Promise<Notification[]> {
        try {
            const users = await this.usersService.getAllUser()
            const notifications = []
            for (const user of users) {
                if (role.includes(user.role)) {
                    notifications.push(await this.notificationModel.create({ ...notification, userID: user._id }))
                }
            }
            return Promise.all(notifications)
        } catch (error) {
            throw ErrorManager.createSignatureError(error.message)
        }
    }
    async getNotificationById(id: string): Promise<Notification> {
        try {
            return this.notificationModel.findById(id)
        } catch (error) {
            throw ErrorManager.createSignatureError(error.message)
        }
    }



    async getNotificationByUserId(count: number, page: number): Promise<Notification[]> {
        try {
            const { idUser } = this.request
            const startIndex = (page - 1) * count
            return this.notificationModel.find({ userID: idUser }).sort({ createdAt: -1 }).skip(startIndex).limit(count)
        } catch (error) {
            throw ErrorManager.createSignatureError(error.message)
        }
    }

    async readAllNotification(): Promise<void> {
        try {
            const { idUser } = this.request
            await this.notificationModel.updateMany({ userID: idUser }, { read: true })
        } catch (error) {
            throw ErrorManager.createSignatureError(error.message)
        }
    }

    async readNotification(id: string): Promise<void> {
        try {
            await this.notificationModel.findByIdAndUpdate(id, { read: true })
        } catch (error) {
            throw ErrorManager.createSignatureError(error.message)
        }
    }

    async deleteAllNotificationByLeadId(id: string): Promise<void> {
        try {
            await this.notificationModel.deleteMany({ leadID: id })
        } catch (error) {
            throw ErrorManager.createSignatureError(error.message)
        }
    }

    async deleteAllNotificationByUserId(id: string): Promise<void> {
        try {
            await this.notificationModel.deleteMany({ userID: id })
        } catch (error) {
            throw ErrorManager.createSignatureError(error.message)
        }
    }

    async deleteNotification(id: string) {
        try {
            return this.notificationModel.findByIdAndDelete(id)
        } catch (error) {
            throw ErrorManager.createSignatureError(error.message)
        }
    }

    async deleteAllNotification(): Promise<void> {
        try {
            const { idUser } = this.request
            await this.notificationModel.deleteMany({ userID: idUser })
        } catch (error) {
            throw ErrorManager.createSignatureError(error.message)
        }
    }
}