import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Driver from '../../entities/driver.entity';
import { Repository } from 'typeorm';
import { CreateDriverDTO } from '../dto/createDriver';

@Injectable()
export class DriverService {
  @InjectRepository(Driver)
  private readonly driverRepository: Repository<Driver>;

  public async findOneByEmail(email: string, phone?: string): Promise<Driver> {
    return await this.driverRepository.findOneBy({ email });
  }

  public async findOneByIdentifier(identifier: string): Promise<Driver> {
    return await this.driverRepository.findOneBy({ identifier });
  }

  public async create(payload: CreateDriverDTO): Promise<Driver> {
    const { email, password, firstName, lastName } = payload;
    const newDriver = this.driverRepository.create();

    newDriver.email = email;
    newDriver.password = password;
    newDriver.firstName = firstName;
    newDriver.lastName = lastName;

    return await this.driverRepository.save(newDriver);
  }
}
