import { Controller, Post, Body } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDTO } from './dto/createPayment';

@Controller('payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    @Post('initialize')
    async initialize(@Body() paymentDTO: CreatePaymentDTO) {
        return this.paymentService.initializePayment(paymentDTO);
    }
}
