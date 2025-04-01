import { DRIVERS_INFORMATION } from 'src/constants/tableNames';
import { BeforeInsert, Column, Entity, PrimaryColumn } from 'typeorm';
import { ulid } from 'ulid';

@Entity(DRIVERS_INFORMATION)
export default class Driver {
  @PrimaryColumn()
  identifier: string;

  @Column({nullable: true, type: "varchar"})
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
  id: string;

  @BeforeInsert()
  async setIdentifier() {
    this.identifier = ulid();
  }
}
