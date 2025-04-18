import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddOtpIdentifierToDriver1744978263384 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'drivers',
      new TableColumn({
        name: 'otpIdentifier',
        type: 'uuid',
        isNullable: true,
      }),
    );

    await queryRunner.createForeignKey(
      'drivers',
      new TableForeignKey({
        columnNames: ['otpIdentifier'],
        referencedColumnNames: ['id'],
        referencedTableName: 'otp',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('drivers');
    const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf('otpIdentifier') !== -1);
    await queryRunner.dropForeignKey('drivers', foreignKey);
    await queryRunner.dropColumn('drivers', 'otpIdentifier');
  }
}

