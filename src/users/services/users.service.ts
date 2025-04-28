import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import User from '../../entities/users.entity';
import { Repository } from 'typeorm';
import { CreateUserDTO } from '../dto/createUser';

@Injectable()
export class UserService {
  @InjectRepository(User)
  private readonly userRepository: Repository<User>;

  public async findOneByEmail(email: string): Promise<User> {
    return await this.userRepository.findOneBy({ email });
  }

  public async findOneByIdentifier(matricNumber: string): Promise<User> {
    return await this.userRepository.findOneBy({ matricNumber });
  }

  public async create(payload: CreateUserDTO): Promise<User> {
    const { email, password, firstName, lastName, phoneNumber, matricNumber } =
      payload;
    const newUser = this.userRepository.create();

    newUser.email = email;
    newUser.password = password;
    newUser.firstName = firstName;
    newUser.lastName = lastName;
    newUser.phoneNumber = phoneNumber;
    newUser.matricNumber = matricNumber;

    return await this.userRepository.save(newUser);
  }
}
