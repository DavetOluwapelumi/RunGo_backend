import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeMatricNumberNullable1751658800222 implements MigrationInterface {
    name = 'MakeMatricNumberNullable1751658800222'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "matricNumber" DROP NOT NULL`);

        // Handle drivers table carIdentifier column properly
        // First, update any null values to a default value
        await queryRunner.query(`UPDATE "drivers" SET "carIdentifier" = 'UNKNOWN' WHERE "carIdentifier" IS NULL`);

        // Then drop and recreate the column as NOT NULL
        await queryRunner.query(`ALTER TABLE "drivers" DROP COLUMN "carIdentifier"`);
        await queryRunner.query(`ALTER TABLE "drivers" ADD "carIdentifier" character varying NOT NULL DEFAULT 'UNKNOWN'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "drivers" DROP COLUMN "carIdentifier"`);
        await queryRunner.query(`ALTER TABLE "drivers" ADD "carIdentifier" character varying(255) NOT NULL DEFAULT 'UNKNOWN'`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "matricNumber" SET NOT NULL`);
    }

}
