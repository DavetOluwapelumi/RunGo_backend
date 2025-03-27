import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Payment from '../entities/payment.entity';
import { Repository } from 'typeorm';
import { CreatePaymentDTO } from './dto/createPayment';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  private logger = new Logger(PaymentService.name);

  public async createPayment(request: CreatePaymentDTO): Promise<Payment> {
    try {
      const { amount, referenceNumber, userIdentifier, paymentMethod } =
        request;
      const payment = this.paymentRepository.create();

      payment.amount = amount;
      payment.paymentMethod = paymentMethod;
      payment.userIdentifier = userIdentifier;
      payment.referenceNumber = referenceNumber;

      await this.paymentRepository.save(payment);
      return payment;
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
