import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifyingDropOffTime1746166512231 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
          ALTER TABLE bookings ALTER COLUMN "dropoffTime" DROP NOT NULL;
        `);
      }
    
      public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
          ALTER TABLE bookings ALTER COLUMN "dropoffTime" SET NOT NULL;
        `);
      }

}
