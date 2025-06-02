import { CAR_INFORMATION } from 'src/constants/tableNames';
import { BeforeInsert, Column, Entity, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { ulid } from 'ulid';
import Driver from './driver.entity';

@Entity(CAR_INFORMATION)
export default class Car {
  @PrimaryColumn()
  identifier: string;

  @Column()
  carName: string;

  @Column()
  carModel: string;

  @Column()
  capacity: number;

  @Column()
  carColor: string;

  @Column()
  carType: string;

  @Column()
  carPlateNumber: string;

  @Column()
  driverIdentifier: string;

  @Column()
  isVerified: boolean;

  @Column()
  availabilityStatus: string;

  @OneToOne(() => Driver, (driver) => driver.car, { onDelete: 'SET NULL' }) // One-to-One relationship
  @JoinColumn()
  driver: Driver;

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
  async setIdentifier() {
    this.identifier = ulid();
    this.isVerified = false;
    this.availabilityStatus = 'inactive';
  }
}
