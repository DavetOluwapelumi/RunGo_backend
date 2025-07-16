import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1752631747435 implements MigrationInterface {
    name = ' $npmConfigName1752631747435'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bookings" ADD "userCompleteAcknowledged" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "driverCompleteAcknowledged" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "driverCompleteAcknowledged"`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "userCompleteAcknowledged"`);
    }

}
