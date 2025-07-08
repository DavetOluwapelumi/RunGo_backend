import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableUnique } from 'typeorm';

export class CreateWalletAndWalletTransactionTables1751800000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create wallets table
        await queryRunner.createTable(
            new Table({
                name: 'wallets',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'uuid',
                    },
                    {
                        name: 'userIdentifier',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'driverIdentifier',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'balance',
                        type: 'float',
                        isNullable: false,
                        default: 0,
                    },
                    {
                        name: 'userId',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'driverId',
                        type: 'varchar',
                        isNullable: true,
                    },
                ],
                uniques: [
                    new TableUnique({ name: 'UQ_wallet_userIdentifier', columnNames: ['userIdentifier'] }),
                    new TableUnique({ name: 'UQ_wallet_driverIdentifier', columnNames: ['driverIdentifier'] }),
                ],
            })
        );

        // Create wallet_transactions table
        await queryRunner.createTable(
            new Table({
                name: 'wallet_transactions',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'uuid',
                    },
                    {
                        name: 'walletId',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'type',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'amount',
                        type: 'float',
                        isNullable: false,
                    },
                    {
                        name: 'reference',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'description',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'createdAt',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'lastUpdatedAt',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                ],
            })
        );

        // Add foreign keys
        await queryRunner.createForeignKey(
            'wallets',
            new TableForeignKey({
                columnNames: ['userId'],
                referencedTableName: 'users',
                referencedColumnNames: ['identifier'],
                onDelete: 'SET NULL',
            })
        );
        await queryRunner.createForeignKey(
            'wallets',
            new TableForeignKey({
                columnNames: ['driverId'],
                referencedTableName: 'drivers',
                referencedColumnNames: ['identifier'],
                onDelete: 'SET NULL',
            })
        );
        await queryRunner.createForeignKey(
            'wallet_transactions',
            new TableForeignKey({
                columnNames: ['walletId'],
                referencedTableName: 'wallets',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('wallet_transactions');
        await queryRunner.dropTable('wallets');
    }
} 