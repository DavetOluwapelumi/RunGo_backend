import {
  BOOKING_INFORMATION,
  USER_INFORMATION,
} from 'src/constants/tableNames';
import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export class LinkBookingAndUserTables1740635828285
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createForeignKey(
      BOOKING_INFORMATION,
      new TableForeignKey({
        columnNames: ['userIdentifier'],
        referencedTableName: USER_INFORMATION,
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
        columnNames: ['userIdentifier'],
        referencedTableName: USER_INFORMATION,
        referencedColumnNames: ['identifier'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }
}
