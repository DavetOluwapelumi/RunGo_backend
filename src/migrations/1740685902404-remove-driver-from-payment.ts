import { PAYMENT_INFORMATION } from 'src/constants/tableNames';
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class RemoveDriverFromPayment1740685902404
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(PAYMENT_INFORMATION, 'driverIdentifier');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      PAYMENT_INFORMATION,
      new TableColumn({
        name: 'driverIdentifier',
        type: 'varchar',
      }),
    );
  }
}
