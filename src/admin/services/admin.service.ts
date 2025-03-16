import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from '../../entities/admin.entity';
import { Repository } from 'typeorm';
import { CreateAdminDTO } from '../dto/createAdmin';

@Injectable()
export class AdminService {
  activateAccount(email: string) {
    throw new Error('Method not implemented.');
  }
  @InjectRepository(Admin)
  private readonly adminRepository: Repository<Admin>;

  public async findOneByEmail(email: string): Promise<Admin> {
    return await this.adminRepository.findOneBy({ email });
  }

  public async findOneByIdentifier(identifier: string): Promise<Admin> {
    return await this.adminRepository.findOneBy({ identifier });
  }

  public async create(payload: CreateAdminDTO): Promise<Admin> {
    const { email, password, firstName, lastName } = payload;
    const newAdmin = this.adminRepository.create();

    newAdmin.email = email;
    newAdmin.password = password;
    newAdmin.firstName = firstName;
    newAdmin.lastName = lastName;

    return await this.adminRepository.save(newAdmin);
  }
}
