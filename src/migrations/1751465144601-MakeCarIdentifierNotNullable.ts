import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeCarIdentifierNotNullable1751465144601 implements MigrationInterface {
    name = 'MakeCarIdentifierNotNullable1751465144601'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "drivers" ALTER COLUMN "carIdentifier" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "drivers" ALTER COLUMN "carIdentifier" DROP NOT NULL`);
    }

}
