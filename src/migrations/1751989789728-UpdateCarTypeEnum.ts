import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateCarTypeEnum1751989789728 implements MigrationInterface {
    name = 'UpdateCarTypeEnum1751989789728'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cars" DROP COLUMN "carType"`);
        await queryRunner.query(`CREATE TYPE "public"."cars_cartype_enum" AS ENUM('keke', 'shuttle', 'camry', 'sienna')`);
        await queryRunner.query(`ALTER TABLE "cars" ADD "carType" "public"."cars_cartype_enum" NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cars" DROP COLUMN "carType"`);
        await queryRunner.query(`DROP TYPE "public"."cars_cartype_enum"`);
        await queryRunner.query(`ALTER TABLE "cars" ADD "carType" character varying NOT NULL`);
    }

}
