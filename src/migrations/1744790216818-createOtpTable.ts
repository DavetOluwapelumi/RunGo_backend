import { MigrationInterface, QueryRunner, Table, TableColumn } from "typeorm";

export class CreateOtpTable1744790216818 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
              name: 'otp',
              columns: [
                {
                  name: 'id',
                  type: 'uuid',
                  isPrimary: true,
                  generationStrategy: 'uuid',
                  default: 'uuid_generate_v4()',
                },
                {
                  name: 'identifier',
                  type: 'varchar',
                  isUnique: true,
                  length: '6',
                },
                {
                  name: 'validityPeriod',
                  type: 'bigint',
                },
                {
                  name: 'createdAt',
                  type: 'timestamp',
                  default: 'CURRENT_TIMESTAMP',
                },
                {
                  name: 'updatedAt',
                  type: 'timestamp',
                  default: 'CURRENT_TIMESTAMP',
                  onUpdate: 'CURRENT_TIMESTAMP',
                },
              ],
            }),
          );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('otp');
    }

}
