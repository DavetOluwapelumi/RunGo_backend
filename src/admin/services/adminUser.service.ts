import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from 'src/users/services/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import User from '../../entities/users.entity';
import { Repository } from 'typeorm';
import Booking from '../../entities/booking.entity';

@Injectable()
export class AdminUserService {
  constructor(
    private readonly userService: UserService, // Import UserService for shared logic
    @InjectRepository(User)
    private readonly userRepository: Repository<User>, // For admin-specific operations
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>, // For booking-specific operations
  ) { }

  // View all users
  public async getAllUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }

  // Suspend a user
  public async suspendUser(identifier: string): Promise<void> {
    console.log('Suspending user with identifier:', identifier);
    const user = await this.userService.findOneByIdentifier(identifier);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.isActive = false; // Assuming `isActive` is a field in the User entity
    await this.userRepository.save(user);
  }

  // Unsuspend a user
  public async unsuspendUser(identifier: string): Promise<void> {
    const user = await this.userService.findOneByIdentifier(identifier);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.isActive = true;
    await this.userRepository.save(user);
  }

  // Delete a user
  public async deleteUser(identifier: string): Promise<void> {
    const user = await this.userService.findOneByIdentifier(identifier);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userRepository.remove(user);
  }

  // TODO: Get user booking history
  public async getUserBookingHistory(identifier: string): Promise<Booking[]> {
    const bookings = await this.bookingRepository.find({
      where: { userIdentifier: identifier }, // Query by userIdentifier
    });

    if (!bookings.length) {
      throw new NotFoundException('No bookings found for this user');
    }

    return bookings;
  }

  // Reset user password
  public async resetUserPassword(
    identifier: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userService.findOneByIdentifier(identifier);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.password = newPassword; // Ideally, hash the password before saving
    await this.userRepository.save(user);
  }
}
