import { time } from 'console';
import { timestamp } from 'rxjs';
import { BOOKING_INFORMATION } from 'src/constants/tableNames';
import { BookingStatus } from 'src/enums/bookingStatus';
import { BeforeInsert, Column, Entity, PrimaryColumn } from 'typeorm';
import { ulid } from 'ulid';

@Entity(BOOKING_INFORMATION)
export default class Booking {
  @PrimaryColumn()
  identifier: string;

  @Column()
  userIdentifier: string;

  @Column()
  driverIdentifier: string;

  @Column()
  paymentIdentifier: string;

  @Column()
  pickupLocation: string;

  @Column()
  destination: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  pickupTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  dropoffTime: Date;

  @Column({
    type: 'enum',
    enum: Object.values(BookingStatus),
    default: `'${BookingStatus.PENDING}'`,
  })
  status: string;

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

  @BeforeInsert()
  private async setIdentifier() {
    this.identifier = ulid();
  }
}
