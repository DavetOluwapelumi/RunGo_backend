import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRideRequestsTable1751511578118 implements MigrationInterface {
    name = 'CreateRideRequestsTable1751511578118'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."ride_requests_status_enum" AS ENUM('pending', 'accepted', 'rejected', 'expired')`);
        await queryRunner.query(`CREATE TABLE "ride_requests" ("identifier" character varying NOT NULL, "userIdentifier" character varying NOT NULL, "driverIdentifier" character varying NOT NULL, "pickupLocation" character varying NOT NULL, "destination" character varying NOT NULL, "estimatedAmount" integer NOT NULL, "status" "public"."ride_requests_status_enum" NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "respondedAt" TIMESTAMP, CONSTRAINT "PK_23c49c7bb92fa212512d1fa1b33" PRIMARY KEY ("identifier"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "ride_requests"`);
        await queryRunner.query(`DROP TYPE "public"."ride_requests_status_enum"`);
    }
}
