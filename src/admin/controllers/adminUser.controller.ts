import { Controller, Get, Patch, Delete, Param, Body } from '@nestjs/common';
import { AdminUserService } from '../services/adminUser.service';
import { ApiResponse } from 'src/adapters/apiResponse';

@Controller({ version: '1', path: 'admin/users' })
export class UserAdminController {
  constructor(private readonly userAdminService: AdminUserService) { }

  @Get('viewAllUsers')
  public async getAllUsers(): Promise<ApiResponse<any[]>> {
    const users = await this.userAdminService.getAllUsers();
    return new ApiResponse('Users fetched successfully', users);
  }

  @Patch(':identifier/suspend')
  public async suspendUser(
    @Param('identifier') identifier: string,
  ): Promise<ApiResponse<void>> {
    await this.userAdminService.suspendUser(identifier);
    return new ApiResponse('User suspended successfully', null);
  }

  @Patch(':identifier/unsuspend')
  public async unsuspendUser(
    @Param('identifier') identifier: string,
  ): Promise<ApiResponse<void>> {
    await this.userAdminService.unsuspendUser(identifier);
    return new ApiResponse('User unsuspended successfully', null);
  }

  @Delete(':identifier')
  public async deleteUser(
    @Param('identifier') identifier: string,
  ): Promise<ApiResponse<void>> {
    await this.userAdminService.deleteUser(identifier);
    return new ApiResponse('User deleted successfully', null);
  }

  @Get(':identifier/bookings')
  public async getUserBookingHistory(@Param('identifier') identifier: string): Promise<ApiResponse<any[]>> {
    const bookings = await this.userAdminService.getUserBookingHistory(identifier);
    return new ApiResponse('User booking history fetched successfully', bookings);
  }

  @Patch(':identifier/resetPassword')
  public async resetUserPassword(
    @Param('identifier') identifier: string,
    @Body('newPassword') newPassword: string,
  ): Promise<ApiResponse<void>> {
    await this.userAdminService.resetUserPassword(identifier, newPassword);
    return new ApiResponse('User password reset successfully', null);
  }
}
