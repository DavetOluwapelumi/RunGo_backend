import {
  BOOKING_INFORMATION,
  DRIVERS_INFORMATION,
} from 'src/constants/tableNames';
import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export class LinkBookingAndDriverTables1740635816866
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createForeignKey(
      BOOKING_INFORMATION,
      new TableForeignKey({
        columnNames: ['driverIdentifier'],
        referencedTableName: DRIVERS_INFORMATION,
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
        columnNames: ['driverIdentifier'],
        referencedTableName: DRIVERS_INFORMATION,
        referencedColumnNames: ['identifier'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }
}
