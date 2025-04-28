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
import { CreateDriverDTO } from 'src/drivers/dto/createDriver';
import { DriverService } from './drivers.service';
import { ApiResponse } from 'src/adapters/apiResponse';
import { LoginDriverDTO } from '../dto/loginDriver';
import { JwtPayload } from 'src/interfaces/jwt';
import { RequestPasswordResetDTO } from '../dto/requestPasswordReset';
import { SetNewPasswordDTO } from '../dto/setNewPassword';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Driver from '../../entities/driver.entity';

@Injectable()
export class DriverAuthService {
  constructor(
    @Inject(CommonAuthService)
    private readonly commonAuthService: CommonAuthService,
    @Inject(DriverService)
    private readonly driverService: DriverService,
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
  ) {}

  private readonly logger = new Logger(DriverAuthService.name);

  public async verifyHotlink(link: string) {
    console.log({ link });
    throw 'inmplemented';
  }
  public async register(request: CreateDriverDTO) {
    const {
      email,
      phoneNumber,
      firstName,
      lastName,
      password: rawPassword,
    } = request;
    try {
      const existingDriver = await this.driverService.findOneByEmail(email);
      if (existingDriver) {
        throw new ConflictException(
          'A driver with this email or phone already exists.',
        );
      }
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'status' in error) {
        const err = error as { status: number; message: string };
        if (err.status === HttpStatus.CONFLICT) {
          throw new ConflictException(err.message);
        }
      }
      throw new HttpException(
        'Request could not be completed',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    const hashedPassword = await this.commonAuthService
      .hashPassword(rawPassword)
      .catch((error) => {
        this.logger.error(`Error hashing password: ${error.message}`);
        throw new InternalServerErrorException(
          'The request could not be completed',
        );
      });

    const payload: CreateDriverDTO = {
      firstName,
      lastName,
      email,
      phoneNumber,
      password: hashedPassword,
    };

    await this.driverService.create(payload).catch((error) => {
      this.logger.error(`Error creating driver: ${error.message}`);
      throw new InternalServerErrorException(
        'The request could not be completed',
      );
    });

    return new ApiResponse('Driver account successfully created', null);
  }

  public async login(request: LoginDriverDTO) {
    try {
      const driver = await this.driverService.findOneByEmail(request.email);
      if (!driver) {
        throw new NotFoundException('Invalid email/phone or password');
      }

      const isCorrectPassword = await this.commonAuthService
        .validatePasswordHash(driver.password, request.password)
        .catch((error) => {
          this.logger.error(error.message);
          throw error;
        });

      if (!isCorrectPassword) {
        throw new UnauthorizedException('Invalid email/phone or password');
      }

      const jwtPayload: JwtPayload = {
        userEmail: driver.email,
        userId: driver.identifier,
        accountType: 'driver',
      };

      const jwtToken = await this.commonAuthService
        .generateJwt(jwtPayload)
        .catch((error) => {
          throw error;
        });

      return new ApiResponse('Login successful', { jwtToken });
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'status' in error) {
        const err = error as { status: number; message: string };
        if (err.status === HttpStatus.CONFLICT) {
          throw new ConflictException(err.message);
        }
      }
      throw new HttpException(
        typeof error === 'object' && error !== null && 'message' in error
          ? (error as any).message
          : 'An unexpected error occurred',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  public async requestPasswordReset(request: RequestPasswordResetDTO) {
    try {
      const driver = await this.driverService.findOneByEmail(request.email);
      if (!driver) {
        throw new NotFoundException(
          'It appears the email is not registered on our servers',
        );
      }
      //TODO: send  else send email
      return new ApiResponse(
        'You would receive and email with further instructions',
        null,
      );
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'status' in error) {
        const err = error as { status: number; message: string };

        if (err.status === HttpStatus.NOT_FOUND) {
          throw new NotFoundException(err.message);
        }
      }

      throw new UnprocessableEntityException(
        typeof error === 'object' && error !== null && 'message' in error
          ? (error as any).message
          : 'An unexpected error occurred',
      );
    }
  }

  public async setNewPassword(
    request: SetNewPasswordDTO,
    authorizedUser: JwtPayload,
  ) {
    try {
      const driver = await this.driverService.findOneByEmail(
        authorizedUser.userEmail,
      );
      if (!driver) {
        throw new NotFoundException('Invalid email');
      }

      if (request.newPassword !== request.confirmPassword) {
        throw new BadRequestException('Passwords do not match');
      }

      const hashedPassword = await this.commonAuthService
        .hashPassword(request.newPassword)
        .catch((error) => {
          throw error;
        });

      driver.password = hashedPassword;
      await this.driverRepository.save(driver).catch((error) => {
        throw error;
      });

      return new ApiResponse('Password successfully updated', null);
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'status' in error) {
        const err = error as { status: number; message: string };

        if (err.status === HttpStatus.NOT_FOUND) {
          throw new NotFoundException(err.message);
        } else {
          throw new HttpException(err.message, err.status);
        }
      }

      // Fallback in case `error` does not have `.status`
      throw new HttpException(
        typeof error === 'object' && error !== null && 'message' in error
          ? (error as any).message
          : 'An unexpected error occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
