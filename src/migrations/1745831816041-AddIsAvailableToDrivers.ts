import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddIsAvailableToDrivers1745831816041 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'drivers',
      new TableColumn({
        name: 'isAvailable',
        type: 'boolean',
        default: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('drivers', 'isAvailable');
  }
}