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
import {
  EmailOptions,
  EmailTemplate,
  MailerService,
} from 'src/mailer/mailer.service';
import { HotlinkInterface } from 'src/interfaces/hotlink';
@Injectable()
export class AdminAuthService {
  constructor(
    @Inject(CommonAuthService)
    private readonly commonAuthService: CommonAuthService,
    @Inject(AdminService)
    private readonly adminService: AdminService,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @Inject(MailerService)
    private readonly mailerService: MailerService,
  ) {}

  private readonly logger = new Logger(AdminAuthService.name);

  public async register(request: CreateAdminDTO) {
    const { email, firstName, lastName, password: rawPassword } = request;
    try {
      const admin = await this.adminService.findOneByEmail(email);
      if (admin !== null) {
        throw new ConflictException(
          'An admin with the provided email already exists',
        );
      }
    } catch (error) {
      if (error.status == HttpStatus.CONFLICT) {
        throw new ConflictException(error.message);
      } else {
        throw new HttpException(
          'request could not be completed',
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
    const admin = await this.adminService.create(payload).catch((error) => {
      this.logger.error(`error hashing password due to ${error.message}`);
      throw new InternalServerErrorException(
        'The request could not be completed',
      );
    });

    const hotlinkPayload: HotlinkInterface = {
      userId: admin.identifier,
      userEmail: admin.email,
      accountType: 'admin',
    };

    const generatedHotlink =
      await this.commonAuthService.generateHotlink(hotlinkPayload);

    const emailOptions: EmailOptions = {
      recipient: {
        name: payload.firstName,
        emailAddress: payload.email,
      },
      subject: 'Welcome to Run go',
      template: EmailTemplate.Signup,
      data: {
        name: payload.firstName,
        hotlink: generatedHotlink,
      },
    };

    await this.mailerService.sendEmail(emailOptions);
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
      if (error.status == HttpStatus.CONFLICT) {
        throw new ConflictException(error.message);
      } else {
        throw new HttpException(error.message, HttpStatus.UNPROCESSABLE_ENTITY);
      }
    }
  }

  public async requestPasswordReset(request: RequestPasswordResetDTO) {
    try {
      const admin = await this.adminService.findOneByEmail(request.email);
      if (!admin) {
        return new UnprocessableEntityException(
          'An email would be sent to you if and account with the provided email exists',
        );
      }
      const emailOptions: EmailOptions = {
        recipient: {
          name: admin.firstName,
          emailAddress: admin.email,
        },
        subject: 'Password reset',
        template: EmailTemplate.Forgottenpassword,
        data: {
          hotlink: 'http://whatever',
          name: admin.firstName,
        },
      };
      await this.mailerService.sendEmail(emailOptions);
    } catch (error) {
      if (error.status == HttpStatus.NOT_FOUND) {
        throw new NotFoundException(error.message);
      } else {
        throw new UnprocessableEntityException(error.message);
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
      if (error.status == HttpStatus.NOT_FOUND) {
        throw new NotFoundException(error.message);
      } else {
        throw new HttpException(error.message, error.status);
      }
    }
  }
}
