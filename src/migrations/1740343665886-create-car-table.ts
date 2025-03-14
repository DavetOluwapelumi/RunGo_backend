import { CAR_INFORMATION } from 'src/constants/tableNames';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateCarTable1740343665886 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.createTable(
      new Table({
        name: CAR_INFORMATION,
        columns: [
          {
            name: 'identifier',
            type: 'varchar',
            isPrimary: true,
          },
          {
            name: 'carName',
            type: 'varchar',
          },
          {
            name: 'carModel',
            type: 'varchar',
          },
          {
            name: 'carYear',
            type: 'int',
          },
          {
            name: 'carColor',
            type: 'varchar',
          },
          {
            name: 'carType',
            type: 'varchar',
          },
          {
            name: 'carPlateNumber',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'driverIdentifier',
            type: 'varchar',
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
    queryRunner.dropTable(CAR_INFORMATION, true);
  }
}
