import { Controller, Get, Param, Patch, Body, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../entities/notification.entity';

@Controller({ version: '1', path: 'notifications' })
export class NotificationController {
    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
    ) { }

    @Get(':userIdentifier')
    async getNotifications(@Param('userIdentifier') userIdentifier: string) {
        return this.notificationRepository.find({
            where: { userIdentifier },
            order: { createdAt: 'DESC' },
        });
    }

    @Patch(':id/read')
    async markAsRead(@Param('id') id: string) {
        await this.notificationRepository.update(id, { isRead: true });
        return { message: 'Notification marked as read' };
    }

    @Post('test')
    async createTestNotification(
        @Body('userIdentifier') userIdentifier: string,
        @Body('message') message: string = 'Test notification',
        @Body('type') type: string = 'test',
        @Body('link') link?: string
    ) {
        const notif = await this.notificationRepository.save({
            userIdentifier,
            type,
            message,
            link,
        });
        return notif;
    }
} 