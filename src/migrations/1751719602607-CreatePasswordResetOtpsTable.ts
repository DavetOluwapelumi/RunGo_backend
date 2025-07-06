import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePasswordResetOtpsTable1751719602607 implements MigrationInterface {
    name = 'CreatePasswordResetOtpsTable1751719602607'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "password_reset_otps" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(255) NOT NULL, "otp" character varying(6) NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "isUsed" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0b4f4c493a1ee383f93ff3a5017" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "drivers" ALTER COLUMN "carIdentifier" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "drivers" ALTER COLUMN "carIdentifier" SET DEFAULT 'UNKNOWN'`);
        await queryRunner.query(`DROP TABLE "password_reset_otps"`);
    }

}
