import { CAR_INFORMATION } from 'src/constants/tableNames';
import { BeforeInsert, Column, Entity, PrimaryColumn } from 'typeorm';
import { ulid } from 'ulid';

@Entity(CAR_INFORMATION)
export default class Car {
  @PrimaryColumn()
  identifier: string;

  @Column()
  carName: string;

  @Column()
  carModel: string;

  @Column()
  carYear: number;

  @Column()
  carColor: string;

  @Column()
  carType: string;

  @Column()
  carPlateNumber: string;

  @Column()
  driverIdentifier: string;

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
  }
}
