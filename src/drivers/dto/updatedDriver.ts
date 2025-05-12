import { PartialType } from '@nestjs/mapped-types';
import { CreateDriverDTO } from './createDriver';
import { IsOptional } from 'class-validator';

export class UpdateDriverDTO extends PartialType(CreateDriverDTO) {
    @IsOptional()
    email?: string;

    @IsOptional()
    firstName?: string;

    @IsOptional()
    lastName?: string;

    @IsOptional()
    phoneNumber?: string;

    @IsOptional()
    password?: string;
}