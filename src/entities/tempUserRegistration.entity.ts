import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Index,
} from 'typeorm';

@Entity('temp_user_registrations')
export class TempUserRegistration {
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

    @Column({ type: 'boolean', default: false })
    isStudent: boolean;

    @Column({ type: 'varchar', length: 255, nullable: true })
    matricNumber: string;

    @Column({ type: 'varchar', length: 6 })
    otp: string;

    @Column({ name: 'expires_at', type: 'timestamp' })
    expiresAt: Date;

    @Column({ type: 'boolean', default: false })
    used: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
} 