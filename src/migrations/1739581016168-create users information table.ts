import { USER_INFORMATION } from 'src/constants/tableNames';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsersInformationTable1739581016168
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: USER_INFORMATION,
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
    await queryRunner.dropTable(USER_INFORMATION);
  }
}
