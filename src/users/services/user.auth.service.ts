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
import { CreateUserDTO } from 'src/users/dto/createUser';
import { UserService } from './users.service';
import { ApiResponse } from 'src/adapters/apiResponse';
import { LoginUserDTO } from '../dto/loginUser';
import { JwtPayload } from 'src/interfaces/jwt';
import { RequestPasswordResetDTO } from '../dto/requestPasswordReset';
import { SetNewPasswordDTO } from '../dto/setNewPassword';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import User from '../../entities/users.entity';

@Injectable()
export class UserAuthService {
  constructor(
    @Inject(CommonAuthService)
    private readonly commonAuthService: CommonAuthService,
    @Inject(UserService)
    private readonly userService: UserService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private readonly logger = new Logger(UserAuthService.name);

  public async register(request: CreateUserDTO) {
    const {
      email,
      phoneNumber,
      firstName,
      lastName,
      password: rawPassword,
    } = request;
    try {
      const existingUser = await this.userService.findOneByEmail(email);
      if (existingUser) {
        throw new ConflictException(
          'A user with this email or phone already exists.',
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

    const payload: CreateUserDTO = {
      firstName,
      lastName,
      email,
      phoneNumber,
      matricNumber: request.matricNumber,
      password: hashedPassword,
    };

    await this.userService.create(payload).catch((error) => {
      this.logger.error(`Error creating user: ${error.message}`);
      throw new InternalServerErrorException(
        'The request could not be completed',
      );
    });

    return new ApiResponse('User account successfully created', null);
  }

  public async login(request: LoginUserDTO) {
    try {
      const user = await this.userService.findOneByIdentifier(
        request.matricNumber,
      );
      console.log('user', user);
      if (!user) {
        this.logger.error(
          `User not found for matricNumber: ${request.matricNumber}`,
        );
        throw new NotFoundException('Invalid matric number or password');
      }

      const isCorrectPassword = await this.commonAuthService
        .validatePasswordHash(user.password, request.password)
        .catch((error) => {
          this.logger.error(error.message);
          throw error;
        });

      if (!isCorrectPassword) {
        throw new UnauthorizedException('Invalid email/phone or password');
      }

      const jwtPayload: JwtPayload = {
        userEmail: user.email,
        userId: user.id,
        accountType: 'user',
      };

      const jwtToken = await this.commonAuthService
        .generateJwt(jwtPayload)
        .catch((error) => {
          throw error;
        });

      return new ApiResponse('Login successful', { jwtToken });
    } catch (error) {
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
      const user = await this.userService.findOneByEmail(request.email);
      if (!user) {
        throw new NotFoundException(
          'It appears the email is not registered on our servers',
        );
      }
      //TODO: send email with reset instructions
      return new ApiResponse(
        'You would receive an email with further instructions',
        null,
      );
    } catch (error) {
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
      const user = await this.userService.findOneByEmail(
        authorizedUser.userEmail,
      );
      if (!user) {
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

      user.password = hashedPassword;
      await this.userRepository.save(user).catch((error) => {
        throw error;
      });

      return new ApiResponse('Password successfully updated', null);
    } catch (error) {
      throw new HttpException(
        typeof error === 'object' && error !== null && 'message' in error
          ? (error as any).message
          : 'An unexpected error occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
