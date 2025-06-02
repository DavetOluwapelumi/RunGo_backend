import { Controller, Post, Body } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentMethod } from '../enums/paymentMethod';
import { CreatePaymentDTO } from './dto/createPayment';

// @Controller('payment')
// export class PaymentController {
//     constructor(private readonly paymentService: PaymentService) { }

//     @Post('initiate')
//     async initiatePayment(
//         @Body() body: { dto: CreatePaymentDTO }
//     ) {
//         return this.paymentService.initiatePayment(dto);
//     }
// }