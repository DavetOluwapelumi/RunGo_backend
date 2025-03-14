import { PAYMENT_INFORMATION } from 'src/constants/tableNames';
import { PaymentMethod } from 'src/enums/paymentMethod';
import { PaymentStatus } from 'src/enums/paymentStatus';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreatePaymentTable1740344596354 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.createTable(
      new Table({
        name: PAYMENT_INFORMATION,
        columns: [
          {
            name: 'identifier',
            type: 'varchar',
            isPrimary: true,
          },
          {
            name: 'userIdentifier',
            type: 'varchar',
          },
          {
            name: 'driverIdentifier',
            type: 'varchar',
          },

          {
            name: 'paymentMethod',
            type: 'enum',
            enum: Object.values(PaymentMethod),
          },
          {
            name: 'paymentStatus',
            type: 'enum',
            enum: Object.values(PaymentStatus),
            default: `'${PaymentStatus.PENDING}'`,
          },
          {
            name: 'amount',
            type: 'int',
          },
          {
            name: 'transactionDate',
            type: 'date',
          },
          {
            name: 'dateAdded',
            type: 'date',
          },
          {
            name: 'lastUpdatedAt',
            type: 'date',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(PAYMENT_INFORMATION);
  }
}
