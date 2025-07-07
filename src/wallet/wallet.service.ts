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
            amount: dto.amount,
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

    async getWallet(userIdentifier: string) {
        return this.walletRepository.findOne({ where: { userIdentifier } });
    }
} 