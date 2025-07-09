import { Injectable } from '@nestjs/common';
import { AdminService } from 'src/admin/services/admin.service';
import { BookingService } from 'src/booking/service/booking.service';
import { DriverService } from 'src/drivers/services/drivers.service';
import { UserService } from 'src/users/services/users.service';

import { PaymentService } from 'src/payment/payment.service';

interface MetricsInterface {
  transactions: object;
  drivers: number;
  admin: number;
  revenue: object;
  users: number;
}
@Injectable()
export class StatsService {
  constructor(
    private readonly adminService: AdminService,
    private readonly userService: UserService,
    private readonly driverService: DriverService,
    private readonly bookingService: BookingService,
    private readonly paymentService: PaymentService,
  ) {}

  async fetchMetrics() {
    const metrics: MetricsInterface = {
      transactions: {},
      drivers: 0,
      admin: 0,
      revenue: {},
      users: 0,
    };

    metrics.admin = await this.adminService.countAll();
    metrics.drivers = await this.driverService.countAll();
    metrics.revenue = await this.paymentService.getStats();
    metrics.transactions = await this.bookingService.getStats();
    metrics.users = await this.userService.countAll();

    return metrics;
  }
}
