import { USER_INFORMATION } from 'src/constants/tableNames';
import { BeforeInsert, Column, Entity, PrimaryColumn, OneToMany } from 'typeorm';
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

  @Column({ unique: true })
  matricNumber: string;

  @Column({ type: "boolean", default: false })
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

  @Column()
  isVerified: boolean;
  id: string;

  @Column({ type: "boolean", default: true }) // Add isActive property
  isActive: boolean;

  // @Column({ nullable: true })
  // otpIdentifier: string;

  @OneToMany(() => Booking, (booking) => booking.identifier)
  bookings: Booking[];

  @BeforeInsert()
  async setDefaults() {
    this.identifier = ulid();
    this.dateAdded = new Date();
    this.lastUpdatedAt = new Date();
    this.isVerified = false;
    if (!this.matricNumber) {
      this.matricNumber = 'RUN/DEPT/DIGITS';
    }
  }
}
