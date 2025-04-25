import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AddOtpIdentifierToDriver1744978279980
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'admins',
      new TableColumn({
        name: 'otpIdentifier',
        type: 'uuid',
        isNullable: true,
      }),
    );

    await queryRunner.createForeignKey(
      'admins',
      new TableForeignKey({
        columnNames: ['otpIdentifier'],
        referencedColumnNames: ['id'],
        referencedTableName: 'otp',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('admins');
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('otpIdentifier') !== -1,
    );
    await queryRunner.dropForeignKey('admins', foreignKey);
    await queryRunner.dropColumn('admins', 'otpIdentifier');
  }
}
