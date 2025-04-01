import { DRIVERS_INFORMATION } from 'src/constants/tableNames';
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AkeCaridentifierNullableInDriver1743506325379
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      DRIVERS_INFORMATION,
      'carIdentifier',
      new TableColumn({
        name: 'carIdentifier',
        type: 'varchar',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      DRIVERS_INFORMATION,
      'carIdentifier',
      new TableColumn({
        name: 'carIdentifier',
        type: 'varchar',
        isNullable: false,
      }),
    );
  }
}
