import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStatusToWalletTransaction1752483614691 implements MigrationInterface {
    name = 'AddStatusToWalletTransaction1752483614691'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wallet_transactions" ADD "status" character varying NOT NULL DEFAULT 'success'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wallet_transactions" DROP COLUMN "status"`);
    }

}
