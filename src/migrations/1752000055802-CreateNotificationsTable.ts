import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNotificationsTable1752000055802 implements MigrationInterface {
    name = 'CreateNotificationsTable1752000055802'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userIdentifier" character varying NOT NULL, "type" character varying NOT NULL, "message" character varying NOT NULL, "link" character varying, "isRead" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "notifications"`);
    }

}
