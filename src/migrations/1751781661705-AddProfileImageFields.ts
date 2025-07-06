import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProfileImageFields1751781661705 implements MigrationInterface {
    name = 'AddProfileImageFields1751781661705'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "profileImageUrl" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "profileImagePath" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "profileImagePath"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "profileImageUrl"`);
    }

}
