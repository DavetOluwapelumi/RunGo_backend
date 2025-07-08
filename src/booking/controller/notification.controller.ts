import { Controller, Get, Param, Patch } from '@nestjs/common';
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
} 