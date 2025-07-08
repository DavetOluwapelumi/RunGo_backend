import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from '../entities/wallet.entity';
import { WalletTransaction } from '../entities/walletTransaction.entity';
import { PaymentService } from '../payment/payment.service';
import { FundWalletDto } from './dto/fundWallet.dto';
import { UserService } from '../users/services/users.service';

@Injectable()
export class WalletService {
    constructor(
        @InjectRepository(Wallet)
        private readonly walletRepository: Repository<Wallet>,
        @InjectRepository(WalletTransaction)
        private readonly walletTransactionRepository: Repository<WalletTransaction>,
        private readonly paymentService: PaymentService,
        private readonly usersService: UserService,
    ) { }

    async fundWalletByEmail(email: string, amount: number) {
        const user = await this.usersService.findOneByEmail(email);
        if (!user) throw new NotFoundException('User not found');
        // Call payment service to initialize Paystack payment
        return this.paymentService.initializePayment({
            email,
            amount: (amount * 100).toString(), // Convert to kobo for Paystack
        });
    }

    async getWalletByEmail(email: string) {
        const user = await this.usersService.findOneByEmail(email);
        if (!user) throw new NotFoundException('User not found');

        let wallet = await this.walletRepository.findOne({ where: { userIdentifier: user.identifier } });

        // If wallet doesn't exist, create one with 0 balance
        if (!wallet) {
            wallet = this.walletRepository.create({
                userIdentifier: user.identifier,
                balance: 0
            });
            await this.walletRepository.save(wallet);
        }

        return {
            success: true,
            data: {
                balance: wallet.balance,
                userIdentifier: wallet.userIdentifier,
                email: email
            }
        };
    }

    async fundWallet(userIdentifier: string, dto: FundWalletDto) {
        let email = dto.email;
        if (!email) {
            const user = await this.usersService.findOneByIdentifier(userIdentifier);
            if (!user) throw new NotFoundException('User not found');
            email = user.email;
        }
        // Call payment service to initialize Paystack payment
        return this.paymentService.initializePayment({
            email,
            amount: (dto.amount * 100).toString(),
        });
    }

    async creditWallet(userIdentifier: string, amount: number, reference: string, description: string) {
        let wallet = await this.walletRepository.findOne({ where: { userIdentifier } });
        if (!wallet) {
            wallet = this.walletRepository.create({ userIdentifier, balance: 0 });
        }
        wallet.balance += amount;
        await this.walletRepository.save(wallet);
        const transaction = this.walletTransactionRepository.create({
            wallet,
            amount,
            type: 'credit',
            reference,
            description,
        });
        await this.walletTransactionRepository.save(transaction);
        return wallet;
    }

    async debitWallet(userIdentifier: string, amount: number, reference: string, description: string) {
        const wallet = await this.walletRepository.findOne({ where: { userIdentifier } });
        if (!wallet) throw new NotFoundException('Wallet not found');
        if (wallet.balance < amount) throw new Error('Insufficient wallet balance');
        wallet.balance -= amount;
        await this.walletRepository.save(wallet);
        const transaction = this.walletTransactionRepository.create({
            wallet,
            amount,
            type: 'debit',
            reference,
            description,
        });
        await this.walletTransactionRepository.save(transaction);
        return wallet;
    }

    async getWallet(userIdentifier: string) {
        return this.walletRepository.findOne({ where: { userIdentifier } });
    }
} 