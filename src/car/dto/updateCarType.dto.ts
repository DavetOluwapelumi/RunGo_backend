import { IsString, IsIn } from 'class-validator';
import { CarType } from '../../enums/carType.enum';

export class UpdateCarTypeDto {
    @IsString()
    @IsIn(Object.values(CarType))
    carType: CarType;
} 