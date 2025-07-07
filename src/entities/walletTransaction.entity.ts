import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Wallet } from './wallet.entity';

@Entity('wallet_transactions')
export class WalletTransaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Wallet, (wallet) => wallet.transactions)
    wallet: Wallet;

    @Column()
    type: 'credit' | 'debit';

    @Column({ type: 'float' })
    amount: number;

    @Column({ nullable: true })
    reference: string;

    @Column({ nullable: true })
    description: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    lastUpdatedAt: Date;
} 