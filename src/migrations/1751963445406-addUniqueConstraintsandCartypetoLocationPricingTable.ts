import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniqueConstraintsandCartypetoLocationPricingTable1751963445406 implements MigrationInterface {
    name = 'AddUniqueConstraintsandCartypetoLocationPricingTable1751963445406'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."location_pricing_cartype_enum" AS ENUM('keke', 'shuttle', 'camry', 'sienna')`);
        await queryRunner.query(`ALTER TABLE "location_pricing" ADD "carType" "public"."location_pricing_cartype_enum"`);
        await queryRunner.query(`UPDATE "location_pricing" SET "carType" = 'keke' WHERE "carType" IS NULL`);
        await queryRunner.query(`ALTER TABLE "location_pricing" ALTER COLUMN "carType" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "location_pricing" ADD CONSTRAINT "UQ_0aae38fc71085070a7ee11ef8bc" UNIQUE ("pickupLocationId", "dropoffLocationId", "carType")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "location_pricing" DROP CONSTRAINT "UQ_0aae38fc71085070a7ee11ef8bc"`);
        await queryRunner.query(`ALTER TABLE "location_pricing" DROP COLUMN "carType"`);
        await queryRunner.query(`DROP TYPE "public"."location_pricing_cartype_enum"`);
    }

}
