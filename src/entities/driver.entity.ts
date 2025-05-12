import { DRIVERS_INFORMATION } from 'src/constants/tableNames';
import { BeforeInsert, Column, Entity, PrimaryColumn } from 'typeorm';
import { ulid } from 'ulid';

@Entity(DRIVERS_INFORMATION)
export default class Driver {
  @PrimaryColumn()
  identifier: string;

  @Column({ nullable: true, type: 'varchar' })
  carIdentifier: string;

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

  @Column({ default: true }) // New column to track availability
  isAvailable: boolean;

  @Column({ type: 'int', default: 0 }) // New column to track completed rides
  completedRides: number;

  @Column({ type: 'float', default: 0 }) // New column to track average rating
  averageRating: number;

  @BeforeInsert()
  async setDefaults() {
    this.identifier = ulid();
    this.dateAdded = new Date();
    this.lastUpdatedAt = new Date();
    this.isVerified = false;
    this.isAvailable = false; // Default to available when a driver is created
  }
}