import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Location } from './location.entity';
import { CarType } from '../enums/carType.enum';

@Entity('location_pricing')
@Unique(['pickupLocationId', 'dropoffLocationId', 'carType'])
export class LocationPricing {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    pickupLocationId: string;

    @Column()
    dropoffLocationId: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: 'enum', enum: CarType })
    carType: CarType;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Location, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'pickupLocationId' })
    pickupLocation: Location;

    @ManyToOne(() => Location, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'dropoffLocationId' })
    dropoffLocation: Location;
} 