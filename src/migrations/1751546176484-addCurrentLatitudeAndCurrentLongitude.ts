import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCurrentLatitudeAndCurrentLongitude1751546176484 implements MigrationInterface {
    name = 'AddCurrentLatitudeAndCurrentLongitude1751546176484'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "drivers" ADD COLUMN IF NOT EXISTS "currentLatitude" double precision`);
        await queryRunner.query(`ALTER TABLE "drivers" ADD COLUMN IF NOT EXISTS "currentLongitude" double precision`);
        // Ensure carIdentifier exists and is nullable
        await queryRunner.query(`ALTER TABLE "drivers" ALTER COLUMN "carIdentifier" DROP NOT NULL`);
        // Set all NULLs to 'UNKNOWN'
        await queryRunner.query(`UPDATE "drivers" SET "carIdentifier" = 'UNKNOWN' WHERE "carIdentifier" IS NULL`);
        // Now set NOT NULL constraint
        await queryRunner.query(`ALTER TABLE "drivers" ALTER COLUMN "carIdentifier" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "drivers" ALTER COLUMN "carIdentifier" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "drivers" DROP COLUMN IF EXISTS "currentLongitude"`);
        await queryRunner.query(`ALTER TABLE "drivers" DROP COLUMN IF EXISTS "currentLatitude"`);
    }
}
