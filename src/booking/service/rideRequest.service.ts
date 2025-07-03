import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RideRequest } from '../../entities/rideRequest.entity';
import { DriverService } from '../../drivers/services/drivers.service';
import { UserService } from '../../users/services/users.service';
import { ulid } from 'ulid';

@Injectable()
export class RideRequestService {
    constructor(
        @InjectRepository(RideRequest)
        private readonly rideRequestRepository: Repository<RideRequest>,
        private readonly driverService: DriverService,
        private readonly userService: UserService,
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

        // Update driver availability based on response
        if (status === 'accepted') {
            console.log(`🔍 Updating driver availability to false for driver: ${rideRequest.driverIdentifier}`);
            await this.driverService.updateDriverAvailability(rideRequest.driverIdentifier, false);
        }

        const updatedRideRequest = await this.findByIdentifier(identifier);
        console.log(`🔍 Final ride request status: ${updatedRideRequest.status}`);

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

        return {
            data,
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