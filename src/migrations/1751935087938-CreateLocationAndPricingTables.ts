import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateLocationAndPricingTables1751935087938 implements MigrationInterface {
    name = 'CreateLocationAndPricingTables1751935087938'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wallet_transactions" DROP CONSTRAINT "FK_8a94d9d61a2b05123710b325fbf"`);
        await queryRunner.query(`ALTER TABLE "wallets" DROP CONSTRAINT "FK_2ecdb33f23e9a6fc392025c0b97"`);
        await queryRunner.query(`ALTER TABLE "wallets" DROP CONSTRAINT "FK_8ab3f6f03a8606508d85298a4c9"`);
        await queryRunner.query(`CREATE TABLE "locations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_227023051ab1fedef7a3b6c7e2a" UNIQUE ("name"), CONSTRAINT "PK_7cc1c9e3853b94816c094825e74" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "location_pricing" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "pickupLocationId" uuid NOT NULL, "dropoffLocationId" uuid NOT NULL, "price" numeric(10,2) NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f0ce10888e467c5878eee51d1d1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "wallets" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "wallets" DROP COLUMN "driverId"`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" ALTER COLUMN "createdAt" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" ALTER COLUMN "lastUpdatedAt" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" ALTER COLUMN "walletId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" ADD CONSTRAINT "FK_8a94d9d61a2b05123710b325fbf" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallets" ADD CONSTRAINT "FK_9e4120ca75dc7b80a8be62a17e0" FOREIGN KEY ("userIdentifier") REFERENCES "users"("identifier") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallets" ADD CONSTRAINT "FK_c07612e044325812d70df013c0d" FOREIGN KEY ("driverIdentifier") REFERENCES "drivers"("identifier") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "location_pricing" ADD CONSTRAINT "FK_1196ff6430076d9491c195255f5" FOREIGN KEY ("pickupLocationId") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "location_pricing" ADD CONSTRAINT "FK_c137d5199574f56b893ca36167e" FOREIGN KEY ("dropoffLocationId") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "location_pricing" DROP CONSTRAINT "FK_c137d5199574f56b893ca36167e"`);
        await queryRunner.query(`ALTER TABLE "location_pricing" DROP CONSTRAINT "FK_1196ff6430076d9491c195255f5"`);
        await queryRunner.query(`ALTER TABLE "wallets" DROP CONSTRAINT "FK_c07612e044325812d70df013c0d"`);
        await queryRunner.query(`ALTER TABLE "wallets" DROP CONSTRAINT "FK_9e4120ca75dc7b80a8be62a17e0"`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" DROP CONSTRAINT "FK_8a94d9d61a2b05123710b325fbf"`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" ALTER COLUMN "walletId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" ALTER COLUMN "lastUpdatedAt" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "wallets" ADD "driverId" character varying`);
        await queryRunner.query(`ALTER TABLE "wallets" ADD "userId" character varying`);
        await queryRunner.query(`DROP TABLE "location_pricing"`);
        await queryRunner.query(`DROP TABLE "locations"`);
        await queryRunner.query(`ALTER TABLE "wallets" ADD CONSTRAINT "FK_8ab3f6f03a8606508d85298a4c9" FOREIGN KEY ("driverId") REFERENCES "drivers"("identifier") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallets" ADD CONSTRAINT "FK_2ecdb33f23e9a6fc392025c0b97" FOREIGN KEY ("userId") REFERENCES "users"("identifier") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallet_transactions" ADD CONSTRAINT "FK_8a94d9d61a2b05123710b325fbf" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
