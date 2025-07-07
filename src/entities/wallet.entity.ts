import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, Unique } from 'typeorm';
import User from './users.entity';
import Driver from './driver.entity';
import { WalletTransaction } from './walletTransaction.entity';

@Entity('wallets')
@Unique(['userIdentifier'])
@Unique(['driverIdentifier'])
export class Wallet {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    userIdentifier: string;

    @Column({ nullable: true })
    driverIdentifier: string;

    @Column({ type: 'float', default: 0 })
    balance: number;

    @ManyToOne(() => User, { nullable: true })
    user: User;

    @ManyToOne(() => Driver, { nullable: true })
    driver: Driver;

    @OneToMany(() => WalletTransaction, (tx: WalletTransaction) => tx.wallet)
    transactions: WalletTransaction[];
} 