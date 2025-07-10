import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { RideRequest } from '../../entities/rideRequest.entity';
import { DriverService } from '../../drivers/services/drivers.service';
import { UserService } from '../../users/services/users.service';
import { ulid } from 'ulid';
import { EmailService } from '../../services/email.service';
import { Notification } from '../../entities/notification.entity';

@Injectable()
export class RideRequestService {
    constructor(
        @InjectRepository(RideRequest)
        private readonly rideRequestRepository: Repository<RideRequest>,
        private readonly driverService: DriverService,
        private readonly userService: UserService,
        private readonly emailService: EmailService,
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
        private readonly configService: ConfigService,
    ) { }

    async createRideRequest(requestData: any): Promise<RideRequest> {
        const { userIdentifier, driverIdentifier, pickupLocation, destination, estimatedAmount } = requestData;

        // Validate user exists
        const user = await this.userService.findOneByIdentifier(userIdentifier);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Validate driver exists and is available
        const driver = await this.driverService.findOneByIdentifier(driverIdentifier);
        if (!driver) {
            throw new NotFoundException('Driver not found');
        }

        console.log(`🔍 Driver availability check - Driver: ${driverIdentifier}, isAvailable: ${driver.isAvailable}`);

        if (!driver.isAvailable) {
            throw new UnprocessableEntityException('Selected driver is not available');
        }

        // Get frontend base URL from environment
        const frontendBaseUrl = this.configService.get<string>('FRONTEND_BASE_URL') || 'http://localhost:3000';

        // Create ride request with unique identifier
        const rideRequest = this.rideRequestRepository.create({
            identifier: ulid(),
            userIdentifier,
            driverIdentifier,
            pickupLocation,
            destination,
            estimatedAmount,
            status: 'pending',
            createdAt: new Date(),
        });

        const savedRequest = await this.rideRequestRepository.save(rideRequest);

        // Send email to driver
        await this.emailService.sendRideRequestNotification(
            driver.email,
            driver.firstName,
            `${frontendBaseUrl}/driver-dashboard/rides`
        );

        // Save in-app notification for the driver
        await this.notificationRepository.save({
            userIdentifier: driver.identifier,
            type: 'ride-request',
            message: `You have a new ride request from ${user.firstName} ${user.lastName}.`,
            link: `${frontendBaseUrl}/driver-dashboard/rides`,
        });

        // Handle case where save returns an array
        if (Array.isArray(savedRequest)) {
            return savedRequest[0];
        }

        return savedRequest;
    }

    async findByIdentifier(identifier: string): Promise<RideRequest | null> {
        return await this.rideRequestRepository.findOne({ where: { identifier } });
    }

    async updateStatus(identifier: string, status: string): Promise<RideRequest> {
        console.log(`🔍 updateStatus called with identifier: ${identifier}, status: ${status}`);

        const rideRequest = await this.findByIdentifier(identifier);
        if (!rideRequest) {
            throw new NotFoundException('Ride request not found');
        }

        console.log(`🔍 Current ride request status: ${rideRequest.status}`);

        if (rideRequest.status !== 'pending') {
            throw new UnprocessableEntityException('Ride request has already been processed');
        }

        console.log(`🔍 Updating ride request to status: ${status}`);

        await this.rideRequestRepository.update(
            { identifier },
            {
                status,
                respondedAt: status !== 'pending' ? new Date() : null
            }
        );

        // Get frontend base URL from environment
        const frontendBaseUrl = this.configService.get<string>('FRONTEND_BASE_URL') || 'http://localhost:3000';

        // Update driver availability based on response
        if (status === 'accepted') {
            console.log(`🔍 Updating driver availability to false for driver: ${rideRequest.driverIdentifier}`);
            await this.driverService.updateDriverAvailability(rideRequest.driverIdentifier, false);

            // Notify user (in-app notification)
            await this.notificationRepository.save({
                userIdentifier: rideRequest.userIdentifier,
                type: 'ride-accepted',
                message: `Your ride request has been accepted by the driver.`,
                link: `${frontendBaseUrl}/user-dashboard/rides?tab=upcoming`,
            });

            // Notify user (email)
            const user = await this.userService.findOneByIdentifier(rideRequest.userIdentifier);
            if (user) {
                await this.emailService.sendRideRequestNotification(
                    user.email,
                    user.firstName,
                    `${frontendBaseUrl}/user-dashboard/rides`
                );
            }
        }

        const updatedRideRequest = await this.findByIdentifier(identifier);
        console.log(` Final ride request status: ${updatedRideRequest.status}`);

        return updatedRideRequest;
    }

    async getPendingRequestsForDriver(driverIdentifier: string, page: number = 1, limit: number = 10): Promise<{ data: RideRequest[], total: number, page: number, limit: number, hasMore: boolean }> {
        const skip = (page - 1) * limit;

        const [data, total] = await this.rideRequestRepository.findAndCount({
            where: {
                driverIdentifier,
                status: 'pending'
            },
            order: { createdAt: 'ASC' },
            skip,
            take: limit
        });

        // Fetch user details for each ride request
        const dataWithUser = await Promise.all(
            data.map(async (ride) => {
                const user = await this.userService.findOneByIdentifier(ride.userIdentifier);
                return {
                    ...ride,
                    user: user ? { firstName: user.firstName, lastName: user.lastName, email: user.email } : null,
                };
            })
        );

        return {
            data: dataWithUser,
            total,
            page,
            limit,
            hasMore: skip + limit < total
        };
    }

    async getRequestsForUser(userIdentifier: string, page: number = 1, limit: number = 10): Promise<{ data: RideRequest[], total: number, page: number, limit: number, hasMore: boolean }> {
        const skip = (page - 1) * limit;

        const [data, total] = await this.rideRequestRepository.findAndCount({
            where: { userIdentifier },
            order: { createdAt: 'DESC' },
            skip,
            take: limit
        });

        return {
            data,
            total,
            page,
            limit,
            hasMore: skip + limit < total
        };
    }
}