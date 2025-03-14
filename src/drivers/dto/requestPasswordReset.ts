import {isEmail, IsNotEmpty} from "class-validator";

export class RequestPasswordResetDTO {
    @IsNotEmpty()
    @isEmail()
    email: string;
}