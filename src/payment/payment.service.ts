import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as Paystack from 'paystack-sdk';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import Payment from '../entities/payment.entity';
import { Repository } from 'typeorm';
import { CreatePaymentDTO } from './dto/createPayment';
import { PaymentStatus } from 'src/enums/paymentStatus';

@Injectable()
export class PaymentService {
  private logger = new Logger(PaymentService.name);
  private paystack: any;

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly configService: ConfigService,
  ) {
    this.paystack = Paystack(this.configService.get('paystack.paystackSecret'));
    console.log('Paystack Secret:', this.configService.get('paystack.paystackSecret'));
  }

  public async createPayment(request: CreatePaymentDTO): Promise<{ payment: Payment; paystackUrl: string }> {
    try {
      const { amount, referenceNumber, userIdentifier, paymentMethod, email } = request;

      // 1. Initialize Paystack transaction
      const amountInKobo = amount * 100;
      const paystackResponse = await this.paystack.transaction.initialize({
        email,
        amount: amountInKobo,
        reference: referenceNumber,
        callback_url: this.configService.get('paystack.callbackUrl'),
      });

      if (!paystackResponse.status) {
        throw new Error(paystackResponse.message || 'Paystack initialization failed');
      }

      // 2. Save payment as pending
      const payment = this.paymentRepository.create({
        ...(amount !== undefined && { amount }),
        ...(paymentMethod !== undefined && { paymentMethod }),
        ...(userIdentifier !== undefined && { userIdentifier }),
        ...(referenceNumber !== undefined && { referenceNumber }),
        // Only include 'status' if it exists in the Payment entity
        ...(Object.prototype.hasOwnProperty.call(this.paymentRepository.metadata.propertiesMap, 'status') && { status: PaymentStatus.PENDING }),
      });

      await this.paymentRepository.save(payment);

      // 3. Return payment and Paystack payment URL
      return {
        payment,
        paystackUrl: paystackResponse.data.authorization_url,
      };
    } catch (error: any) {
      this.logger.error(
        `Fatal: couldn't create payment due to ${error.message}`,
      );
      throw new HttpException(
        'error creating payment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}