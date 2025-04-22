import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm";

export class AddOtpIdentifierToUser1744978215495 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'users',
            new TableColumn({
                name: 'otpIdentifier',
                type: 'uuid',
                isNullable: true,
              }),
        );

        await queryRunner.createForeignKey(
            "users", new TableForeignKey({
                columnNames: ["otpIdentifier"],
                referencedColumnNames: ["id"],
                referencedTableName: "otp",
                onDelete: "SET NULL",
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("users");
        const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf('otpIdentifier') !== -1);
    await queryRunner.dropForeignKey('users', foreignKey);
    await queryRunner.dropColumn('users', 'otpIdentifier');
    }

}
