import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { JwtPayload } from '../interfaces/jwt';
import { HotlinkInterface } from 'src/interfaces/hotlink';

@Injectable()
export class CommonAuthService {
  constructor(private jwtService: JwtService) {}
  private passwordHashSaltRounds = 12;

  public async hashPassword(rawPassword: string): Promise<string> {
    return await argon2.hash(rawPassword.trim());
  }

  public async validatePasswordHash(
    hash: string,
    rawPassword: string,
  ): Promise<boolean> {
    return await argon2.verify(hash, rawPassword.trim());
  }

  public generateJwt(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  public async generateHotlink(payload: HotlinkInterface) {
    const jwt = await this.generateJwt(payload);
    const baseUrl = process.env.BASE_URL;
    const path = payload.accountType.toLowerCase().trim();
    const hotlink = `${baseUrl}/v1/${path}/auth/verify?token=${jwt}`;
    return hotlink;
  }

  public async validateHotLink(
    hotlinkToken: string,
  ): Promise<{ isValid: boolean; data: HotlinkInterface }> {
    try {
      const data = await this.validateJwt(hotlinkToken);
      if (!data) {
        return {
          isValid: false,
          data,
        };
      } else
        return {
          isValid: true,
          data,
        };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async validateJwt(token: string): Promise<JwtPayload> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      return payload;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
