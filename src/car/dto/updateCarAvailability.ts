import { IsNotEmpty } from "class-validator";

export class UpdateCarAvailabilityDto {
    @IsNotEmpty()
    status: 'active' | 'inactive' | 'under_maintenance';
}