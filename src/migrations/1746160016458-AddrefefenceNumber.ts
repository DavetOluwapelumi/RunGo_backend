import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddReferenceNumberToPayment1746160016458
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'payment',
      new TableColumn({
        name: 'referenceNumber',
        type: 'varchar',
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('payment', 'referenceNumber');
  }
}
