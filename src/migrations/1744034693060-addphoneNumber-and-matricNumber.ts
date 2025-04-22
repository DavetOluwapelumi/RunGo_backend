import { USER_INFORMATION } from "src/constants/tableNames";
import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddphoneNumberAndMatricNumber1744034693060 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(USER_INFORMATION, new TableColumn({
            name: 'phoneNumber',
            type: 'varchar',
            isNullable: true,
        }));
        await queryRunner.addColumn(USER_INFORMATION, new TableColumn({
            name: 'matricNumber',
            type: 'varchar',
            isNullable: false,
    }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn(USER_INFORMATION, 'matricNumber');
        await queryRunner.dropColumn(USER_INFORMATION, 'phoneNumber');
    }

}
