import {isEmail, IsNotEmpty} from "class-validator";

export class LoginDriverDTO{
    @isEmail()
    email: string;

    @IsNotEmpty()
    password: string
}