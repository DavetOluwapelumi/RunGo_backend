import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTempDriverRegisteration1751978136614 implements MigrationInterface {
    name = 'AddTempDriverRegisteration1751978136614'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_temp_driver_registrations_email"`);
        await queryRunner.query(`CREATE INDEX "IDX_6cb0b8d28580e4767cef267f0a" ON "temp_driver_registrations" ("email") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_6cb0b8d28580e4767cef267f0a"`);
        await queryRunner.query(`CREATE INDEX "IDX_temp_driver_registrations_email" ON "temp_driver_registrations" ("email") `);
    }

}
