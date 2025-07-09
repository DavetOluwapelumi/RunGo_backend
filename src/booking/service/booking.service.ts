import {
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Booking from '../../entities/booking.entity';
import { Repository } from 'typeorm';
import { CreateBookingDTO } from '../dto/createBooking';
import { PaymentService } from '../../payment/payment.service';
import { CreatePaymentDTO } from '../../payment/dto/createPayment';
import { DriverService } from '../../drivers/services/drivers.service';
import { UserService } from '../../users/services/users.service';
import { RideRequestService } from './rideRequest.service';
import { CreateRideRequestDTO } from '../dto/createRideRequest';
import { Wallet } from '../../entities/wallet.entity';
import { WalletTransaction } from '../../entities/walletTransaction.entity';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(WalletTransaction)
    private readonly walletTransactionRepository: Repository<WalletTransaction>,
    @Inject(PaymentService)
    private readonly paymentService: PaymentService,
    private readonly driverService: DriverService,
    private readonly userService: UserService,
    private readonly rideRequestService: RideRequestService,
  ) { }

  async createBooking(request: CreateBookingDTO) {
    const {
      userIdentifier,
      driverIdentifier,
      destination,
      pickupLocation,
      paymentReferenceNumber,
      amountPaid,
      paymentMethod,
    } = request;

    // Check if the user exists
    const user = await this.userService.findOneByIdentifier(userIdentifier);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if driverIdentifier is provided
    if (!driverIdentifier) {
      throw new UnprocessableEntityException('Driver selection is required');
    }

    // Check if the selected driver exists and is available
    const selectedDriver = await this.driverService.findOneByIdentifier(driverIdentifier);
    if (!selectedDriver) {
      throw new NotFoundException('Selected driver not found');
    }

    if (!selectedDriver.isAvailable) {
      throw new UnprocessableEntityException('Selected driver is not available');
    }

    // Handle wallet payment validation
    if (paymentMethod === 'Wallet') {
      const walletValidation = await this.validateWalletBalance(userIdentifier, amountPaid);
      if (!walletValidation.canProceed) {
        throw new UnprocessableEntityException(walletValidation.message);
      }
    }

    try {
      // Update selected driver availability to false (busy)
      await this.driverService.updateDriverAvailability(
        selectedDriver.identifier,
        false,
      );

      let paymentIdentifier: string;

      // Handle different payment methods
      if (paymentMethod === 'Wallet') {
        // For wallet payment, debit the wallet and create a transaction
        await this.debitWallet(
          userIdentifier,
          amountPaid,
          paymentReferenceNumber,
          `Ride booking from ${pickupLocation} to ${destination}`
        );
        paymentIdentifier = paymentReferenceNumber; // Use the reference as payment identifier
      } else {
        // For cash payment, initialize external payment
        const paymentDto: CreatePaymentDTO = {
          amount: amountPaid.toString(),
          email: user.email,
        };
        const paymentResponse = await this.paymentService.initializePayment(paymentDto);
        paymentIdentifier = paymentResponse.data.reference;
      }

      // Use the selected driver's car identifier
      const carIdentifier = selectedDriver.carIdentifier;

      const booking = this.bookingRepository.create({
        destination,
        pickupLocation,
        userIdentifier,
        driverIdentifier: selectedDriver.identifier,
        carIdentifier,
        paymentIdentifier,
        pickupTime: new Date(),
      });
      const savedBooking = await this.bookingRepository.save(booking);

      return savedBooking;
    } catch (error) {
      // Rollback driver availability if booking creation fails
      await this.driverService.updateDriverAvailability(
        selectedDriver.identifier,
        true,
      );
      throw error;
    }
  }
  async createBookingFromRideRequest(rideRequestId: string, paymentDetails: any): Promise<Booking> {
    // 1. Get the ride request
    const rideRequest = await this.rideRequestService.findByIdentifier(rideRequestId);
    if (!rideRequest || rideRequest.status !== 'accepted') {
      throw new UnprocessableEntityException('Ride request not found or not accepted');
    }

    // 2. Process payment
    const paymentResponse = await this.paymentService.initializePayment({
      amount: rideRequest.estimatedAmount.toString(),
      email: (await this.userService.findOneByIdentifier(rideRequest.userIdentifier)).email,
    });

    // 3. Create booking
    const booking = this.bookingRepository.create({
      destination: rideRequest.destination,
      pickupLocation: rideRequest.pickupLocation,
      userIdentifier: rideRequest.userIdentifier,
      driverIdentifier: rideRequest.driverIdentifier,
      carIdentifier: (await this.driverService.findOneByIdentifier(rideRequest.driverIdentifier)).carIdentifier,
      paymentIdentifier: paymentResponse.data.reference,
      pickupTime: new Date(),
      status: 'accepted',
    });

    return await this.bookingRepository.save(booking);
  }

  public async findAllBookings(userId: string): Promise<Booking[]> {
    return await this.bookingRepository.find({
      where: { userIdentifier: userId },
    });
  }

  public async findBookingByIdentifier(
    identifier: string,
  ): Promise<Booking | null> {
    return await this.bookingRepository.findOne({ where: { identifier } });
  }

  public async deleteBooking(identifier: string): Promise<void> {
    const booking = await this.findBookingByIdentifier(identifier);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    await this.bookingRepository.remove(booking);
  }

  public async updateBooking(
    identifier: string,
    request: Partial<Booking>,
  ): Promise<Booking> {
    const booking = await this.findBookingByIdentifier(identifier);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    Object.assign(booking, request); // Merge the updates into the existing booking
    return await this.bookingRepository.save(booking);
  }

  public async endTrip(bookingIdentifier: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { identifier: bookingIdentifier },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    booking.dropoffTime = new Date(); // Set dropoffTime to the current timestamp
    return await this.bookingRepository.save(booking);
  }

  async createRideRequest(request: CreateRideRequestDTO) {
    return await this.rideRequestService.createRideRequest(request);
  }

  async handleRideResponse(requestId: string, action: 'accept' | 'reject') {
    console.log(`🔍 handleRideResponse called with requestId: ${requestId}, action: ${action}`);

    const status = action === 'accept' ? 'accepted' : 'rejected';
    console.log(`🔍 Determined status: ${status}`);

    const rideRequest = await this.rideRequestService.updateStatus(requestId, status);
    console.log(`🔍 Updated ride request status: ${rideRequest.status}`);

    const actionText = action === 'accept' ? 'accepted' : 'rejected';

    return {
      message: `Ride request ${actionText} successfully`,
      rideRequest,
      status: rideRequest.status
    };
  }

  async processPayment(requestId: string, paymentDetails: CreatePaymentDTO) {
    // Verify ride request is accepted
    const rideRequest = await this.rideRequestService.findByIdentifier(requestId);
    if (!rideRequest || rideRequest.status !== 'accepted') {
      throw new UnprocessableEntityException('Ride request not found or not accepted');
    }

    // Create booking from accepted ride request
    return await this.createBookingFromRideRequest(requestId, paymentDetails);
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

  /**
   * Check wallet balance and validate if sufficient for ride fare
   * This method will be called when user selects wallet payment option
   */
  async validateWalletBalance(userIdentifier: string, rideFare: number) {
    const wallet = await this.walletRepository.findOne({ where: { userIdentifier } });

    if (!wallet) {
      return {
        hasWallet: false,
        hasSufficientFunds: false,
        currentBalance: 0,
        requiredAmount: rideFare,
        message: 'Wallet not found. Please create a wallet first.',
        canProceed: false
      };
    }

    const hasSufficientFunds = wallet.balance >= rideFare;

    return {
      hasWallet: true,
      hasSufficientFunds,
      currentBalance: wallet.balance,
      requiredAmount: rideFare,
      shortfall: hasSufficientFunds ? 0 : rideFare - wallet.balance,
      message: hasSufficientFunds
        ? 'Wallet has sufficient funds for this ride.'
        : `Insufficient wallet balance. Current balance: ${wallet.balance}, Required: ${rideFare}. Please add ${rideFare - wallet.balance} to your wallet.`,
      canProceed: hasSufficientFunds
    };
  }
}
