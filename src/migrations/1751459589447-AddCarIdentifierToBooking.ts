import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCarIdentifierToBooking1751459589447 implements MigrationInterface {
    name = 'AddCarIdentifierToBooking1751459589447'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_d9775d11f2843629523c7a7a74c"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_f7bf87a0ecf2dda53b56d34c832"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_eec725013f94d43e566a6fa5031"`);
        await queryRunner.query(`ALTER TABLE "payment" ADD "driverIdentifier" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "carIdentifier" character varying NOT NULL`);
        await queryRunner.query(`ALTER TYPE "public"."payment_paymentmethod_enum" RENAME TO "payment_paymentmethod_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."payment_paymentmethod_enum" AS ENUM('cash', 'wallet')`);
        await queryRunner.query(`ALTER TABLE "payment" ALTER COLUMN "paymentMethod" TYPE "public"."payment_paymentmethod_enum" USING "paymentMethod"::"text"::"public"."payment_paymentmethod_enum"`);
        await queryRunner.query(`DROP TYPE "public"."payment_paymentmethod_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."payment_paymentmethod_enum_old" AS ENUM('cash', 'card', 'bank_transfer')`);
        await queryRunner.query(`ALTER TABLE "payment" ALTER COLUMN "paymentMethod" TYPE "public"."payment_paymentmethod_enum_old" USING "paymentMethod"::"text"::"public"."payment_paymentmethod_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."payment_paymentmethod_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."payment_paymentmethod_enum_old" RENAME TO "payment_paymentmethod_enum"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "carIdentifier"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "driverIdentifier"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_eec725013f94d43e566a6fa5031" FOREIGN KEY ("userIdentifier") REFERENCES "users"("identifier") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_f7bf87a0ecf2dda53b56d34c832" FOREIGN KEY ("driverIdentifier") REFERENCES "drivers"("identifier") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_d9775d11f2843629523c7a7a74c" FOREIGN KEY ("paymentIdentifier") REFERENCES "payment"("identifier") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
