import { USER_INFORMATION } from 'src/constants/tableNames';
import {
  BeforeInsert,
  Column,
  Entity,
  PrimaryColumn,
  OneToMany,
} from 'typeorm';
import { ulid } from 'ulid';
import { OtpEntity } from './otp.entity';
import Booking from './booking.entity';

@Entity(USER_INFORMATION)
export default class User {
  @PrimaryColumn()
  identifier: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  phoneNumber: string;

  @Column()
  password: string;

  @Column({ unique: true, nullable: true })
  matricNumber: string;

  @Column({ type: 'boolean', default: false })
  isStudent: boolean;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  dateAdded: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  lastUpdatedAt: Date;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ name: 'email_verified', type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ name: 'email_verified_at', type: 'timestamp', nullable: true })
  emailVerifiedAt: Date;

  id: string;

  @Column({ type: 'boolean', default: true }) // Add isActive property
  isActive: boolean;

  @Column({ nullable: true })
  profileImageUrl: string;

  @Column({ nullable: true })
  profileImagePath: string;

  // @Column({ nullable: true })
  // otpIdentifier: string;

  @OneToMany(() => Booking, (booking) => booking.identifier)
  bookings: Booking[];

  @BeforeInsert()
  async setDefaults() {
    this.identifier = ulid();
    this.dateAdded = new Date();
    this.lastUpdatedAt = new Date();
    // Only set verification defaults if not already explicitly set
    if (this.isVerified === undefined || this.isVerified === null) {
      this.isVerified = false;
    }
    if (this.emailVerified === undefined || this.emailVerified === null) {
      this.emailVerified = false;
    }
    // Ensure emailVerifiedAt is set if emailVerified is true
    if (this.emailVerified === true && !this.emailVerifiedAt) {
      this.emailVerifiedAt = new Date();
    }
  }
}
