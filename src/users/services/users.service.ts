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

  public async findOneByIdentifier(identifier: string): Promise<User> {
    return await this.userRepository.findOneBy({ identifier });
  }

  public async findOneByMatricNumber(matricNumber: string): Promise<User> {
    return await this.userRepository.findOneBy({ matricNumber });
  }

  public async create(payload: CreateUserDTO): Promise<User> {
    const { email, password, firstName, lastName, phoneNumber, matricNumber, isStudent } =
      payload;
    const newUser = this.userRepository.create();

    newUser.email = email;
    newUser.password = password;
    newUser.firstName = firstName;
    newUser.lastName = lastName;
    newUser.phoneNumber = phoneNumber;
    newUser.isStudent = isStudent;

    // Only set matricNumber if it's provided and user is a student
    if (isStudent && matricNumber) {
      newUser.matricNumber = matricNumber;
    }
    // For non-students, matricNumber will remain null/undefined

    return await this.userRepository.save(newUser);
  }
}
