import { DRIVERS_INFORMATION } from 'src/constants/tableNames';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateDriverTable1740345005948 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: DRIVERS_INFORMATION,
        columns: [
          {
            name: 'identifier',
            type: 'varchar',
            isPrimary: true,
          },
          {
            name: 'carIdentifier',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'firstName',
            type: 'varchar',
          },
          {
            name: 'lastName',
            type: 'varchar',
          },
          {
            name: 'email',
            type: 'varchar',
            isUnique: true,
          },

          {
            name: 'phoneNumber',
            type: 'varchar',
          },

          {
            name: 'password',
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
          {
            name: 'isVerified',
            type: 'boolean',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(DRIVERS_INFORMATION);
  }
}
