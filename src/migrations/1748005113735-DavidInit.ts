import { MigrationInterface, QueryRunner } from "typeorm";

export class DavidInit1748005113735 implements MigrationInterface {
    name = 'DavidInit1748005113735'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."bookings_status_enum" AS ENUM('pending', 'accepted', 'rejected', 'cancelled', 'completed', 'in_progress')`);
        await queryRunner.query(`CREATE TABLE "bookings" ("identifier" character varying NOT NULL, "userIdentifier" character varying NOT NULL, "carIdentifier" character varying NOT NULL, "driverIdentifier" character varying NOT NULL, "paymentIdentifier" character varying NOT NULL, "pickupLocation" character varying NOT NULL, "destination" character varying NOT NULL, "pickupTime" TIMESTAMP NOT NULL DEFAULT now(), "dropoffTime" TIMESTAMP, "status" "public"."bookings_status_enum" NOT NULL DEFAULT 'pending', "dateAdded" TIMESTAMP NOT NULL DEFAULT now(), "lastUpdatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7e275a09f4a92d70b289fb0e28c" PRIMARY KEY ("identifier"))`);
        await queryRunner.query(`CREATE TABLE "users" ("identifier" character varying NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "email" character varying NOT NULL, "phoneNumber" character varying NOT NULL, "password" character varying NOT NULL, "matricNumber" character varying NOT NULL, "isStudent" boolean NOT NULL DEFAULT false, "dateAdded" TIMESTAMP NOT NULL DEFAULT now(), "lastUpdatedAt" TIMESTAMP NOT NULL DEFAULT now(), "isVerified" boolean NOT NULL, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_77810a8594627ce3d93d658b5eb" UNIQUE ("matricNumber"), CONSTRAINT "PK_2e7b7debda55e0e7280dc93663d" PRIMARY KEY ("identifier"))`);
        await queryRunner.query(`CREATE TYPE "public"."payment_paymentmethod_enum" AS ENUM('cash', 'card', 'bank_transfer')`);
        await queryRunner.query(`CREATE TABLE "payment" ("identifier" character varying NOT NULL, "userIdentifier" character varying NOT NULL, "paymentMethod" "public"."payment_paymentmethod_enum" NOT NULL, "amount" integer NOT NULL, "driverIdentifier" character varying NOT NULL, "referenceNumber" character varying NOT NULL, "transactionDate" TIMESTAMP NOT NULL DEFAULT now(), "dateAdded" TIMESTAMP NOT NULL DEFAULT now(), "lastUpdatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a2ec03afd40d314c59774756ff8" PRIMARY KEY ("identifier"))`);
        await queryRunner.query(`CREATE TABLE "otp" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "identifier" character varying(6) NOT NULL, "token" character varying(6) NOT NULL, "validityPeriod" bigint NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_fac927b397636677ced81d9a830" UNIQUE ("identifier"), CONSTRAINT "PK_32556d9d7b22031d7d0e1fd6723" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cars" ("identifier" character varying NOT NULL, "carName" character varying NOT NULL, "carModel" character varying NOT NULL, "capacity" integer NOT NULL, "carColor" character varying NOT NULL, "carType" character varying NOT NULL, "carPlateNumber" character varying NOT NULL, "driverIdentifier" character varying NOT NULL, "isVerified" boolean NOT NULL, "availabilityStatus" character varying NOT NULL, "dateAdded" TIMESTAMP NOT NULL DEFAULT now(), "lastUpdatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_6a8860e32f28121f2d9d65b54b" UNIQUE ("driverIdentifier"), CONSTRAINT "PK_0013ab14af9d810599881671eb9" PRIMARY KEY ("identifier"))`);
        await queryRunner.query(`CREATE TABLE "drivers" ("identifier" character varying NOT NULL, "carIdentifier" character varying, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "email" character varying NOT NULL, "phoneNumber" character varying NOT NULL, "password" character varying NOT NULL, "dateAdded" TIMESTAMP NOT NULL DEFAULT now(), "lastUpdatedAt" TIMESTAMP NOT NULL DEFAULT now(), "isVerified" boolean NOT NULL, "isAvailable" boolean NOT NULL DEFAULT true, "completedRides" integer NOT NULL DEFAULT '0', "averageRating" double precision NOT NULL DEFAULT '0', CONSTRAINT "PK_80b3d519e113cb0923dc466f43d" PRIMARY KEY ("identifier"))`);
        await queryRunner.query(`CREATE TABLE "admins" ("identifier" character varying NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "dateAdded" TIMESTAMP NOT NULL DEFAULT now(), "lastUpdatedAt" TIMESTAMP NOT NULL DEFAULT now(), "isVerified" boolean NOT NULL, CONSTRAINT "PK_b23d1f2dddabe511f61768194bb" PRIMARY KEY ("identifier"))`);
        await queryRunner.query(`ALTER TABLE "cars" ADD CONSTRAINT "FK_6a8860e32f28121f2d9d65b54bd" FOREIGN KEY ("driverIdentifier") REFERENCES "drivers"("identifier") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cars" DROP CONSTRAINT "FK_6a8860e32f28121f2d9d65b54bd"`);
        await queryRunner.query(`DROP TABLE "admins"`);
        await queryRunner.query(`DROP TABLE "drivers"`);
        await queryRunner.query(`DROP TABLE "cars"`);
        await queryRunner.query(`DROP TABLE "otp"`);
        await queryRunner.query(`DROP TABLE "payment"`);
        await queryRunner.query(`DROP TYPE "public"."payment_paymentmethod_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "bookings"`);
        await queryRunner.query(`DROP TYPE "public"."bookings_status_enum"`);
    }

}
