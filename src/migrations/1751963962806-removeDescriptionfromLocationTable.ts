import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveDescriptionfromLocationTable1751963962806 implements MigrationInterface {
    name = 'RemoveDescriptionfromLocationTable1751963962806'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "locations" DROP COLUMN "description"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "locations" ADD "description" character varying`);
    }

}
