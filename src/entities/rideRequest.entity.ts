import { Entity, PrimaryColumn, Column } from 'typeorm';

// src/entities/ride-request.entity.ts
@Entity('ride_requests')
export class RideRequest {
    @PrimaryColumn()
    identifier: string;

    @Column()
    userIdentifier: string;

    @Column()
    driverIdentifier: string;

    @Column()
    pickupLocation: string;

    @Column()
    destination: string;

    @Column()
    estimatedAmount: number;

    @Column({
        type: 'enum',
        enum: ['pending', 'accepted', 'rejected', 'expired'],
        default: 'pending'
    })
    status: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    respondedAt: Date;
}