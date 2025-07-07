import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateTempDriverRegistrationsTable1751840249359 implements MigrationInterface {
    name = 'CreateTempDriverRegistrationsTable1751840249359'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temp_driver_registrations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(255) NOT NULL, "firstName" character varying(255) NOT NULL, "lastName" character varying(255) NOT NULL, "phoneNumber" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, "carIdentifier" character varying(255) NOT NULL, "otp" character varying(6) NOT NULL, "expires_at" TIMESTAMP NOT NULL, "used" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_temp_driver_registrations" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_temp_driver_registrations_email" ON "temp_driver_registrations" ("email") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_temp_driver_registrations_email"`);
        await queryRunner.query(`DROP TABLE "temp_driver_registrations"`);
    }
} 