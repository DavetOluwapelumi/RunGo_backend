import { PAYMENT_INFORMATION } from 'src/constants/tableNames';
import { PaymentMethod } from 'src/enums/paymentMethod';
import { BeforeInsert, Column, Entity, PrimaryColumn } from 'typeorm';
import { ulid } from 'ulid';

@Entity(PAYMENT_INFORMATION)
export default class Payment {
  @PrimaryColumn()
  identifier: string;

  @Column()
  userIdentifier: string;

  @Column({
    type: 'enum',
    enum: Object.values(PaymentMethod),
  })
  paymentMethod: string;

  @Column()
  amount: number;

  @Column()
  referenceNumber: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  transactionDate: Date;

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
    this.transactionDate = new Date();
    this.dateAdded = new Date();
    this.lastUpdatedAt = new Date();
  }
}
