import { BOOKING_INFORMATION } from 'src/constants/tableNames';
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class RemoveCaridentifierFromBooking1740635388765
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(BOOKING_INFORMATION, 'carIdentifier');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      BOOKING_INFORMATION,
      new TableColumn({
        name: 'carIdentifier',
        type: 'varchar',
      }),
    );
  }
}
