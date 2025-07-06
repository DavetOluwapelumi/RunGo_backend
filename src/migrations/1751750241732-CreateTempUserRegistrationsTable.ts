import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTempUserRegistrationsTable1751750241732 implements MigrationInterface {
    name = 'CreateTempUserRegistrationsTable1751750241732'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "temp_user_registrations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(255) NOT NULL, "firstName" character varying(255) NOT NULL, "lastName" character varying(255) NOT NULL, "phoneNumber" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, "isStudent" boolean NOT NULL DEFAULT false, "matricNumber" character varying(255), "otp" character varying(6) NOT NULL, "expires_at" TIMESTAMP NOT NULL, "used" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6ed098b00a940f6aa06640d8fde" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_80ef1591f53643020a6fc8eb32" ON "temp_user_registrations" ("email") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_80ef1591f53643020a6fc8eb32"`);
        await queryRunner.query(`DROP TABLE "temp_user_registrations"`);
    }

}
