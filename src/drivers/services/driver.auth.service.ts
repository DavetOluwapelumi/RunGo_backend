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
import { CreateDriverDTO } from '../dto/createDriver.dto';
import { DriverService } from './driver.service';
import { ApiResponse } from 'src/adapters/apiResponse';
import { LoginDriverDTO } from '../dto/loginDriver.dto';
import { JwtPayload } from 'src/interfaces/jwt';
import { RequestPasswordResetDTO } from '../dto/requestPasswordReset.dto';
import { SetNewPasswordDTO } from '../dto/setNewPassword.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Driver } from '../../entities/driver.entity';

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

  public async register(request: CreateDriverDTO) {
    const { email, phone, name, password: rawPassword } = request;
    try {
      const existingDriver = await this.driverService.findOneByEmailOrPhone(email, phone);
      if (existingDriver) {
        throw new ConflictException('A driver with this email or phone already exists.');
      }
    } catch (error) {
      if (error.status == HttpStatus.CONFLICT) {
        throw new ConflictException(error.message);
      } else {
        throw new HttpException('Request could not be completed', HttpStatus.UNPROCESSABLE_ENTITY);
      }
    }

    const hashedPassword = await this.commonAuthService
      .hashPassword(rawPassword)
      .catch((error) => {
        this.logger.error(`Error hashing password: ${error.message}`);
        throw new InternalServerErrorException('The request could not be completed');
      });

    const payload: CreateDriverDTO = {
      name,
      email,
      phone,
      password: hashedPassword,
    };

    await this.driverService.create(payload).catch((error) => {
      this.logger.error(`Error creating driver: ${error.message}`);
      throw new InternalServerErrorException('The request could not be completed');
    });

    return new ApiResponse('Driver account successfully created', null);
  }

  public async login(request: LoginDriverDTO) {
    try {
      const driver = await this.driverService.findOneByEmailOrPhone(request.emailOrPhone);
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
        userId: driver.id,
        accountType: 'driver',
      };

      const jwtToken = await this.commonAuthService.generateJwt(jwtPayload).catch((error) => {
        throw error;
      });

      return new ApiResponse('Login successful', { jwtToken });
    } catch (error) {
      if (error.status == HttpStatus.CONFLICT) {
        throw new ConflictException(error.message);
      } else {
        throw new HttpException(error.message, HttpStatus.UNPROCESSABLE_ENTITY);
      }
    }
  }

  public async requestPasswordReset(request: RequestPasswordResetDTO) {
    try {
      const driver = await this.driverService.findOneByEmail(request.email);
      if (!driver) {
        throw new NotFoundException('Invalid email');
      }
      // TODO: Implement email sending logic here
    } catch (error) {
      if (error.status == HttpStatus.NOT_FOUND) {
        throw new NotFoundException(error.message);
      } else {
        throw new UnprocessableEntityException(error.message);
      }
    }
  }

  public async setNewPassword(request: SetNewPasswordDTO, authorizedUser: JwtPayload) {
    try {
      const driver = await this.driverService.findOneByEmail(authorizedUser.userEmail);
      if (!driver) {
        throw new NotFoundException('Invalid email');
      }

      if (request.newPassword !== request.confirmPassword) {
        throw new BadRequestException('Passwords do not match');
      }

      const hashedPassword = await this.commonAuthService.hashPassword(request.newPassword).catch((error) => {
        throw error;
      });

      driver.password = hashedPassword;
      await this.driverRepository.save(driver).catch((error) => {
        throw error;
      });

      return new ApiResponse('Password successfully updated', null);
    } catch (error) {
      if (error.status == HttpStatus.NOT_FOUND) {
        throw new NotFoundException(error.message);
      } else {
        throw new HttpException(error.message, error.status);
      }
    }
  }
}
