import { BOOKING_INFORMATION } from 'src/constants/tableNames';
import { BookingStatus } from 'src/enums/bookingStatus';
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateBookingsTable1740344054118 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: BOOKING_INFORMATION,
        columns: [
          {
            name: 'identifier',
            type: 'varchar',
            isPrimary: true,
          },
          {
            name: 'userIdentifier',
            type: 'varchar',
          },
          {
            name: 'driverIdentifier',
            type: 'varchar',
          },
          {
            name: 'paymentIdentifier',
            type: 'varchar',
          },
          {
            name: 'carIdentifier',
            type: 'varchar',
          },
          {
            name: 'pickupLocation',
            type: 'varchar',
          },
          {
            name: 'destination',
            type: 'varchar',
          },
          {
            name: 'pickupTime',
            type: 'timestamp',
          },
          {
            name: 'dropoffTime',
            type: 'timestamp',
          },
          {
            name: 'status',
            type: 'enum',
            enum: Object.values(BookingStatus),
            default: `'${BookingStatus.PENDING}'`,
          },
          {
            name: 'dateAdded',
            type: 'date',
          },
          {
            name: 'lastUpdatedAt',
            type: 'date',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(BOOKING_INFORMATION);
  }
}
