import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddcolumnnisStudent1746536263637 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn('users', new TableColumn({
            name: 'isStudent',
            type: 'boolean',
            isNullable: false,
            default: false, // Default value for non-students
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('users', 'isStudent');
    }

}