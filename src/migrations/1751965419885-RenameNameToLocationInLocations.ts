import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameNameToLocationInLocations1751965419885 implements MigrationInterface {
    name = 'RenameNameToLocationInLocations1751965419885'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "locations" RENAME COLUMN "name" TO "location"`);
        await queryRunner.query(`ALTER TABLE "locations" RENAME CONSTRAINT "UQ_227023051ab1fedef7a3b6c7e2a" TO "UQ_dbf41576612e74b0ec1f698c07d"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "locations" RENAME CONSTRAINT "UQ_dbf41576612e74b0ec1f698c07d" TO "UQ_227023051ab1fedef7a3b6c7e2a"`);
        await queryRunner.query(`ALTER TABLE "locations" RENAME COLUMN "location" TO "name"`);
    }

}
