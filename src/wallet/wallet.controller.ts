import { Controller, Post, Body, Req, UseGuards, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { FundWalletDto } from './dto/fundWallet.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller({ version: '1', path: 'wallet' })
export class WalletController {
    constructor(private readonly walletService: WalletService) { }

    @UseGuards(JwtAuthGuard)
    @Post('fund')
    async fundWallet(@Req() req, @Body() dto: FundWalletDto) {
        // userIdentifier from JWT
        return this.walletService.fundWallet(req.user.identifier, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('balance')
    async getWallet(@Req() req) {
        return this.walletService.getWallet(req.user.identifier);
    }

    @HttpCode(HttpStatus.OK)
    @Post('paystack/webhook')
    async paystackWebhook(@Body() body: any) {
        console.log('Paystack webhook received:', body);
        return { message: 'Webhook received' };
    }
} 