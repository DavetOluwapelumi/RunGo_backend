import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CommonAuthService } from '../../auth/auth.service.common';
import { CreateAdminDTO } from '../dto/createAdmin';
import { AdminService } from './admin.service';
import { ApiResponse } from 'src/adapters/apiResponse';
import { LoginAdminDTO } from '../dto/loginAdmin';
import { JwtPayload } from 'src/interfaces/jwt';
import { RequestPasswordResetDTO } from '../dto/requestPasswordReset';
import { SetNewPasswordDTO } from '../dto/setNewPassword';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from '../../entities/admin.entity';
@Injectable()
export class AdminAuthService {
  constructor(
    @Inject(CommonAuthService)
    private readonly commonAuthService: CommonAuthService,
    @Inject(AdminService)
    private readonly adminService: AdminService,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
  ) {}

  private readonly logger = new Logger(AdminAuthService.name);

  public async register(request: CreateAdminDTO) {
    const { email, firstName, lastName, password: rawPassword } = request;
    try {
      const admin = await this.adminService.findOneByEmail(email);
      if (admin !== null) {
        throw new ConflictException(
          'an admin with the provided email already exists ',
        );
      }
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'status' in error) {
        const err = error as { status: number; message: string };
        if ((err.status = HttpStatus.CONFLICT)) {
          throw new ConflictException(err.message);
        }
      } else {
        throw new HttpException(
          typeof error === 'object' && error !== null && 'status' in error
            ? (error as any).message
            : 'An unexpected error occured',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
    }

    const hashedPassword = await this.commonAuthService
      .hashPassword(rawPassword)
      .catch((error) => {
        this.logger.error(`error hashing password due to ${error.message}`);
        throw new InternalServerErrorException(
          'The request could not be completed',
        );
      });

    const payload: CreateAdminDTO = {
      firstName,
      lastName,
      password: hashedPassword,
      email,
    };
    await this.adminService.create(payload).catch((error) => {
      this.logger.error(`error hashing password due to ${error.message}`);
      throw new InternalServerErrorException(
        'The request could not be completed',
      );
    });

    return new ApiResponse('Admin account successfully created', null);
  }

  public async login(request: LoginAdminDTO) {
    try {
      const admin = await this.adminService.findOneByEmail(request.email);
      if (!admin) {
        throw new NotFoundException('invalid email or password');
      }

      const isCorrectPassword = await this.commonAuthService
        .validatePasswordHash(admin.password, request.password)
        .catch((error) => {
          this.logger.error(error.message);
          throw error;
        });

      if (!isCorrectPassword) {
        throw new UnauthorizedException('invalid email or password');
      }
      const jwtPayload: JwtPayload = {
        userEmail: admin.email,
        userId: admin.identifier,
        accountType: 'admin',
      };
      const jwtToken = await this.commonAuthService
        .generateJwt(jwtPayload)
        .catch((error) => {
          throw error;
        });
      return new ApiResponse('login successful', { jwtToken });
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'status' in error) {
        const err = error as { status: number; message?: string };

        if (err.status === HttpStatus.CONFLICT) {
          throw new ConflictException(err.message || 'Conflict error occurred');
        } else {
          throw new HttpException(
            err.message || 'Request could not be processed',
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        }
      }

      // Fallback for unknown errors
      throw new HttpException(
        'An unexpected error occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async requestPasswordReset(request: RequestPasswordResetDTO) {
    try {
      const admin = await this.adminService.findOneByEmail(request.email);
      if (!admin) {
        throw new NotFoundException('Invalid email');
      }
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'status' in error) {
        const err = error as { status: number; message?: string };

        if (err.status === HttpStatus.NOT_FOUND) {
          throw new NotFoundException(err.message || 'Resource not found');
        } else {
          throw new UnprocessableEntityException(
            err.message || 'Invalid request',
          );
        }
      }
    }
  }

  public async setNewPassword(
    request: SetNewPasswordDTO,
    authorizedUser: JwtPayload,
  ) {
    try {
      const admin = await this.adminService.findOneByEmail(
        authorizedUser.userEmail,
      );
      if (!admin) {
        throw new NotFoundException('Invalid email');
      }

      if (!Object.is(request.newPassword, request.confirmPassword)) {
        throw new BadRequestException('passwords does not match ');
      }
      const hashedPassword = await this.commonAuthService
        .hashPassword(request.newPassword)
        .catch((error) => {
          throw error;
        });

      admin.password = hashedPassword;
      await this.adminRepository.save(admin).catch((error) => {
        throw error;
      });
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'status' in error) {
        const err = error as { status: number; message?: string };

        if (err.status === HttpStatus.NOT_FOUND) {
          throw new NotFoundException(err.message || 'Resource not found');
        } else {
          throw new HttpException(
            err.message || 'An error occurred',
            err.status,
          );
        }
      }

      // Fallback for unknown errors
      throw new HttpException(
        'An unexpected error occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
