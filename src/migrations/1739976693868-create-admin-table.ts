import { ADMIN_INFORMATION } from 'src/constants/tableNames';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateAdminTable1739976693868 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: ADMIN_INFORMATION,
        columns: [
          {
            name: 'identifier',
            type: 'varchar',
            isPrimary: true,
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
    await queryRunner.dropTable(ADMIN_INFORMATION);
  }
}
