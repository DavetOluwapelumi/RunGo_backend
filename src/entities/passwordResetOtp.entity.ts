import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    BeforeInsert,
} from 'typeorm';

@Entity('password_reset_otps')
export class PasswordResetOtpEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    email: string;

    @Column({ type: 'varchar', length: 6 })
    otp: string;

    @Column({ type: 'timestamp' })
    expiresAt: Date;

    @Column({ type: 'boolean', default: false })
    isUsed: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @BeforeInsert()
    setDefaults() {
        // Generate 6-digit numeric OTP
        this.otp = Math.floor(100000 + Math.random() * 900000).toString();
        // Set expiration to 10 minutes from now
        this.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    }
} 