import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Index,
} from 'typeorm';

@Entity('temp_driver_registrations')
export class TempDriverRegistration {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    @Index()
    email: string;

    @Column({ type: 'varchar', length: 255 })
    firstName: string;

    @Column({ type: 'varchar', length: 255 })
    lastName: string;

    @Column({ type: 'varchar', length: 255 })
    phoneNumber: string;

    @Column({ type: 'varchar', length: 255 })
    password: string;

    @Column({ type: 'varchar', length: 255 })
    carIdentifier: string;

    @Column({ type: 'varchar', length: 6 })
    otp: string;

    @Column({ name: 'expires_at', type: 'timestamp' })
    expiresAt: Date;

    @Column({ type: 'boolean', default: false })
    used: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
} 