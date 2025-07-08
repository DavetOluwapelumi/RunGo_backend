import { Controller, Post, Body, Get, HttpCode, HttpStatus, Query, Res, Redirect } from '@nestjs/common';
import { Response } from 'express';
import { WalletService } from './wallet.service';
import { FundWalletDto } from './dto/fundWallet.dto';
import { UserService } from '../users/services/users.service';

@Controller({ version: '1', path: 'wallet' })
export class WalletController {
    constructor(
        private readonly walletService: WalletService,
        private readonly usersService: UserService,
    ) { }

    @Post('fund')
    async fundWallet(@Body() dto: FundWalletDto & { email: string }) {
        console.log('Fund wallet request received:', JSON.stringify(dto, null, 2));
        return this.walletService.fundWalletByEmail(dto.email, dto.amount);
    }

    @Get('balance')
    async getWallet(@Query('email') email: string) {
        console.log('Get wallet balance request for email:', email);
        return this.walletService.getWalletByEmail(email);
    }

    @Get('payment/callback')
    @Redirect()
    async paymentCallback(@Query('reference') reference: string, @Query('trxref') trxref: string) {
        console.log('Payment callback received - Reference:', reference, 'Trxref:', trxref);

        // Redirect to frontend user dashboard
        const frontendUrl = 'http://localhost:3000/user_dashboard/dashboard';
        return {
            url: `${frontendUrl}?payment=success&reference=${reference}`,
        };
    }

    @HttpCode(HttpStatus.OK)
    @Post('paystack/webhook')
    async paystackWebhook(@Body() body: any) {
        console.log('Paystack webhook received:', JSON.stringify(body, null, 2));
        // 1. Check if event is charge.successSS
        if (body.event === 'charge.success') {
            const email = body.data?.customer?.email;
            const amount = body.data?.amount ? body.data.amount / 100 : 0; // Paystack sends amount in kobo, convert to Naira
            const reference = body.data?.reference;
            const description = 'Wallet funding via Paystack';

            console.log(`Processing webhook - Email: ${email}, Amount: ${amount} Naira, Reference: ${reference}`);

            if (!email) {
                console.error('No email found in webhook payload');
                return { message: 'No email in webhook' };
            }

            // 2. Find user by email
            const user = await this.usersService.findOneByEmail(email);
            if (!user) {
                console.error('No user found for email:', email);
                return { message: 'No user found for email' };
            }

            // 3. Credit wallet
            const updatedWallet = await this.walletService.creditWallet(user.identifier, amount, reference, description);
            console.log(`Wallet credited successfully for user: ${user.identifier}, amount: ${amount} Naira, new balance: ${updatedWallet.balance}`);
            return { message: 'Wallet credited successfully' };
        }

        console.warn('Webhook event not handled:', body.event);
        return { message: 'Event not handled' };
    }
} 