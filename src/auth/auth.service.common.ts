import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { JwtPayload } from '../interfaces/jwt';

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

  generateJwt(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload);
  }
}
