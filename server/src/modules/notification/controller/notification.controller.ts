import { Controller, Delete, Get, Param, Put, Query, UseGuards } from "@nestjs/common";
import { ApiHeader, ApiTags } from "@nestjs/swagger";
import { NotificationService } from "../services/notification.service";
import { AuthGuard } from "src/modules/auth/guards";

@ApiTags('Notifications')
@ApiHeader({ name: 'authorization', description: 'Bearer token' })
@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    @Get()
    async getNotificationsByUserId(@Query('count') count: string, @Query('page') page: string) {
        return await this.notificationService.getNotificationByUserId(+count, +page);
    }

    @Put(':id')
    async readNotificationById(@Param('id') id: string) {
        return await this.notificationService.readNotification(id);
    }

    @Put()
    async readAllNotifications() {
        return this.notificationService.readAllNotification();
    }

    @Delete()
    async deleteAllNotifications() {
        return this.notificationService.deleteAllNotification();
    }
}