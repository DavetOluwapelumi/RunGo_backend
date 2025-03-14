import {
  BOOKING_INFORMATION,
  PAYMENT_INFORMATION,
} from 'src/constants/tableNames';
import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export class LinkBookingAndPaymentTables1740635510631
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createForeignKey(
      BOOKING_INFORMATION,
      new TableForeignKey({
        columnNames: ['paymentIdentifier'],
        referencedTableName: PAYMENT_INFORMATION,
        referencedColumnNames: ['identifier'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      BOOKING_INFORMATION,
      new TableForeignKey({
        columnNames: ['paymentIdentifier'],
        referencedTableName: PAYMENT_INFORMATION,
        referencedColumnNames: ['identifier'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }
}
